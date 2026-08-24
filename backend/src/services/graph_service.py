"""
Neo4j graph persistence for the SIH investigation engine.

Responsibilities:
- upsert entity nodes
- upsert authoritative relationships
- persist provenance/evidence metadata
- return graph changes to the DFS orchestrator

This module deliberately does NOT:
- perform DFS
- call get_data()
- call entity_service
- call Gemini/LLMs
"""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any, Iterable, Optional
from uuid import UUID

from neo4j import Driver

from src.models.neo4j import get_driver


# Safe, explicit mapping. Unknown entity types use the generic Entity label.
ENTITY_LABELS = {
    "PERSON": "Person",
    "PHONE": "Phone",
    "VEHICLE": "Vehicle",
    "LOCATION": "Location",
    "CASE": "Case",
    "TRANSACTION": "Transaction",
    "ORGANIZATION": "Organization",
    "ACCOUNT": "Account",
    "EVENT": "Event",
}


def _neo4j_scalar(value: Any) -> Any:
    """Convert common PostgreSQL/Python values into Neo4j property values."""
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, (UUID, Decimal)):
        return str(value)
    return None


def _as_properties(entity: dict[str, Any]) -> dict[str, Any]:
    """
    Convert an entity-service entity into Neo4j-safe scalar/map properties.

    Neo4j properties cannot contain arbitrary nested Python dicts/lists in
    the same way as application metadata, so only scalar values are stored
    directly. The complete normalized entity remains in the DFS result.
    """
    props: dict[str, Any] = {}

    for key in ("entity_id", "entity_type", "canonical_name", "status"):
        value = entity.get(key)
        if value is not None:
            props[key] = str(value) if key == "entity_id" else value

    metadata = entity.get("metadata") or {}
    if isinstance(metadata, dict):
        for key, value in metadata.items():
            if key.startswith("_") or key in props:
                continue
            converted = _neo4j_scalar(value)
            if converted is not None:
                props[key] = converted

    return props


def _relationship_properties(rel: dict[str, Any]) -> dict[str, Any]:
    """Return only Neo4j-compatible scalar relationship properties."""
    allowed = (
        "relationship_id",
        "relationship_type",
        "relationship_status",
        "confidence",
        "source_record_id",
        "valid_from",
        "valid_to",
        "first_seen",
        "last_seen",
    )
    props: dict[str, Any] = {}
    for key in allowed:
        value = rel.get(key)
        converted = _neo4j_scalar(value)
        if converted is not None:
            props[key] = converted
    return props


class GraphService:
    """
    Thin Neo4j adapter.

    A driver is injected for tests; production defaults to get_driver().
    """

    def __init__(self, driver: Optional[Driver] = None):
        self.driver = driver or get_driver()

    def upsert_entity(self, entity: dict[str, Any]) -> dict[str, Any]:
        entity_id = str(entity["entity_id"])
        entity_type = str(entity.get("entity_type") or "UNKNOWN").upper()
        label = ENTITY_LABELS.get(entity_type, "Entity")
        props = _as_properties(entity)

        # Only the primary entity has authoritative type information in the
        # current entity_service contract. Neighbor types may be inferred from
        # relationship types and can therefore be wrong (e.g. USED does not
        # prove the neighbor is a PHONE). DFS marks authoritative entities.
        authoritative = bool(entity.get("_authoritative_entity_type"))
        label = ENTITY_LABELS.get(entity_type, "Entity") if authoritative else "Entity"

        label_query = f"""
        MERGE (n:Entity {{entity_id: $entity_id}})
        SET n += $props
        SET n.entity_type = $entity_type
        SET n:{label}
        RETURN n.entity_id AS entity_id
        """

        with self.driver.session() as session:
            record = session.run(
                label_query,
                entity_id=entity_id,
                entity_type=entity_type,
                props=props,
            ).single()

        return {
            "entity_id": record["entity_id"] if record else entity_id,
            "label": label,
        }

    def upsert_relationship(self, relationship: dict[str, Any]) -> dict[str, Any]:
        """
        Upsert an authoritative edge by PostgreSQL relationship_id.

        Neo4j uses a fixed :RELATIONSHIP type because relationship types are
        source-controlled VARCHAR data and must not be interpolated into
        Cypher. The original relationship_type is preserved as a property,
        so USED remains USED, CALLED_PERSON remains CALLED_PERSON, etc.
        """
        relationship_id = relationship.get("relationship_id")
        from_id = relationship.get("from_entity_id")
        to_id = relationship.get("to_entity_id")

        if not relationship_id or not from_id or not to_id:
            raise ValueError(
                "Relationship requires relationship_id, from_entity_id and "
                "to_entity_id"
            )

        props = _relationship_properties(relationship)

        query = """
        MATCH (a:Entity {entity_id: $from_entity_id})
        MATCH (b:Entity {entity_id: $to_entity_id})
        MERGE (a)-[r:RELATIONSHIP {relationship_id: $relationship_id}]->(b)
        SET r += $props
        RETURN
            r.relationship_id AS relationship_id,
            a.entity_id AS from_entity_id,
            b.entity_id AS to_entity_id
        """

        with self.driver.session() as session:
            record = session.run(
                query,
                from_entity_id=str(from_id),
                to_entity_id=str(to_id),
                relationship_id=str(relationship_id),
                props=props,
            ).single()

        return {
            "relationship_id": (
                record["relationship_id"] if record else str(relationship_id)
            ),
            "from_entity_id": (
                record["from_entity_id"] if record else str(from_id)
            ),
            "to_entity_id": record["to_entity_id"] if record else str(to_id),
        }

    def add_entities_and_relationships(
        self,
        entities: Iterable[dict[str, Any]],
        relationships: Iterable[dict[str, Any]],
        *,
        primary_entity: Optional[dict[str, Any]] = None,
    ) -> dict[str, list[dict[str, Any]]]:
        """
        Persist one normalized extraction in a single Neo4j transaction.

        Entity nodes are written first, then relationships. If any write
        fails, the transaction is rolled back instead of leaving a partial
        extraction in the graph.
        """
        entities_list = list(entities)
        relationships_list = list(relationships)

        if primary_entity and primary_entity.get("entity_id"):
            primary_id = str(primary_entity["entity_id"])
            if not any(str(e.get("entity_id")) == primary_id for e in entities_list):
                primary_copy = {
                    "entity_id": primary_id,
                    "entity_type": primary_entity.get("entity_type"),
                    "canonical_name": primary_entity.get("canonical_name"),
                    "_authoritative_entity_type": True,
                }
                entities_list.insert(0, primary_copy)

        # Neo4j relationship MERGE requires endpoint nodes. The graph
        # extraction always includes the primary node, while neighbors are
        # included by the entity_service output.
        def _write(tx):
            node_results = []
            for entity in entities_list:
                entity_id = str(entity["entity_id"])
                entity_type = str(entity.get("entity_type") or "UNKNOWN").upper()
                props = _as_properties(entity)
                authoritative = bool(entity.get("_authoritative_entity_type"))
                label = (
                    ENTITY_LABELS.get(entity_type, "Entity")
                    if authoritative
                    else "Entity"
                )

                query = f"""
                MERGE (n:Entity {{entity_id: $entity_id}})
                SET n += $props
                SET n.entity_type = $entity_type
                SET n:{label}
                RETURN n.entity_id AS entity_id
                """
                record = tx.run(
                    query,
                    entity_id=entity_id,
                    entity_type=entity_type,
                    props=props,
                ).single()
                node_results.append({
                    "entity_id": record["entity_id"] if record else entity_id,
                    "label": label,
                })

            edge_results = []
            for relationship in relationships_list:
                relationship_id = relationship.get("relationship_id")
                from_id = relationship.get("from_entity_id")
                to_id = relationship.get("to_entity_id")
                if not relationship_id or not from_id or not to_id:
                    raise ValueError(
                        "Relationship requires relationship_id, from_entity_id "
                        "and to_entity_id"
                    )

                query = """
                MATCH (a:Entity {entity_id: $from_entity_id})
                MATCH (b:Entity {entity_id: $to_entity_id})
                MERGE (a)-[r:RELATIONSHIP {relationship_id: $relationship_id}]->(b)
                SET r += $props
                RETURN
                    r.relationship_id AS relationship_id,
                    a.entity_id AS from_entity_id,
                    b.entity_id AS to_entity_id
                """
                record = tx.run(
                    query,
                    from_entity_id=str(from_id),
                    to_entity_id=str(to_id),
                    relationship_id=str(relationship_id),
                    props=_relationship_properties(relationship),
                ).single()
                edge_results.append({
                    "relationship_id": (
                        record["relationship_id"]
                        if record else str(relationship_id)
                    ),
                    "from_entity_id": (
                        record["from_entity_id"] if record else str(from_id)
                    ),
                    "to_entity_id": (
                        record["to_entity_id"] if record else str(to_id)
                    ),
                })

            return node_results, edge_results

        with self.driver.session() as session:
            with session.begin_transaction() as tx:
                node_results, edge_results = _write(tx)
                tx.commit()

        return {"nodes": node_results, "edges": edge_results}

    def get_investigation_graph(
        self, entity_ids: Optional[Iterable[str]] = None
    ) -> dict[str, list[dict[str, Any]]]:
        """Return the persisted graph, optionally restricted to entity IDs."""
        ids = [str(x) for x in entity_ids] if entity_ids is not None else None

        if ids:
            query = """
            MATCH (n:Entity)
            WHERE n.entity_id IN $entity_ids
            OPTIONAL MATCH (n)-[r:RELATIONSHIP]->(m:Entity)
            RETURN
                collect(DISTINCT n{.*}) AS nodes,
                collect(DISTINCT CASE WHEN r IS NULL THEN NULL
                    ELSE r{.*, from_entity_id: n.entity_id,
                                 to_entity_id: m.entity_id}
                END) AS edges
            """
            params = {"entity_ids": ids}
        else:
            query = """
            MATCH (n:Entity)
            OPTIONAL MATCH (n)-[r:RELATIONSHIP]->(m:Entity)
            RETURN
                collect(DISTINCT n{.*}) AS nodes,
                collect(DISTINCT CASE WHEN r IS NULL THEN NULL
                    ELSE r{.*, from_entity_id: n.entity_id,
                                 to_entity_id: m.entity_id}
                END) AS edges
            """
            params = {}

        with self.driver.session() as session:
            record = session.run(query, **params).single()

        if not record:
            return {"nodes": [], "edges": []}

        return {
            "nodes": [n for n in record["nodes"] if n is not None],
            "edges": [e for e in record["edges"] if e is not None],
        }


# Convenience functions for callers that prefer module-level operations.
_default_service: Optional[GraphService] = None


def get_graph_service() -> GraphService:
    global _default_service
    if _default_service is None:
        _default_service = GraphService()
    return _default_service
