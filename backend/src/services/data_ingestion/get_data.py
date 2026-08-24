"""
get_data(entity_id) — single entry point used by the DFS investigation engine.

Behaviour contracts (from initial_data_layer_schema.md §8):
- Never invent entities.
- Empty lists when no data exists.
- Always return both-direction entity_relationships.
- Preserve source_record_id, confidence, relationship_type, timestamps.
- ENTITY_NOT_FOUND when the seed entity does not exist (no exception).
"""

from __future__ import annotations

from typing import Any, Optional
from uuid import UUID

from psycopg2.extensions import connection as PgConnection

import src.services.data_ingestion.repository as repo
from src.utils.db import get_db_connection
from src.schema.data import GetDataResponse


def _empty_result(entity_id: str, error: Optional[str] = None) -> dict[str, Any]:
    return {
        "entity_id": entity_id,
        "error": error,
        "entity": None,
        "person": None,
        "phone": None,
        "vehicle": None,
        "location": None,
        "organization": None,
        "case": None,
        "transaction": None,
        "identity": [],
        "phones": [],
        "vehicles": [],
        "calls": [],
        "transactions": [],
        "locations": [],
        "cases": [],
        "events": [],
        "location_events": [],
        "vehicle_events": [],
        "seed_entities": [],
        "relationships": [],
        "evidence": [],
    }


def get_data(entity_id: str | UUID, conn: Optional[PgConnection] = None) -> dict[str, Any]:
    """
    Fetch everything directly known about one entity.

    Parameters
    ----------
    entity_id : str | UUID
        The entities.entity_id to expand.
    conn : optional open psycopg2 connection.
        If omitted, a short-lived connection is opened and closed.

    Returns
    -------
    dict matching GetDataResponse shape.
    """
    eid = str(entity_id)

    def _run(c: PgConnection) -> dict[str, Any]:
        entity = repo.get_entity(c, eid)
        if not entity:
            return _empty_result(eid, error="ENTITY_NOT_FOUND")

        result = _empty_result(eid)
        result["entity"] = entity
        entity_type = entity["entity_type"]

        # ------------------------------------------------------------------
        # Type-specific enrichment
        # ------------------------------------------------------------------
        if entity_type == "PERSON":
            person = repo.get_person_by_entity(c, eid)
            if person:
                result["person"] = person
                pid = person["person_id"]
                result["identity"] = repo.get_person_identifiers(c, pid)
                result["phones"] = repo.get_person_phones(c, pid)
                result["vehicles"] = repo.get_vehicles_owned(c, pid)
                result["cases"] = repo.get_cases_for_person(c, pid)
            result["events"] = repo.get_events_for_entity(c, eid)

        elif entity_type == "PHONE":
            phone = repo.get_phone_by_entity(c, eid)
            if phone:
                result["phone"] = phone
                result["calls"] = repo.get_calls_for_phone(c, phone["phone_id"])
            result["location_events"] = repo.get_location_events_for_entity(c, eid)
            result["events"] = repo.get_events_for_entity(c, eid)

        elif entity_type == "VEHICLE":
            vehicle = repo.get_vehicle_by_entity(c, eid)
            if vehicle:
                result["vehicle"] = vehicle
                vid = vehicle["vehicle_id"]
                owners = repo.get_vehicle_owners(c, vid)
                result["vehicle_events"] = repo.get_vehicle_events(c, vid)
                # owners surfaced for DFS convenience; edges also live in relationships
                result["seed_entities"] = owners
            result["location_events"] = repo.get_location_events_for_entity(c, eid)
            result["events"] = repo.get_events_for_entity(c, eid)

        elif entity_type == "LOCATION":
            location = repo.get_location_by_entity(c, eid)
            if location:
                result["location"] = location
                result["location_events"] = repo.get_location_events(
                    c, location["location_id"]
                )
            result["events"] = repo.get_events_for_entity(c, eid)

        elif entity_type == "CASE":
            case = repo.get_case_by_entity(c, eid)
            if case:
                result["case"] = case
                result["events"] = repo.get_events_for_case(c, case["case_id"])
                result["seed_entities"] = repo.get_seed_entities_for_case(
                    c, case["case_id"]
                )

        elif entity_type == "TRANSACTION":
            tx = repo.get_transaction_by_entity(c, eid)
            if tx:
                result["transaction"] = tx
                result["transactions"] = [tx]

        elif entity_type == "ORGANIZATION":
            org = repo.get_organization_by_entity(c, eid)
            if org:
                result["organization"] = org
                result["evidence"] = repo.get_source_records_for_org(
                    c, org["organization_id"]
                )

        elif entity_type == "ACCOUNT":
            # schema supports ACCOUNT; no dedicated detail table yet
            result["events"] = repo.get_events_for_entity(c, eid)

        elif entity_type == "EVENT":
            result["events"] = repo.get_events_for_entity(c, eid)

        # ------------------------------------------------------------------
        # Generic (always)
        # ------------------------------------------------------------------
        result["relationships"] = repo.get_entity_relationships(c, eid)

        # evidence: merge type-specific (already set for ORG) with generic collector
        generic_evidence = repo.get_evidence_for_entity(c, eid)
        if result["evidence"]:
            # dedupe by source_record_id
            seen = {e["source_record_id"] for e in result["evidence"]}
            for e in generic_evidence:
                if e["source_record_id"] not in seen:
                    result["evidence"].append(e)
        else:
            result["evidence"] = generic_evidence

        return result

    if conn is not None:
        return _run(conn)

    with get_db_connection() as c:
        return _run(c)


def get_data_validated(entity_id: str | UUID, conn: Optional[PgConnection] = None) -> GetDataResponse:
    """Same as get_data but returns a validated Pydantic model."""
    raw = get_data(entity_id, conn=conn)
    return GetDataResponse.model_validate(raw)
