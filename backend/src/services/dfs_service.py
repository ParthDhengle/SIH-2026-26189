"""
Depth-limited iterative DFS investigation engine.

Dependency direction:
    DFS -> get_data -> entity_service -> graph_service -> Neo4j

No Python recursion, no LLM traversal decisions, no FastAPI/WebSocket
coupling.
"""
from __future__ import annotations

import logging
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable, Optional

from src.services.data_ingestion.get_data import get_data
from src.services.entity_service import extract_entities
from src.services.graph_service import GraphService, get_graph_service


logger = logging.getLogger(__name__)

MAX_DEPTH = 8

EventCallback = Callable[[dict[str, Any]], None]


@dataclass(slots=True)
class QueryContext:
    session_id: str
    case_id: Optional[str]
    original_query: str
    clarified_query: Optional[str]
    seed_entity_ids: list[str]
    target_entity_ids: list[str] = field(default_factory=list)
    max_depth: int = MAX_DEPTH

    def __post_init__(self) -> None:
        self.seed_entity_ids = [str(x) for x in self.seed_entity_ids]
        self.target_entity_ids = [str(x) for x in self.target_entity_ids]
        self.max_depth = max(0, min(int(self.max_depth), MAX_DEPTH))

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class InvestigationState:
    query_context: QueryContext
    stack: list[tuple[str, int]]
    visited: set[str] = field(default_factory=set)
    discovered_entities: dict[str, dict[str, Any]] = field(default_factory=dict)
    processed_entities: list[str] = field(default_factory=list)
    current_depth: int = 0
    depth_reached: int = 0
    status: str = "PENDING"

    @classmethod
    def create(cls, query_context: QueryContext) -> "InvestigationState":
        return cls(
            query_context=query_context,
            stack=[
                (str(entity_id), 0)
                for entity_id in reversed(query_context.seed_entity_ids)
            ],
        )


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _emit(
    events: list[dict[str, Any]],
    callback: Optional[EventCallback],
    *,
    event_type: str,
    context: QueryContext,
    depth: int,
    **payload: Any,
) -> None:
    event = {
        "type": event_type,
        "session_id": context.session_id,
        "depth": depth,
        "timestamp": _now(),
        **payload,
    }
    events.append(event)
    if callback is not None:
        callback(event)


def _candidate_ids_in_stack(stack: list[tuple[str, int]]) -> set[str]:
    return {str(entity_id) for entity_id, _ in stack}


def _add_candidate(
    state: InvestigationState,
    candidate: dict[str, Any],
) -> bool:
    entity_id = candidate.get("entity_id")
    if not entity_id:
        return False

    entity_id = str(entity_id)
    next_depth = int(candidate.get("depth", state.current_depth + 1))
    max_depth = state.query_context.max_depth

    if entity_id in state.visited:
        return False

    if next_depth > max_depth:
        return False

    if entity_id in _candidate_ids_in_stack(state.stack):
        return False

    state.stack.append((entity_id, next_depth))
    return True


def _record_discovered(
    state: InvestigationState,
    extracted: dict[str, Any],
) -> None:
    primary = dict(extracted.get("primary_entity") or {})
    if primary.get("entity_id"):
        primary["_authoritative_entity_type"] = True
        state.discovered_entities[str(primary["entity_id"])] = primary

    for entity in extracted.get("entities") or []:
        entity_id = entity.get("entity_id")
        if entity_id:
            state.discovered_entities[str(entity_id)] = entity


def _node_for_event(entity: dict[str, Any]) -> dict[str, Any]:
    return {
        "entity_id": str(entity.get("entity_id")),
        "entity_type": entity.get("entity_type"),
        "canonical_name": entity.get("canonical_name"),
    }


def run_investigation(
    query_context: QueryContext,
    *,
    graph_service: Optional[GraphService] = None,
    get_data_fn: Callable[[str], dict[str, Any]] = get_data,
    extract_fn: Callable[[dict[str, Any], Optional[dict[str, Any]]], dict[str, Any]] = extract_entities,
    on_event: Optional[EventCallback] = None,
) -> dict[str, Any]:
    """
    Execute one independent iterative DFS investigation.

    The supplied QueryContext is copied into each extraction context; the
    original query/targets/case scope therefore remain unchanged throughout.
    """
    state = InvestigationState.create(query_context)
    events: list[dict[str, Any]] = []
    discovered_relationships: dict[str, dict[str, Any]] = {}
    last_depth: Optional[int] = None

    graph = graph_service or get_graph_service()
    state.status = "RUNNING"
    logger.info("[INVESTIGATION] Started | session=%s", query_context.session_id)

    _emit(
        events,
        on_event,
        event_type="investigation_started",
        context=query_context,
        depth=0,
        query=query_context.original_query,
        clarified_query=query_context.clarified_query,
        case_id=query_context.case_id,
        seed_entity_ids=list(query_context.seed_entity_ids),
        target_entity_ids=list(query_context.target_entity_ids),
        max_depth=query_context.max_depth,
    )

    try:
        while state.stack:
            entity_id, depth = state.stack.pop()
            logger.info("[DFS] Stack size: %s", len(state.stack))

            if entity_id in state.visited:
                continue

            # Defensive boundary check. Candidates are already filtered at
            # push time, but the pop-time rule is authoritative.
            if depth > query_context.max_depth:
                continue

            state.current_depth = depth
            state.depth_reached = max(state.depth_reached, depth)

            if last_depth != depth:
                _emit(
                    events,
                    on_event,
                    event_type="depth_changed",
                    context=query_context,
                    depth=depth,
                    max_depth=query_context.max_depth,
                )
                last_depth = depth

            state.visited.add(entity_id)

            _emit(
                events,
                on_event,
                event_type="entity_processing",
                context=query_context,
                depth=depth,
                entity_id=entity_id,
            )
            logger.info("[DFS] Processing %s | depth=%s", entity_id, depth)

            data = get_data_fn(entity_id)
            logger.info("[DFS] get_data completed | entity=%s", entity_id)

            if data.get("error") == "ENTITY_NOT_FOUND":
                # The entity ID was a traversal candidate, but PostgreSQL is
                # authoritative. Do not create a graph node for a missing row.
                _emit(
                    events,
                    on_event,
                    event_type="entity_completed",
                    context=query_context,
                    depth=depth,
                    entity_id=entity_id,
                    error="ENTITY_NOT_FOUND",
                )
                continue

            extraction_context = query_context.to_dict()
            extraction_context.update(
                {
                    "current_depth": depth,
                    "visited": set(state.visited),
                }
            )

            extracted = extract_fn(data, extraction_context)
            logger.info("[DFS] Entity extraction completed | entity=%s", entity_id)
            logger.info("[DFS] Entity resolution completed | entity=%s", entity_id)

            _record_discovered(state, extracted)

            entities = list(extracted.get("entities") or [])
            primary = extracted.get("primary_entity") or {}
            relationships = list(extracted.get("relationships") or [])

            # The primary entity is part of the graph even when there are no
            # neighbors. This is the real PostgreSQL entity, not a fake node.
            if primary.get("entity_id"):
                graph_entities = [
                    {
                        "entity_id": str(primary["entity_id"]),
                        "entity_type": primary.get("entity_type"),
                        "canonical_name": primary.get("canonical_name"),
                        "_authoritative_entity_type": True,
                    }
                ]
                known = {str(e.get("entity_id")) for e in graph_entities}
                graph_entities.extend(
                    e for e in entities if str(e.get("entity_id")) not in known
                )
            else:
                graph_entities = entities

            graph_result = graph.add_entities_and_relationships(
                graph_entities,
                relationships,
                primary_entity=primary,
            )
            graph_nodes_count = len(graph_entities)
            graph_edges_count = len(relationships)
            if isinstance(graph_result, dict):
                graph_nodes_count = len(graph_result.get("nodes") or graph_entities)
                graph_edges_count = len(graph_result.get("edges") or relationships)
            logger.info(
                "[GRAPH] Added %s nodes and %s relationships",
                graph_nodes_count,
                graph_edges_count,
            )

            _emit(
                events,
                on_event,
                event_type="node_added",
                context=query_context,
                depth=depth,
                node=_node_for_event(primary),
            )

            for entity in entities:
                entity_id_value = entity.get("entity_id")
                if not entity_id_value:
                    continue
                if str(entity_id_value) == str(primary.get("entity_id")):
                    continue
                _emit(
                    events,
                    on_event,
                    event_type="node_added",
                    context=query_context,
                    depth=depth,
                    node=_node_for_event(entity),
                )

            for relationship in relationships:
                rid = relationship.get("relationship_id")
                key = str(
                    rid
                    or (
                        relationship.get("from_entity_id"),
                        relationship.get("to_entity_id"),
                        relationship.get("relationship_type"),
                        relationship.get("source_record_id"),
                    )
                )
                discovered_relationships[key] = dict(relationship)

                _emit(
                    events,
                    on_event,
                    event_type="edge_added",
                    context=query_context,
                    depth=depth,
                    edge={
                        "relationship_id": relationship.get("relationship_id"),
                        "from_entity_id": relationship.get("from_entity_id"),
                        "to_entity_id": relationship.get("to_entity_id"),
                        "relationship_type": relationship.get("relationship_type"),
                        "relationship_status": relationship.get("relationship_status"),
                        "confidence": relationship.get("confidence"),
                        "source_record_id": relationship.get("source_record_id"),
                    },
                )

            # Depth 8 is processed and persisted, but never expanded.
            if depth < query_context.max_depth:
                candidates = extracted.get("stack_candidates") or []
                # The stack is LIFO. Reverse the service's candidate order so
                # its priority ordering (targets first) is preserved at pop.
                pushed_count = 0
                for candidate in reversed(candidates):
                    if _add_candidate(state, candidate):
                        pushed_count += 1
                        logger.info(
                            "[DFS] Pushed %s | depth=%s",
                            candidate["entity_id"],
                            candidate.get("depth", depth + 1),
                        )
                logger.info("[DFS] Pushed %s entities", pushed_count)
            else:
                logger.info("[DFS] Maximum depth reached | depth=%s", depth)

            state.processed_entities.append(entity_id)

            _emit(
                events,
                on_event,
                event_type="entity_completed",
                context=query_context,
                depth=depth,
                entity_id=entity_id,
                discovered_count=len(entities),
                relationship_count=len(relationships),
                stack_size=len(state.stack),
            )

        state.status = "COMPLETED"
        logger.info("[DFS] Stack empty")
        logger.info("[DFS] Traversal completed")
        logger.info("[INVESTIGATION] DFS COMPLETED")

        _emit(
            events,
            on_event,
            event_type="dfs_completed",
            context=query_context,
            depth=state.depth_reached,
            visited_count=len(state.visited),
            discovered_count=len(state.discovered_entities),
        )

        return {
            "status": state.status,
            "session_id": query_context.session_id,
            "case_id": query_context.case_id,
            "query": query_context.original_query,
            "clarified_query": query_context.clarified_query,
            "entities_discovered": list(state.discovered_entities.values()),
            "relationships_discovered": list(discovered_relationships.values()),
            "visited_entity_ids": list(state.visited),
            "processed_entity_ids": list(state.processed_entities),
            "max_depth": query_context.max_depth,
            "depth_reached": state.depth_reached,
            "events": events,
            "query_context": query_context.to_dict(),
        }

    except Exception as exc:
        state.status = "ERROR"
        logger.exception("[DFS] Investigation failed")

        _emit(
            events,
            on_event,
            event_type="investigation_error",
            context=query_context,
            depth=state.current_depth,
            error=str(exc),
        )

        return {
            "status": "ERROR",
            "session_id": query_context.session_id,
            "case_id": query_context.case_id,
            "query": query_context.original_query,
            "clarified_query": query_context.clarified_query,
            "entities_discovered": list(state.discovered_entities.values()),
            "relationships_discovered": list(discovered_relationships.values()),
            "visited_entity_ids": list(state.visited),
            "processed_entity_ids": list(state.processed_entities),
            "max_depth": query_context.max_depth,
            "depth_reached": state.depth_reached,
            "events": events,
            "query_context": query_context.to_dict(),
            "error": str(exc),
        }


def _dedupe_relationships(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Extract unique relationship payloads from edge_added events."""
    result: list[dict[str, Any]] = []
    seen: set[str] = set()

    for event in events:
        if event.get("type") != "edge_added":
            continue
        edge = event.get("edge") or {}
        key = str(
            edge.get("relationship_id")
            or (
                edge.get("from_entity_id"),
                edge.get("to_entity_id"),
                edge.get("relationship_type"),
                edge.get("source_record_id"),
            )
        )
        if key in seen:
            continue
        seen.add(key)
        result.append(edge)

    return result
