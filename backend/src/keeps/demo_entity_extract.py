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