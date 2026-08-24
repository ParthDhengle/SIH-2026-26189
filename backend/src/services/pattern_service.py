"""Final investigation pattern analysis over an already-built knowledge graph."""
from __future__ import annotations

import json
import logging
import os
from typing import Any
from urllib.parse import quote
from urllib.request import Request, urlopen

from src.utils.config import gemini_configured

logger = logging.getLogger(__name__)


def _fallback_findings(graph: dict[str, Any], query: str) -> list[dict[str, Any]]:
    nodes = {str(node.get("entity_id")): node for node in graph.get("nodes") or []}
    findings = []
    for edge in (graph.get("edges") or [])[:5]:
        source_id = str(edge.get("from_entity_id") or "")
        target_id = str(edge.get("to_entity_id") or "")
        if source_id not in nodes or target_id not in nodes:
            continue
        source_name = nodes[source_id].get("canonical_name") or source_id
        target_name = nodes[target_id].get("canonical_name") or target_id
        finding_id = f"finding-{edge.get('relationship_id') or source_id + '-' + target_id}"
        findings.append({
            "finding_id": finding_id,
            "title": f"Potential connection: {source_name} to {target_name}",
            "summary": f"A relevant {edge.get('relationship_type') or 'relationship'} was found for the investigation query.",
            "entity_ids": [source_id, target_id],
            "relationship_ids": [str(edge.get("relationship_id"))] if edge.get("relationship_id") else [],
            "confidence": float(edge.get("confidence") or 0.5),
            "evidence": ([{
                "source_record_id": str(edge["source_record_id"]),
                "description": "Relationship source record from the investigation graph.",
            }] if edge.get("source_record_id") else []),
        })
    return findings


def _prompt(query: str, clarified_query: str | None, graph: dict[str, Any]) -> str:
    return json.dumps({
        "task": "Identify only potentially relevant connections or patterns for this investigation. Do not claim guilt.",
        "original_query": query,
        "clarified_query": clarified_query,
        "knowledge_graph": graph,
        "output_schema": [{
            "finding_id": "stable string",
            "title": "short title",
            "summary": "concise investigative lead using cautious language",
            "entity_ids": ["existing graph entity_id values only"],
            "relationship_ids": ["existing graph relationship_id values only"],
            "confidence": 0.0,
            "evidence": [{"source_record_id": "existing source_record_id", "description": "short description"}],
        }],
    }, default=str)


def _gemini_findings(query: str, clarified_query: str | None, graph: dict[str, Any]) -> list[dict[str, Any]]:
    key = os.environ["GEMINI_API_KEY"]
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{quote(model)}:generateContent?key={quote(key)}"
    body = json.dumps({
        "contents": [{"parts": [{"text": _prompt(query, clarified_query, graph)}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.1},
    }).encode("utf-8")
    request = Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    with urlopen(request, timeout=30) as response:
        payload = json.loads(response.read().decode("utf-8"))
    text = payload["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(text)


def analyze_patterns(query: str, clarified_query: str | None, graph: dict[str, Any]) -> list[dict[str, Any]]:
    """Run one final analysis and discard IDs that are absent from the graph."""
    logger.info("[PATTERN] Starting Gemini analysis")
    try:
        findings = _gemini_findings(query, clarified_query, graph) if gemini_configured() else _fallback_findings(graph, query)
    except Exception:
        logger.exception("[PATTERN] Gemini analysis failed; using graph-only findings")
        findings = _fallback_findings(graph, query)

    entity_ids = {str(node.get("entity_id")) for node in graph.get("nodes") or []}
    relationship_ids = {str(edge.get("relationship_id")) for edge in graph.get("edges") or [] if edge.get("relationship_id")}
    valid = []
    for index, finding in enumerate(findings if isinstance(findings, list) else []):
        entity_refs = [str(value) for value in finding.get("entity_ids") or [] if str(value) in entity_ids]
        relationship_refs = [str(value) for value in finding.get("relationship_ids") or [] if str(value) in relationship_ids]
        if not entity_refs and not relationship_refs:
            continue
        valid.append({
            "finding_id": str(finding.get("finding_id") or f"finding-{index + 1}"),
            "title": str(finding.get("title") or "Potentially relevant connection"),
            "summary": str(finding.get("summary") or "Graph evidence suggests a potentially relevant investigative lead."),
            "entity_ids": entity_refs,
            "relationship_ids": relationship_refs,
            "confidence": max(0.0, min(float(finding.get("confidence") or 0.0), 1.0)),
            "evidence": [item for item in finding.get("evidence") or [] if isinstance(item, dict)],
        })
    logger.info("[PATTERN] Gemini analysis completed")
    return valid
