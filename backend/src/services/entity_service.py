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