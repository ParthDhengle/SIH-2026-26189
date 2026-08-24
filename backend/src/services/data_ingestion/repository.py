"""
Raw SQL data-access layer for get_data().
All queries follow initial_data_layer_schema.md exactly.
No ORM. Empty lists returned when nothing is found.
"""

from __future__ import annotations

from typing import Any, Optional
import json
from uuid import UUID

from psycopg2.extensions import connection as PgConnection

from src.utils.db import fetch_all, fetch_one
from psycopg2.extras import Json


# ---------------------------------------------------------------------------
# Core entity
# ---------------------------------------------------------------------------

def get_entity(conn: PgConnection, entity_id: str | UUID) -> Optional[dict[str, Any]]:
    return fetch_one(
        conn,
        """
        SELECT entity_id, entity_type, canonical_name, status,
               merged_into_entity_id, created_at, updated_at
        FROM entities
        WHERE entity_id = %s
        """,
        (str(entity_id),),
    )


# ---------------------------------------------------------------------------
# PERSON
# ---------------------------------------------------------------------------

def get_person_by_entity(conn: PgConnection, entity_id: str | UUID) -> Optional[dict[str, Any]]:
    return fetch_one(
        conn,
        """
        SELECT person_id, entity_id, full_name, date_of_birth, gender,
               address, city, state, occupation, nationality, alive_status,
               created_at, updated_at
        FROM persons
        WHERE entity_id = %s
        """,
        (str(entity_id),),
    )


def get_person_identifiers(conn: PgConnection, person_id: str | UUID) -> list[dict[str, Any]]:
    return fetch_all(
        conn,
        """
        SELECT identifier_id, person_id, document_type, document_number_hash,
               document_last4, issuing_authority, verification_status,
               verified_at, source_record_id, created_at
        FROM person_identifiers
        WHERE person_id = %s
        """,
        (str(person_id),),
    )


def get_person_phones(conn: PgConnection, person_id: str | UUID) -> list[dict[str, Any]]:
    """Phones linked via person_phones junction (preserves relationship metadata)."""
    return fetch_all(
        conn,
        """
        SELECT p.phone_id, p.entity_id, p.phone_number_hash, p.phone_last4,
               p.country_code, p.carrier, p.status, p.created_at, p.updated_at,
               pp.relationship_type, pp.valid_from, pp.valid_to,
               pp.source_record_id, pp.confidence
        FROM person_phones pp
        JOIN phones p ON p.phone_id = pp.phone_id
        WHERE pp.person_id = %s
        """,
        (str(person_id),),
    )


def get_vehicles_owned(conn: PgConnection, person_id: str | UUID) -> list[dict[str, Any]]:
    return fetch_all(
        conn,
        """
        SELECT v.vehicle_id, v.entity_id, v.registration_number, v.vehicle_type,
               v.make, v.model, v.color, v.registration_date, v.registration_status,
               v.created_at, v.updated_at,
               vo.ownership_type, vo.valid_from, vo.valid_to,
               vo.source_record_id, vo.confidence
        FROM vehicle_owners vo
        JOIN vehicles v ON v.vehicle_id = vo.vehicle_id
        WHERE vo.person_id = %s
        """,
        (str(person_id),),
    )


def get_cases_for_person(conn: PgConnection, person_id: str | UUID) -> list[dict[str, Any]]:
    """Cases where this person appears as a seed entity (via entities → case_seed_entities)."""
    return fetch_all(
        conn,
        """
        SELECT c.case_id, c.entity_id, c.case_number, c.case_type, c.title,
               c.description, c.incident_time, c.incident_location_id, c.status,
               c.created_by, c.created_at, c.updated_at,
               cse.role
        FROM case_seed_entities cse
        JOIN cases c ON c.case_id = cse.case_id
        JOIN persons p ON p.entity_id = cse.entity_id
        WHERE p.person_id = %s
        """,
        (str(person_id),),
    )


# ---------------------------------------------------------------------------
# PHONE
# ---------------------------------------------------------------------------

def get_phone_by_entity(conn: PgConnection, entity_id: str | UUID) -> Optional[dict[str, Any]]:
    return fetch_one(
        conn,
        """
        SELECT phone_id, entity_id, phone_number_hash, phone_last4,
               country_code, carrier, status, created_at, updated_at
        FROM phones
        WHERE entity_id = %s
        """,
        (str(entity_id),),
    )


def get_calls_for_phone(conn: PgConnection, phone_id: str | UUID) -> list[dict[str, Any]]:
    return fetch_all(
        conn,
        """
        SELECT call_id, source_record_id, caller_phone_id, receiver_phone_id,
               call_type, start_time, end_time, duration_seconds, call_status,
               cell_tower_location_id, created_at
        FROM call_records
        WHERE caller_phone_id = %s OR receiver_phone_id = %s
        ORDER BY start_time DESC NULLS LAST
        """,
        (str(phone_id), str(phone_id)),
    )


# ---------------------------------------------------------------------------
# VEHICLE
# ---------------------------------------------------------------------------

def get_vehicle_by_entity(conn: PgConnection, entity_id: str | UUID) -> Optional[dict[str, Any]]:
    return fetch_one(
        conn,
        """
        SELECT vehicle_id, entity_id, registration_number, vehicle_type,
               make, model, color, registration_date, registration_status,
               created_at, updated_at
        FROM vehicles
        WHERE entity_id = %s
        """,
        (str(entity_id),),
    )


def get_vehicle_owners(conn: PgConnection, vehicle_id: str | UUID) -> list[dict[str, Any]]:
    """Owners of a vehicle; returned as relationship-like rows for the DFS layer."""
    return fetch_all(
        conn,
        """
        SELECT vo.vehicle_owner_id, vo.vehicle_id, vo.person_id,
               vo.ownership_type, vo.valid_from, vo.valid_to,
               vo.source_record_id, vo.confidence,
               p.entity_id AS person_entity_id,
               p.full_name
        FROM vehicle_owners vo
        JOIN persons p ON p.person_id = vo.person_id
        WHERE vo.vehicle_id = %s
        """,
        (str(vehicle_id),),
    )


def get_vehicle_events(conn: PgConnection, vehicle_id: str | UUID) -> list[dict[str, Any]]:
    return fetch_all(
        conn,
        """
        SELECT vehicle_event_id, vehicle_id, event_type, location_id,
               event_time, description, source_record_id, created_at
        FROM vehicle_events
        WHERE vehicle_id = %s
        ORDER BY event_time DESC NULLS LAST
        """,
        (str(vehicle_id),),
    )


# ---------------------------------------------------------------------------
# LOCATION
# ---------------------------------------------------------------------------

def get_location_by_entity(conn: PgConnection, entity_id: str | UUID) -> Optional[dict[str, Any]]:
    return fetch_one(
        conn,
        """
        SELECT location_id, entity_id, location_name, address, area, city,
               district, state, country, latitude, longitude, location_type,
               created_at
        FROM locations
        WHERE entity_id = %s
        """,
        (str(entity_id),),
    )


def get_location_events(conn: PgConnection, location_id: str | UUID) -> list[dict[str, Any]]:
    return fetch_all(
        conn,
        """
        SELECT location_event_id, entity_id, location_id, event_type,
               event_time, end_time, accuracy, source_record_id, created_at
        FROM location_events
        WHERE location_id = %s
        ORDER BY event_time DESC NULLS LAST
        """,
        (str(location_id),),
    )


def get_location_events_for_entity(conn: PgConnection, entity_id: str | UUID) -> list[dict[str, Any]]:
    """Location events where this entity was the observed subject."""
    return fetch_all(
        conn,
        """
        SELECT location_event_id, entity_id, location_id, event_type,
               event_time, end_time, accuracy, source_record_id, created_at
        FROM location_events
        WHERE entity_id = %s
        ORDER BY event_time DESC NULLS LAST
        """,
        (str(entity_id),),
    )


# ---------------------------------------------------------------------------
# CASE
# ---------------------------------------------------------------------------

def get_case_by_entity(conn: PgConnection, entity_id: str | UUID) -> Optional[dict[str, Any]]:
    return fetch_one(
        conn,
        """
        SELECT case_id, entity_id, case_number, case_type, title, description,
               incident_time, incident_location_id, status, created_by,
               created_at, updated_at
        FROM cases
        WHERE entity_id = %s
        """,
        (str(entity_id),),
    )


def get_events_for_case(conn: PgConnection, case_id: str | UUID) -> list[dict[str, Any]]:
    return fetch_all(
        conn,
        """
        SELECT event_id, entity_id, event_type, event_time, location_id,
               case_id, description, source_record_id, created_at
        FROM events
        WHERE case_id = %s
        ORDER BY event_time DESC NULLS LAST
        """,
        (str(case_id),),
    )


def get_seed_entities_for_case(conn: PgConnection, case_id: str | UUID) -> list[dict[str, Any]]:
    return fetch_all(
        conn,
        """
        SELECT cse.id, cse.case_id, cse.entity_id, cse.role, cse.added_at,
               e.entity_type, e.canonical_name
        FROM case_seed_entities cse
        JOIN entities e ON e.entity_id = cse.entity_id
        WHERE cse.case_id = %s
        """,
        (str(case_id),),
    )


def get_case_context(conn: PgConnection, case_ref: str) -> Optional[dict[str, Any]]:
    """Resolve a public case number/id and return its authoritative seeds."""
    case = fetch_one(
        conn,
        """
        SELECT case_id, entity_id, case_number, case_type, title, description, status
        FROM cases
        WHERE case_number = %s OR case_id::text = %s
        LIMIT 1
        """,
        (case_ref, case_ref),
    )
    if not case:
        return None
    case["seed_entities"] = get_seed_entities_for_case(conn, case["case_id"])
    return case


def find_entities_by_query(conn: PgConnection, query: str) -> list[dict[str, Any]]:
    """Resolve mentioned entities by canonical name; IDs always come from PostgreSQL."""
    stop_words = {
        "about", "after", "and", "are", "connected", "connection", "explore",
        "from", "how", "investigate", "investigation", "is", "operation", "show",
        "the", "their", "this", "what", "which", "with",
    }
    tokens = [
        token.strip(".,?!:;()[]{}\"'")
        for token in query.casefold().split()
        if len(token.strip(".,?!:;()[]{}\"'")) >= 3
        and token.strip(".,?!:;()[]{}\"'") not in stop_words
    ]
    if not tokens:
        return []
    clauses = " OR ".join("canonical_name ILIKE %s" for _ in tokens)
    params = tuple(f"%{token}%" for token in tokens)
    return fetch_all(
        conn,
        f"""
        SELECT entity_id, entity_type, canonical_name, status
        FROM entities
        WHERE canonical_name IS NOT NULL AND ({clauses})
        ORDER BY entity_type, canonical_name
        LIMIT 20
        """,
        params,
    )


def create_case(
    conn: PgConnection,
    *,
    case_number: str,
    title: str,
    case_type: str,
    description: Optional[str],
    created_by: Optional[str],
) -> dict[str, Any]:
    """Create the case context entity and case row in one transaction."""
    entity = fetch_one(
        conn,
        """
        INSERT INTO entities (entity_type, canonical_name, status)
        VALUES ('CASE', %s, 'ACTIVE')
        RETURNING entity_id, entity_type, canonical_name, status
        """,
        (title,),
    )
    case = fetch_one(
        conn,
        """
        INSERT INTO cases (entity_id, case_number, case_type, title, description, created_by)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING case_id, entity_id, case_number, case_type, title, description, status
        """,
        (entity["entity_id"], case_number, case_type, title, description, created_by),
    )
    return case


def get_or_create_investigation_session(conn: PgConnection, session_id: str, case_id: str) -> dict[str, Any]:
    existing = fetch_one(conn, "SELECT session_id, case_id, status, created_at, updated_at FROM investigation_sessions WHERE session_id = %s", (session_id,))
    if existing:
        if str(existing["case_id"]) != str(case_id):
            raise ValueError("SESSION_CASE_MISMATCH")
        return existing
    return fetch_one(
        conn,
        """INSERT INTO investigation_sessions (session_id, case_id) VALUES (%s, %s)
           RETURNING session_id, case_id, status, created_at, updated_at""",
        (session_id, case_id),
    )


def touch_investigation_session(conn: PgConnection, session_id: str, status: str) -> None:
    conn.cursor().execute(
        "UPDATE investigation_sessions SET status = %s, updated_at = now() WHERE session_id = %s",
        (status, session_id),
    )


def add_investigation_message(conn: PgConnection, session_id: str, role: str, content: str) -> dict[str, Any]:
    return fetch_one(
        conn,
        """INSERT INTO investigation_messages (session_id, role, content) VALUES (%s, %s, %s)
           RETURNING message_id, session_id, role, content, created_at""",
        (session_id, role, content),
    )


def create_investigation_run(conn: PgConnection, session_id: str, query: str, clarified_query: Optional[str] = None) -> dict[str, Any]:
    return fetch_one(
        conn,
        """INSERT INTO investigation_runs (session_id, query, clarified_query, status)
           VALUES (%s, %s, %s, 'RUNNING') RETURNING run_id, session_id, query, clarified_query, status""",
        (session_id, query, clarified_query),
    )


def complete_investigation_run(conn: PgConnection, run_id: str, status: str, depth_reached: Optional[int], result: Optional[dict[str, Any]]) -> None:
    conn.cursor().execute(
        """UPDATE investigation_runs SET status = %s, depth_reached = %s, result = %s,
           completed_at = now() WHERE run_id = %s""",
        (status, depth_reached, Json(result) if result is not None else None, run_id),
    )


def add_investigation_finding(conn: PgConnection, run_id: str, finding: dict[str, Any]) -> None:
    conn.cursor().execute(
        """INSERT INTO investigation_findings
           (finding_id, run_id, title, summary, entity_ids, relationship_ids, confidence, evidence)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
           ON CONFLICT (run_id, finding_id) DO UPDATE SET title = EXCLUDED.title,
           summary = EXCLUDED.summary, entity_ids = EXCLUDED.entity_ids,
           relationship_ids = EXCLUDED.relationship_ids, confidence = EXCLUDED.confidence,
           evidence = EXCLUDED.evidence""",
        (finding["finding_id"], run_id, finding["title"], finding["summary"],
         Json(finding.get("entity_ids", [])), Json(finding.get("relationship_ids", [])),
         finding.get("confidence", 0), Json(finding.get("evidence", []))),
    )


def get_conversation(conn: PgConnection, case_id: str, session_id: Optional[str] = None) -> dict[str, Any]:
    session = fetch_one(
        conn,
        """SELECT session_id, case_id, status, created_at, updated_at FROM investigation_sessions
           WHERE case_id = %s AND (%s IS NULL OR session_id = %s)
           ORDER BY updated_at DESC LIMIT 1""",
        (case_id, session_id, session_id),
    )
    if not session:
        return {"session": None, "messages": [], "runs": [], "findings": [], "graph": None}
    sid = str(session["session_id"])
    messages = fetch_all(conn, "SELECT message_id, session_id, role, content, created_at FROM investigation_messages WHERE session_id = %s ORDER BY created_at, message_id", (sid,))
    runs = fetch_all(conn, "SELECT run_id, session_id, query, clarified_query, status, depth_reached, result, created_at, completed_at FROM investigation_runs WHERE session_id = %s ORDER BY created_at, run_id", (sid,))
    findings = fetch_all(conn, """SELECT f.finding_id, f.run_id, f.title, f.summary, f.entity_ids, f.relationship_ids, f.confidence, f.evidence
        FROM investigation_findings f JOIN investigation_runs r ON r.run_id = f.run_id
        WHERE r.session_id = %s ORDER BY f.created_at, f.finding_id""", (sid,))
    graph = {"nodes": [], "edges": []}
    node_ids = set()
    edge_ids = set()
    for run in runs:
        run_graph = run.get("result", {}).get("graph") if isinstance(run.get("result"), dict) else None
        for node in (run_graph or {}).get("nodes", []):
            node_id = str(node.get("entity_id") or node.get("id"))
            if node_id and node_id not in node_ids:
                node_ids.add(node_id)
                graph["nodes"].append(node)
        for edge in (run_graph or {}).get("edges", []):
            edge_id = str(edge.get("relationship_id") or edge.get("id"))
            if edge_id and edge_id not in edge_ids:
                edge_ids.add(edge_id)
                graph["edges"].append(edge)
    if not graph["nodes"] and not graph["edges"]:
        graph = None
    return {"session": session, "messages": messages, "runs": runs, "findings": findings, "graph": graph}


# ---------------------------------------------------------------------------
# TRANSACTION
# ---------------------------------------------------------------------------

def get_transaction_by_entity(conn: PgConnection, entity_id: str | UUID) -> Optional[dict[str, Any]]:
    return fetch_one(
        conn,
        """
        SELECT transaction_id, entity_id, transaction_reference,
               sender_entity_id, receiver_entity_id, amount, currency,
               transaction_type, transaction_time, status, merchant_or_org_id,
               location_id, description, source_record_id, created_at
        FROM transactions
        WHERE entity_id = %s
        """,
        (str(entity_id),),
    )


# ---------------------------------------------------------------------------
# ORGANIZATION
# ---------------------------------------------------------------------------

def get_organization_by_entity(conn: PgConnection, entity_id: str | UUID) -> Optional[dict[str, Any]]:
    return fetch_one(
        conn,
        """
        SELECT organization_id, entity_id, organization_name, organization_type,
               department, contact_reference, status, created_at
        FROM organizations
        WHERE entity_id = %s
        """,
        (str(entity_id),),
    )


def get_source_records_for_org(conn: PgConnection, organization_id: str | UUID) -> list[dict[str, Any]]:
    return fetch_all(
        conn,
        """
        SELECT source_record_id, organization_id, source_system, external_record_id,
               record_type, record_timestamp, received_at, raw_reference,
               checksum, data_quality, created_at
        FROM source_records
        WHERE organization_id = %s
        ORDER BY received_at DESC NULLS LAST
        """,
        (str(organization_id),),
    )


# ---------------------------------------------------------------------------
# GENERIC — relationships (both directions) + evidence
# ---------------------------------------------------------------------------

def get_entity_relationships(conn: PgConnection, entity_id: str | UUID) -> list[dict[str, Any]]:
    """
    All edges where this entity is either from_ or to_.
    neighbor_entity_id is computed so DFS does not need to re-derive it.
    """
    rows = fetch_all(
        conn,
        """
        SELECT relationship_id, from_entity_id, to_entity_id, relationship_type,
               relationship_status, confidence, valid_from, valid_to,
               first_seen, last_seen, source_record_id, created_at, updated_at
        FROM entity_relationships
        WHERE from_entity_id = %s OR to_entity_id = %s
        """,
        (str(entity_id), str(entity_id)),
    )
    eid = str(entity_id)
    for r in rows:
        r["neighbor_entity_id"] = (
            r["to_entity_id"] if str(r["from_entity_id"]) == eid else r["from_entity_id"]
        )
    return rows


def get_evidence_for_entity(conn: PgConnection, entity_id: str | UUID) -> list[dict[str, Any]]:
    """
    Collect distinct source_records that back any relationship or
    type-specific record linked to this entity.
    """
    return fetch_all(
        conn,
        """
        SELECT DISTINCT sr.source_record_id, sr.organization_id, sr.source_system,
               sr.external_record_id, sr.record_type, sr.record_timestamp,
               sr.received_at, sr.raw_reference, sr.checksum, sr.data_quality,
               sr.created_at
        FROM source_records sr
        WHERE sr.source_record_id IN (
            -- relationships
            SELECT source_record_id FROM entity_relationships
            WHERE (from_entity_id = %s OR to_entity_id = %s)
              AND source_record_id IS NOT NULL
            UNION
            -- person identifiers
            SELECT pi.source_record_id
            FROM person_identifiers pi
            JOIN persons p ON p.person_id = pi.person_id
            WHERE p.entity_id = %s AND pi.source_record_id IS NOT NULL
            UNION
            -- person_phones
            SELECT pp.source_record_id
            FROM person_phones pp
            JOIN persons p ON p.person_id = pp.person_id
            WHERE p.entity_id = %s AND pp.source_record_id IS NOT NULL
            UNION
            -- vehicle_owners (as owner or as vehicle)
            SELECT vo.source_record_id
            FROM vehicle_owners vo
            JOIN persons p ON p.person_id = vo.person_id
            WHERE p.entity_id = %s AND vo.source_record_id IS NOT NULL
            UNION
            SELECT vo.source_record_id
            FROM vehicle_owners vo
            JOIN vehicles v ON v.vehicle_id = vo.vehicle_id
            WHERE v.entity_id = %s AND vo.source_record_id IS NOT NULL
            UNION
            -- call records
            SELECT cr.source_record_id
            FROM call_records cr
            JOIN phones ph ON ph.phone_id IN (cr.caller_phone_id, cr.receiver_phone_id)
            WHERE ph.entity_id = %s
            UNION
            -- transactions
            SELECT t.source_record_id
            FROM transactions t
            WHERE t.entity_id = %s
               OR t.sender_entity_id = %s
               OR t.receiver_entity_id = %s
            UNION
            -- location events
            SELECT le.source_record_id
            FROM location_events le
            WHERE le.entity_id = %s
            UNION
            SELECT le.source_record_id
            FROM location_events le
            JOIN locations loc ON loc.location_id = le.location_id
            WHERE loc.entity_id = %s
            UNION
            -- vehicle events
            SELECT ve.source_record_id
            FROM vehicle_events ve
            JOIN vehicles v ON v.vehicle_id = ve.vehicle_id
            WHERE v.entity_id = %s
            UNION
            -- unified events
            SELECT e.source_record_id
            FROM events e
            WHERE e.entity_id = %s AND e.source_record_id IS NOT NULL
        )
        """,
        (
            str(entity_id), str(entity_id),  # relationships
            str(entity_id),                  # person_identifiers
            str(entity_id),                  # person_phones
            str(entity_id),                  # vehicle_owners via person
            str(entity_id),                  # vehicle_owners via vehicle
            str(entity_id),                  # call_records
            str(entity_id), str(entity_id), str(entity_id),  # transactions
            str(entity_id),                  # location_events by entity
            str(entity_id),                  # location_events by location entity
            str(entity_id),                  # vehicle_events
            str(entity_id),                  # events
        ),
    )


def get_events_for_entity(conn: PgConnection, entity_id: str | UUID) -> list[dict[str, Any]]:
    """Unified timeline events for any entity."""
    return fetch_all(
        conn,
        """
        SELECT event_id, entity_id, event_type, event_time, location_id,
               case_id, description, source_record_id, created_at
        FROM events
        WHERE entity_id = %s
        ORDER BY event_time DESC NULLS LAST
        """,
        (str(entity_id),),
    )
