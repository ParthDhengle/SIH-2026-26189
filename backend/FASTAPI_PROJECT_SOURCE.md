# FastAPI Project Source

This document contains the Python source code of the project. Files are organized according to their relative paths.

**Project root:** `C:\Users\parth\Desktop\Projects\SIH_2026\SIH-2026-26189\backend`

**Python files included:** 15

---

# `main.py`

**File:** `main.py`

```python
```

---

# `py_to_md.py`

**File:** `py_to_md.py`

```python
from pathlib import Path

# Root = current directory
ROOT = Path.cwd()

# Output file
OUTPUT = ROOT / "FASTAPI_PROJECT_SOURCE.md"

# Folders to completely ignore
EXCLUDED_DIRS = {
    "venv",
    ".venv",
    "env",
    ".env",
    "__pycache__",
    ".git",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
}

# Files to ignore
EXCLUDED_FILES = {
    OUTPUT.name,
}


def should_skip(path: Path) -> bool:
    """Return True if this path should be ignored."""
    return any(part in EXCLUDED_DIRS for part in path.parts)


def collect_python_files():
    """Recursively find all Python files."""
    return sorted(
        path
        for path in ROOT.rglob("*.py")
        if path.is_file()
        and not should_skip(path)
        and path.name not in EXCLUDED_FILES
    )


def create_markdown():
    python_files = collect_python_files()

    with OUTPUT.open("w", encoding="utf-8") as md:
        md.write("# FastAPI Project Source\n\n")
        md.write(
            "This document contains the Python source code of the project. "
            "Files are organized according to their relative paths.\n\n"
        )

        md.write(f"**Project root:** `{ROOT}`\n\n")
        md.write(f"**Python files included:** {len(python_files)}\n\n")
        md.write("---\n\n")

        for file_path in python_files:
            relative_path = file_path.relative_to(ROOT)

            md.write(f"# `{relative_path}`\n\n")
            md.write(f"**File:** `{relative_path}`\n\n")

            try:
                code = file_path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                md.write("> ⚠️ Could not decode this file as UTF-8.\n\n")
                md.write("---\n\n")
                continue

            md.write("```python\n")
            md.write(code)

            # Make sure closing ``` starts on a new line
            if code and not code.endswith("\n"):
                md.write("\n")

            md.write("```\n\n")
            md.write("---\n\n")

    print(f"Created: {OUTPUT}")
    print(f"Python files included: {len(python_files)}")


if __name__ == "__main__":
    create_markdown()
```

---

# `src\__init__.py`

**File:** `src\__init__.py`

```python
```

---

# `src\keeps\demo_entity_extract.py`

**File:** `src\keeps\demo_entity_extract.py`

```python
"""
Standalone demo — load get_data_result from JSON, run extract_entities, print output.
No database connection. No FastAPI.

Usage:
    cd backend
    PYTHONPATH=. python demo_entity_extract.py
    PYTHONPATH=. python demo_entity_extract.py path/to/your_get_data.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from src.services.entity_service import extract_entities


# ---------------------------------------------------------------------------
# Mock query context (what the DFS / investigation loop would pass)
# ---------------------------------------------------------------------------
MOCK_QUERY_CONTEXT = {
    "original_query": "Find Rahul Sharma connections",
    "clarified_query": "Investigate connections of Rahul Sharma for CASE-2026-001",
    "case_id": "9b7ac296-20b6-5f1e-b6d4-11f26047e115",
    "seed_entity_ids": ["9a184024-b6b0-5788-975a-986a53679b2a"],
    "target_entity_ids": [],
    "max_depth": 4,
    "current_depth": 0,
    "visited": [],
}


def load_get_data(path: Path) -> dict:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def pretty(obj) -> str:
    return json.dumps(obj, indent=2, default=str)


def main() -> None:
    # Default: look for common filenames next to this script / in cwd
    candidates = [
        Path(sys.argv[1]) if len(sys.argv) > 1 else None,
        Path("get_data_output.json"),
        Path("get_data_outputjson"),
        Path("../get_data_output.json"),
        Path("src/../get_data_output.json"),
    ]
    json_path = next((p for p in candidates if p and p.is_file()), None)

    if json_path is None:
        print("ERROR: No get_data JSON found.")
        print("Usage:  python demo_entity_extract.py <path-to-get_data_result.json>")
        print("Or place get_data_output.json in the current directory.")
        sys.exit(1)

    print(f"Loading: {json_path.resolve()}")
    get_data_result = load_get_data(json_path)

    print("\n" + "=" * 60)
    print("MOCK QUERY CONTEXT")
    print("=" * 60)
    print(pretty(MOCK_QUERY_CONTEXT))

    print("\n" + "=" * 60)
    print("RUNNING extract_entities(...)")
    print("=" * 60)

    result = extract_entities(get_data_result, query_context=MOCK_QUERY_CONTEXT)

    print("\n--- primary_entity ---")
    print(pretty(result["primary_entity"]))

    print(f"\n--- entities ({len(result['entities'])}) ---")
    for e in result["entities"]:
        print(
            f"  [{e.get('entity_type'):12}] {e.get('canonical_name') or '?':30} "
            f"id={e['entity_id'][:8]}…  via={e.get('discovered_via', {}).get('relationship_type') if e.get('discovered_via') else None}"
        )

    print(f"\n--- relationships ({len(result['relationships'])}) ---")
    for r in result["relationships"]:
        conf = r.get("confidence")
        print(
            f"  {r.get('relationship_type'):15}  "
            f"{str(r.get('from_entity_id'))[:8]}… → {str(r.get('to_entity_id'))[:8]}…  "
            f"conf={conf}  evidence={'yes' if r.get('evidence') else 'no'}"
        )

    print(f"\n--- stack_candidates ({len(result['stack_candidates'])}) ---")
    for c in result["stack_candidates"]:
        print(
            f"  depth={c['depth']}  [{c.get('entity_type'):12}] "
            f"{c.get('canonical_name') or '?':30}  "
            f"reason={c.get('reason')}"
        )

    print("\n" + "=" * 60)
    print("FULL JSON OUTPUT")
    print("=" * 60)
    print(pretty(result))


if __name__ == "__main__":
    main()
```

---

# `src\keeps\test_get_data.py`

**File:** `src\keeps\test_get_data.py`

```python
import json
from pprint import pprint

from src.services.data_ingestion.get_data import get_data


ENTITY_ID = "9a184024-b6b0-5788-975a-986a53679b2a"


result = get_data(ENTITY_ID)

print("\n===== GET DATA RESULT =====\n")
pprint(result, sort_dicts=False)


# Also save JSON so we can inspect/use it easily
with open("get_data_output.json", "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2, default=str)

print("\nSaved to: get_data_output.json")
```

---

# `src\models\__init__.py`

**File:** `src\models\__init__.py`

```python
```

---

# `src\routes\__init__.py`

**File:** `src\routes\__init__.py`

```python
```

---

# `src\schema\__init__.py`

**File:** `src\schema\__init__.py`

```python
```

---

# `src\schema\data.py`

**File:** `src\schema\data.py`

```python
"""
Pydantic response models for get_data().
Mirrors the shape described in initial_data_layer_schema.md §8.
"""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class EntityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    entity_id: UUID
    entity_type: str
    canonical_name: Optional[str] = None
    status: Optional[str] = None
    merged_into_entity_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PersonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    person_id: UUID
    entity_id: UUID
    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    occupation: Optional[str] = None
    nationality: Optional[str] = None
    alive_status: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PersonIdentifierOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    identifier_id: UUID
    person_id: UUID
    document_type: Optional[str] = None
    document_number_hash: str
    document_last4: Optional[str] = None
    issuing_authority: Optional[str] = None
    verification_status: Optional[str] = None
    verified_at: Optional[datetime] = None
    source_record_id: Optional[UUID] = None
    created_at: Optional[datetime] = None


class PhoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    phone_id: UUID
    entity_id: UUID
    phone_number_hash: str
    phone_last4: Optional[str] = None
    country_code: Optional[str] = None
    carrier: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # when returned via person_phones junction
    relationship_type: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    source_record_id: Optional[UUID] = None
    confidence: Optional[Decimal] = None


class VehicleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    vehicle_id: UUID
    entity_id: UUID
    registration_number: str
    vehicle_type: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    registration_date: Optional[date] = None
    registration_status: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # ownership extras when joined
    ownership_type: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    source_record_id: Optional[UUID] = None
    confidence: Optional[Decimal] = None


class LocationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    location_id: UUID
    entity_id: UUID
    location_name: Optional[str] = None
    address: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    location_type: Optional[str] = None
    created_at: Optional[datetime] = None


class OrganizationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    organization_id: UUID
    entity_id: UUID
    organization_name: str
    organization_type: Optional[str] = None
    department: Optional[str] = None
    contact_reference: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None


class CaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    case_id: UUID
    entity_id: UUID
    case_number: str
    case_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    incident_time: Optional[datetime] = None
    incident_location_id: Optional[UUID] = None
    status: Optional[str] = None
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # seed role when from case_seed_entities
    role: Optional[str] = None


class CallRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    call_id: UUID
    source_record_id: UUID
    caller_phone_id: Optional[UUID] = None
    receiver_phone_id: Optional[UUID] = None
    call_type: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    call_status: Optional[str] = None
    cell_tower_location_id: Optional[UUID] = None
    created_at: Optional[datetime] = None


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    transaction_id: UUID
    entity_id: UUID
    transaction_reference: Optional[str] = None
    sender_entity_id: Optional[UUID] = None
    receiver_entity_id: Optional[UUID] = None
    amount: Optional[Decimal] = None
    currency: Optional[str] = None
    transaction_type: Optional[str] = None
    transaction_time: Optional[datetime] = None
    status: Optional[str] = None
    merchant_or_org_id: Optional[UUID] = None
    location_id: Optional[UUID] = None
    description: Optional[str] = None
    source_record_id: UUID
    created_at: Optional[datetime] = None


class LocationEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    location_event_id: UUID
    entity_id: UUID
    location_id: UUID
    event_type: Optional[str] = None
    event_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    accuracy: Optional[str] = None
    source_record_id: UUID
    created_at: Optional[datetime] = None


class VehicleEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    vehicle_event_id: UUID
    vehicle_id: UUID
    event_type: Optional[str] = None
    location_id: Optional[UUID] = None
    event_time: Optional[datetime] = None
    description: Optional[str] = None
    source_record_id: UUID
    created_at: Optional[datetime] = None


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event_id: UUID
    entity_id: UUID
    event_type: Optional[str] = None
    event_time: Optional[datetime] = None
    location_id: Optional[UUID] = None
    case_id: Optional[UUID] = None
    description: Optional[str] = None
    source_record_id: Optional[UUID] = None
    created_at: Optional[datetime] = None


class EntityRelationshipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    relationship_id: UUID
    from_entity_id: UUID
    to_entity_id: UUID
    relationship_type: str
    relationship_status: Optional[str] = None
    confidence: Optional[Decimal] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    source_record_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # helper for DFS: the other side relative to the queried entity
    neighbor_entity_id: Optional[UUID] = None


class SourceRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    source_record_id: UUID
    organization_id: UUID
    source_system: Optional[str] = None
    external_record_id: Optional[str] = None
    record_type: Optional[str] = None
    record_timestamp: Optional[datetime] = None
    received_at: Optional[datetime] = None
    raw_reference: Optional[str] = None
    checksum: Optional[str] = None
    data_quality: Optional[str] = None
    created_at: Optional[datetime] = None


class GetDataResponse(BaseModel):
    """
    Normalized response of get_data(entity_id).
    Empty lists are used when no data exists. Never invents entities.
    """

    entity_id: str
    error: Optional[str] = None
    entity: Optional[EntityOut] = None
    # type-specific detail (only one of these is typically populated)
    person: Optional[PersonOut] = None
    phone: Optional[PhoneOut] = None
    vehicle: Optional[VehicleOut] = None
    location: Optional[LocationOut] = None
    organization: Optional[OrganizationOut] = None
    case: Optional[CaseOut] = None
    transaction: Optional[TransactionOut] = None
    # collections (always present as lists)
    identity: list[PersonIdentifierOut] = Field(default_factory=list)
    phones: list[PhoneOut] = Field(default_factory=list)
    vehicles: list[VehicleOut] = Field(default_factory=list)
    calls: list[CallRecordOut] = Field(default_factory=list)
    transactions: list[TransactionOut] = Field(default_factory=list)
    locations: list[LocationOut] = Field(default_factory=list)
    cases: list[CaseOut] = Field(default_factory=list)
    events: list[EventOut] = Field(default_factory=list)
    location_events: list[LocationEventOut] = Field(default_factory=list)
    vehicle_events: list[VehicleEventOut] = Field(default_factory=list)
    seed_entities: list[dict[str, Any]] = Field(default_factory=list)
    relationships: list[EntityRelationshipOut] = Field(default_factory=list)
    evidence: list[SourceRecordOut] = Field(default_factory=list)
```

---

# `src\services\__init__.py`

**File:** `src\services\__init__.py`

```python
```

---

# `src\services\data_ingestion\get_data.py`

**File:** `src\services\data_ingestion\get_data.py`

```python
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
```

---

# `src\services\data_ingestion\repository.py`

**File:** `src\services\data_ingestion\repository.py`

```python
"""
Raw SQL data-access layer for get_data().
All queries follow initial_data_layer_schema.md exactly.
No ORM. Empty lists returned when nothing is found.
"""

from __future__ import annotations

from typing import Any, Optional
from uuid import UUID

from psycopg2.extensions import connection as PgConnection

from src.utils.db import fetch_all, fetch_one


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
```

---

# `src\services\entity_service.py`

**File:** `src\services\entity_service.py`

```python
"""
Entity extraction service for the SIH 2026 investigation engine.

Converts a get_data() result into:
  - primary_entity
  - deduplicated neighbor entities (with metadata)
  - authoritative relationships (with evidence)
  - DFS stack_candidates

Deterministic only. No LLM / NLP / fuzzy merging.
Relationships[] is the sole source of graph edges.
"""

from __future__ import annotations

from typing import Any, Optional


# ---------------------------------------------------------------------------
# Public types (plain dicts — keep dependency-free)
# ---------------------------------------------------------------------------

QueryContext = dict[str, Any]
# Expected keys (all optional):
#   original_query, clarified_query, case_id,
#   seed_entity_ids, target_entity_ids,
#   max_depth, current_depth, visited


def extract_entities(
    get_data_result: dict[str, Any],
    query_context: Optional[QueryContext] = None,
) -> dict[str, Any]:
    """
    Main entry point.

    Parameters
    ----------
    get_data_result : dict
        Exact shape returned by get_data() / GetDataResponse.
    query_context : optional
        Conservative relevance filters + DFS depth/visited state.

    Returns
    -------
    dict with keys:
        primary_entity, entities, relationships, stack_candidates
    """
    if not get_data_result or get_data_result.get("error") == "ENTITY_NOT_FOUND":
        return _empty_output(get_data_result)

    entity = get_data_result.get("entity") or {}
    primary_id = str(entity.get("entity_id") or get_data_result.get("entity_id") or "")
    if not primary_id:
        return _empty_output(get_data_result)

    ctx = query_context or {}
    current_depth = int(ctx.get("current_depth") or 0)
    max_depth = int(ctx.get("max_depth") if ctx.get("max_depth") is not None else 8)
    visited = {str(v) for v in (ctx.get("visited") or [])}
    visited.add(primary_id)  # current node is always "visited" for stack purposes

    # ------------------------------------------------------------------
    # 1. Build evidence lookup (source_record_id → evidence dict)
    # ------------------------------------------------------------------
    evidence_by_id: dict[str, dict] = {}
    for ev in get_data_result.get("evidence") or []:
        sid = ev.get("source_record_id")
        if sid:
            evidence_by_id[str(sid)] = dict(ev)

    # ------------------------------------------------------------------
    # 2. Build metadata enrichment maps from specialized sections
    # ------------------------------------------------------------------
    meta_by_entity: dict[str, dict] = {}
    _enrich_from_phones(get_data_result.get("phones") or [], meta_by_entity)
    _enrich_from_vehicles(get_data_result.get("vehicles") or [], meta_by_entity)
    _enrich_from_locations(get_data_result.get("locations") or [], meta_by_entity)
    _enrich_from_cases(get_data_result.get("cases") or [], meta_by_entity)
    _enrich_from_transactions(get_data_result.get("transactions") or [], meta_by_entity)
    _enrich_from_seed_entities(get_data_result.get("seed_entities") or [], meta_by_entity)
    # type-specific top-level objects (when get_data was called on that type)
    for key, etype in (
        ("phone", "PHONE"),
        ("vehicle", "VEHICLE"),
        ("location", "LOCATION"),
        ("organization", "ORGANIZATION"),
        ("case", "CASE"),
        ("transaction", "TRANSACTION"),
        ("person", "PERSON"),
    ):
        obj = get_data_result.get(key)
        if obj and obj.get("entity_id"):
            eid = str(obj["entity_id"])
            meta_by_entity.setdefault(eid, {})
            meta_by_entity[eid].update({k: v for k, v in obj.items() if k != "entity_id"})
            meta_by_entity[eid].setdefault("_entity_type", etype)

    # ------------------------------------------------------------------
    # 3. Walk relationships — authoritative edges
    # ------------------------------------------------------------------
    entities_map: dict[str, dict] = {}  # entity_id → candidate
    relationships_out: list[dict] = []
    seen_rel_ids: set[str] = set()

    for rel in get_data_result.get("relationships") or []:
        rel_id = rel.get("relationship_id")
        if rel_id and str(rel_id) in seen_rel_ids:
            continue
        if rel_id:
            seen_rel_ids.add(str(rel_id))

        from_id = str(rel.get("from_entity_id") or "")
        to_id = str(rel.get("to_entity_id") or "")
        neighbor_id = str(
            rel.get("neighbor_entity_id")
            or (to_id if from_id == primary_id else from_id)
        )
        if not neighbor_id or neighbor_id == primary_id:
            # self-loop or malformed — still record the edge, skip entity
            pass
        else:
            _upsert_entity(
                entities_map,
                neighbor_id,
                rel=rel,
                meta_by_entity=meta_by_entity,
                primary_id=primary_id,
            )

        # Build clean relationship record
        sid = rel.get("source_record_id")
        evidence = evidence_by_id.get(str(sid)) if sid else None
        relationships_out.append(
            {
                "relationship_id": rel.get("relationship_id"),
                "from_entity_id": from_id,
                "to_entity_id": to_id,
                "relationship_type": rel.get("relationship_type"),
                "relationship_status": rel.get("relationship_status"),
                "confidence": _to_float(rel.get("confidence")),
                "valid_from": rel.get("valid_from"),
                "valid_to": rel.get("valid_to"),
                "first_seen": rel.get("first_seen"),
                "last_seen": rel.get("last_seen"),
                "source_record_id": sid,
                "neighbor_entity_id": neighbor_id if neighbor_id != primary_id else None,
                "evidence": evidence,
            }
        )

    # ------------------------------------------------------------------
    # 4. Also surface entities that appear only in specialized lists
    #    (rare — normally they already have a relationship).  Only add
    #    if they carry an entity_id distinct from primary.
    # ------------------------------------------------------------------
    for eid, meta in meta_by_entity.items():
        if eid == primary_id:
            continue
        if eid not in entities_map:
            entities_map[eid] = {
                "entity_id": eid,
                "entity_type": meta.get("_entity_type") or meta.get("entity_type") or "UNKNOWN",
                "canonical_name": _guess_name(meta),
                "metadata": {k: v for k, v in meta.items() if not k.startswith("_")},
                "discovered_via": None,  # no relationship — informational only
            }

    # ------------------------------------------------------------------
    # 5. Relevance filter (conservative, deterministic)
    # ------------------------------------------------------------------
    entities_list = list(entities_map.values())
    if ctx:
        entities_list = _filter_relevant(entities_list, relationships_out, primary_id, ctx)

    # ------------------------------------------------------------------
    # 6. Stack candidates
    # ------------------------------------------------------------------
    stack_candidates = _build_stack_candidates(
        entities_list=entities_list,
        relationships=relationships_out,
        primary_id=primary_id,
        primary_name=entity.get("canonical_name") or "",
        current_depth=current_depth,
        max_depth=max_depth,
        visited=visited,
        ctx=ctx,
    )

    return {
        "primary_entity": {
            "entity_id": primary_id,
            "entity_type": entity.get("entity_type"),
            "canonical_name": entity.get("canonical_name"),
        },
        "entities": entities_list,
        "relationships": relationships_out,
        "stack_candidates": stack_candidates,
    }


# =====================================================================
# Helpers
# =====================================================================

def _empty_output(get_data_result: Optional[dict] = None) -> dict[str, Any]:
    eid = None
    if get_data_result:
        eid = get_data_result.get("entity_id") or (
            (get_data_result.get("entity") or {}).get("entity_id")
        )
    return {
        "primary_entity": {
            "entity_id": eid,
            "entity_type": None,
            "canonical_name": None,
        },
        "entities": [],
        "relationships": [],
        "stack_candidates": [],
    }


def _to_float(v: Any) -> Optional[float]:
    if v is None:
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _guess_name(meta: dict) -> Optional[str]:
    for key in (
        "canonical_name",
        "full_name",
        "organization_name",
        "location_name",
        "case_number",
        "registration_number",
        "phone_last4",
        "transaction_reference",
    ):
        if meta.get(key):
            val = meta[key]
            if key == "phone_last4":
                return f"****{val}"
            return str(val)
    return None


def _upsert_entity(
    entities_map: dict[str, dict],
    entity_id: str,
    *,
    rel: dict,
    meta_by_entity: dict[str, dict],
    primary_id: str,
) -> None:
    meta = meta_by_entity.get(entity_id, {})
    rel_type = rel.get("relationship_type")
    conf = _to_float(rel.get("confidence"))
    sid = rel.get("source_record_id")

    discovered = {
        "relationship_type": rel_type,
        "source_record_id": sid,
        "confidence": conf,
        "relationship_id": rel.get("relationship_id"),
        "from_entity_id": rel.get("from_entity_id"),
        "to_entity_id": rel.get("to_entity_id"),
    }

    if entity_id not in entities_map:
        entities_map[entity_id] = {
            "entity_id": entity_id,
            "entity_type": meta.get("_entity_type")
            or meta.get("entity_type")
            or _infer_type_from_rel(rel, entity_id, primary_id)
            or "UNKNOWN",
            "canonical_name": _guess_name(meta),
            "metadata": {k: v for k, v in meta.items() if not k.startswith("_")},
            "discovered_via": discovered,
            "relationship_refs": [discovered],
        }
    else:
        # aggregate additional relationship refs
        existing = entities_map[entity_id]
        refs = existing.setdefault("relationship_refs", [])
        refs.append(discovered)
        # keep the first discovered_via (or the highest-confidence one)
        prev_conf = (existing.get("discovered_via") or {}).get("confidence") or 0
        if conf is not None and conf > (prev_conf or 0):
            existing["discovered_via"] = discovered
        # fill missing type/name from later meta
        if existing["entity_type"] == "UNKNOWN" and meta.get("_entity_type"):
            existing["entity_type"] = meta["_entity_type"]
        if not existing.get("canonical_name"):
            existing["canonical_name"] = _guess_name(meta)
        if meta:
            existing["metadata"].update(
                {k: v for k, v in meta.items() if not k.startswith("_")}
            )


def _infer_type_from_rel(rel: dict, neighbor_id: str, primary_id: str) -> Optional[str]:
    """Best-effort type hint from relationship_type when specialized data is absent."""
    rtype = (rel.get("relationship_type") or "").upper()
    mapping = {
        "USED": "PHONE",
        "OWNED": "PHONE",
        "REGISTERED": "PHONE",
        "RESIDES_AT": "LOCATION",
        "LOCATED_AT": "LOCATION",
        "OWNS": "VEHICLE",
        "REGISTERED_USER": "VEHICLE",
        "SEED_SUBJECT": "CASE",
        "SUSPECT": "CASE",
        "VICTIM": "CASE",
        "WITNESS": "CASE",
        "CALLED": "PHONE",
        "CALLS": "PHONE",
    }
    return mapping.get(rtype)


# ---------------------------------------------------------------------------
# Specialized section enrichers
# ---------------------------------------------------------------------------

def _enrich_from_phones(phones: list[dict], meta_by_entity: dict) -> None:
    for p in phones:
        eid = p.get("entity_id")
        if not eid:
            continue
        eid = str(eid)
        meta_by_entity.setdefault(eid, {})
        meta_by_entity[eid].update(
            {
                "phone_id": p.get("phone_id"),
                "phone_last4": p.get("phone_last4"),
                "country_code": p.get("country_code"),
                "carrier": p.get("carrier"),
                "status": p.get("status"),
                "relationship_type": p.get("relationship_type"),
                "valid_from": p.get("valid_from"),
                "valid_to": p.get("valid_to"),
                "source_record_id": p.get("source_record_id"),
                "confidence": p.get("confidence"),
                "_entity_type": "PHONE",
            }
        )


def _enrich_from_vehicles(vehicles: list[dict], meta_by_entity: dict) -> None:
    for v in vehicles:
        eid = v.get("entity_id")
        if not eid:
            continue
        eid = str(eid)
        meta_by_entity.setdefault(eid, {})
        meta_by_entity[eid].update(
            {
                "vehicle_id": v.get("vehicle_id"),
                "registration_number": v.get("registration_number"),
                "vehicle_type": v.get("vehicle_type"),
                "make": v.get("make"),
                "model": v.get("model"),
                "color": v.get("color"),
                "ownership_type": v.get("ownership_type"),
                "valid_from": v.get("valid_from"),
                "valid_to": v.get("valid_to"),
                "source_record_id": v.get("source_record_id"),
                "confidence": v.get("confidence"),
                "_entity_type": "VEHICLE",
            }
        )


def _enrich_from_locations(locations: list[dict], meta_by_entity: dict) -> None:
    for loc in locations:
        eid = loc.get("entity_id")
        if not eid:
            continue
        eid = str(eid)
        meta_by_entity.setdefault(eid, {})
        meta_by_entity[eid].update(
            {
                "location_id": loc.get("location_id"),
                "location_name": loc.get("location_name"),
                "address": loc.get("address"),
                "area": loc.get("area"),
                "city": loc.get("city"),
                "state": loc.get("state"),
                "latitude": loc.get("latitude"),
                "longitude": loc.get("longitude"),
                "location_type": loc.get("location_type"),
                "_entity_type": "LOCATION",
            }
        )


def _enrich_from_cases(cases: list[dict], meta_by_entity: dict) -> None:
    for c in cases:
        eid = c.get("entity_id")
        if not eid:
            continue
        eid = str(eid)
        meta_by_entity.setdefault(eid, {})
        meta_by_entity[eid].update(
            {
                "case_id": c.get("case_id"),
                "case_number": c.get("case_number"),
                "case_type": c.get("case_type"),
                "title": c.get("title"),
                "status": c.get("status"),
                "role": c.get("role"),
                "incident_time": c.get("incident_time"),
                "_entity_type": "CASE",
            }
        )


def _enrich_from_transactions(txs: list[dict], meta_by_entity: dict) -> None:
    for t in txs:
        eid = t.get("entity_id")
        if not eid:
            continue
        eid = str(eid)
        meta_by_entity.setdefault(eid, {})
        meta_by_entity[eid].update(
            {
                "transaction_id": t.get("transaction_id"),
                "transaction_reference": t.get("transaction_reference"),
                "amount": t.get("amount"),
                "currency": t.get("currency"),
                "transaction_type": t.get("transaction_type"),
                "transaction_time": t.get("transaction_time"),
                "status": t.get("status"),
                "sender_entity_id": t.get("sender_entity_id"),
                "receiver_entity_id": t.get("receiver_entity_id"),
                "_entity_type": "TRANSACTION",
            }
        )


def _enrich_from_seed_entities(seeds: list[dict], meta_by_entity: dict) -> None:
    for s in seeds:
        eid = s.get("entity_id") or s.get("person_entity_id")
        if not eid:
            continue
        eid = str(eid)
        meta_by_entity.setdefault(eid, {})
        meta_by_entity[eid].update(
            {
                "role": s.get("role") or s.get("ownership_type"),
                "full_name": s.get("full_name") or s.get("canonical_name"),
                "entity_type": s.get("entity_type"),
                "_entity_type": s.get("entity_type") or "PERSON",
            }
        )


# ---------------------------------------------------------------------------
# Relevance (conservative)
# ---------------------------------------------------------------------------

def _filter_relevant(
    entities: list[dict],
    relationships: list[dict],
    primary_id: str,
    ctx: QueryContext,
) -> list[dict]:
    """
    Keep an entity when ANY of the following holds:
      - it is in target_entity_ids
      - it is in seed_entity_ids
      - it belongs to the current case (entity_type == CASE and matches case_id,
        or it appears in a relationship with the case)
      - it is connected via an existing relationship (always true for extracted entities)
    Never invent relevance; never drop evidence solely because it is not "suspicious".
    """
    targets = {str(x) for x in (ctx.get("target_entity_ids") or [])}
    seeds = {str(x) for x in (ctx.get("seed_entity_ids") or [])}
    case_id = str(ctx.get("case_id") or "") if ctx.get("case_id") else None

    # If no filters at all, return everything
    if not targets and not seeds and not case_id:
        return entities

    connected_ids = set()
    for r in relationships:
        connected_ids.add(str(r.get("from_entity_id") or ""))
        connected_ids.add(str(r.get("to_entity_id") or ""))
    connected_ids.discard(primary_id)
    connected_ids.discard("")

    out = []
    for e in entities:
        eid = e["entity_id"]
        if eid in targets or eid in seeds:
            out.append(e)
            continue
        if eid in connected_ids:
            # already connected by an authoritative relationship
            out.append(e)
            continue
        if case_id and e.get("entity_type") == "CASE":
            meta = e.get("metadata") or {}
            if str(meta.get("case_id") or "") == case_id or str(meta.get("entity_id") or "") == case_id:
                out.append(e)
                continue
        # otherwise keep (conservative — do not drop)
        out.append(e)
    return out


# ---------------------------------------------------------------------------
# Stack candidates
# ---------------------------------------------------------------------------

def _build_stack_candidates(
    *,
    entities_list: list[dict],
    relationships: list[dict],
    primary_id: str,
    primary_name: str,
    current_depth: int,
    max_depth: int,
    visited: set[str],
    ctx: QueryContext,
) -> list[dict]:
    """
    Rules:
      1. Never push primary/current entity.
      2. Never push already-visited.
      3. Never push beyond max_depth.
      4. No duplicate entity_ids.
      5. Preserve relationship context.
    """
    if current_depth >= max_depth:
        return []

    next_depth = current_depth + 1
    targets = {str(x) for x in (ctx.get("target_entity_ids") or [])}

    # Prefer entities that appear as neighbors in relationships
    rel_by_neighbor: dict[str, dict] = {}
    for r in relationships:
        nid = r.get("neighbor_entity_id")
        if nid and str(nid) != primary_id:
            # keep highest-confidence relationship for the reason string
            prev = rel_by_neighbor.get(str(nid))
            if prev is None or (r.get("confidence") or 0) > (prev.get("confidence") or 0):
                rel_by_neighbor[str(nid)] = r

    candidates = []
    seen = set()
    for e in entities_list:
        eid = e["entity_id"]
        if eid == primary_id or eid in visited or eid in seen:
            continue
        seen.add(eid)

        rel = rel_by_neighbor.get(eid) or (e.get("discovered_via") or {})
        rtype = rel.get("relationship_type") or "RELATED_TO"
        reason = f"{rtype} relationship from {primary_name or primary_id}"

        # Prefer target entities when present
        priority = 0
        if eid in targets:
            priority = 1

        candidates.append(
            {
                "entity_id": eid,
                "depth": next_depth,
                "reason": reason,
                "relationship_type": rtype,
                "entity_type": e.get("entity_type"),
                "canonical_name": e.get("canonical_name"),
                "confidence": rel.get("confidence"),
                "source_record_id": rel.get("source_record_id"),
                "_priority": priority,
            }
        )

    # stable order: targets first, then original discovery order
    candidates.sort(key=lambda c: (-c["_priority"],))
    for c in candidates:
        c.pop("_priority", None)
    return candidates
```

---

# `src\utils\config.py`

**File:** `src\utils\config.py`

```python
```

---

# `src\utils\db.py`

**File:** `src\utils\db.py`

```python
from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Any, Generator, Optional

import psycopg2
import psycopg2.extras
from psycopg2.extensions import connection as PgConnection
from dotenv import load_dotenv

load_dotenv()

def get_connection_string() -> str:
    return os.getenv(
        "DATABASE_URL",
    )


@contextmanager
def get_db_connection() -> Generator[PgConnection, None, None]:
    """Yield a single DB connection. Caller must not hold it across awaits."""
    conn = psycopg2.connect(get_connection_string())
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def fetch_one(conn: PgConnection, query: str, params: tuple | list | None = None) -> Optional[dict[str, Any]]:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(query, params or ())
        row = cur.fetchone()
        return dict(row) if row else None


def fetch_all(conn: PgConnection, query: str, params: tuple | list | None = None) -> list[dict[str, Any]]:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(query, params or ())
        return [dict(r) for r in cur.fetchall()]
```

---

