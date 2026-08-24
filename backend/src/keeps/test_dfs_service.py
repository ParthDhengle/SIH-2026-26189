import unittest
from unittest.mock import Mock

from src.services.dfs_service import QueryContext, run_investigation


def entity(eid, etype, name):
    return {
        "entity_id": eid,
        "entity_type": etype,
        "canonical_name": name,
    }


def rel(rid, a, b, rtype="RELATED_TO", confidence=1.0):
    return {
        "relationship_id": rid,
        "from_entity_id": a,
        "to_entity_id": b,
        "relationship_type": rtype,
        "relationship_status": "CONFIRMED",
        "confidence": confidence,
        "source_record_id": f"source-{rid}",
        "valid_from": None,
        "valid_to": None,
        "first_seen": None,
        "last_seen": None,
    }


class DfsServiceTests(unittest.TestCase):
    def make_context(self, seed="A", max_depth=8):
        return QueryContext(
            session_id="session-1",
            case_id="case-1",
            original_query="Find connections",
            clarified_query="Find connections from A",
            seed_entity_ids=[seed],
            target_entity_ids=[],
            max_depth=max_depth,
        )

    def test_cycle_protection(self):
        data = {
            "A": {"entity": entity("A", "PERSON", "A")},
            "B": {"entity": entity("B", "PHONE", "B")},
        }

        # A -> B -> A
        data["A"]["relationships"] = [rel("r1", "A", "B", "USED")]
        data["B"]["relationships"] = [rel("r2", "B", "A", "USED")]

        def get_data(eid):
            d = dict(data[eid])
            d.setdefault("relationships", [])
            d["evidence"] = []
            return d

        def extract(d, ctx):
            p = d["entity"]
            rs = d["relationships"]
            neighbor = rs[0]["to_entity_id"] if rs[0]["from_entity_id"] == p["entity_id"] else rs[0]["from_entity_id"]
            e = entity(
                neighbor,
                "PHONE" if neighbor == "B" else "PERSON",
                neighbor,
            )
            return {
                "primary_entity": p,
                "entities": [e],
                "relationships": rs,
                "stack_candidates": [{
                    "entity_id": neighbor,
                    "depth": ctx["current_depth"] + 1,
                    "relationship_type": rs[0]["relationship_type"],
                    "source_record_id": rs[0]["source_record_id"],
                    "confidence": rs[0]["confidence"],
                }],
            }

        graph = Mock()
        result = run_investigation(
            self.make_context(),
            graph_service=graph,
            get_data_fn=get_data,
            extract_fn=extract,
        )

        self.assertEqual(result["status"], "COMPLETED")
        self.assertEqual(result["processed_entity_ids"].count("A"), 1)
        self.assertEqual(result["processed_entity_ids"].count("B"), 1)

    def test_depth_eight_is_processed_but_not_expanded(self):
        chain = {str(i): str(i + 1) for i in range(8)}
        data = {}

        for i in range(9):
            eid = str(i)
            relationships = []
            if i < 8:
                relationships = [rel(f"r{i}", eid, str(i + 1), "NEXT")]
            data[eid] = {
                "entity": entity(eid, "EVENT", f"E{eid}"),
                "relationships": relationships,
                "evidence": [],
            }

        def get_data(eid):
            return data[eid]

        def extract(d, ctx):
            rs = d["relationships"]
            entities = []
            candidates = []
            if rs:
                neighbor = rs[0]["to_entity_id"]
                entities.append(entity(neighbor, "EVENT", f"E{neighbor}"))
                candidates.append({
                    "entity_id": neighbor,
                    "depth": ctx["current_depth"] + 1,
                    "relationship_type": "NEXT",
                })
            return {
                "primary_entity": d["entity"],
                "entities": entities,
                "relationships": rs,
                "stack_candidates": candidates,
            }

        result = run_investigation(
            self.make_context(seed="0", max_depth=8),
            graph_service=Mock(),
            get_data_fn=get_data,
            extract_fn=extract,
        )

        self.assertEqual(result["status"], "COMPLETED")
        self.assertEqual(len(result["processed_entity_ids"]), 9)
        self.assertEqual(result["depth_reached"], 8)
        self.assertNotIn("9", result["processed_entity_ids"])

    def test_query_context_is_preserved(self):
        result = run_investigation(
            self.make_context(seed="A"),
            graph_service=Mock(),
            get_data_fn=lambda eid: {
                "entity": entity("A", "PERSON", "A"),
                "relationships": [],
                "evidence": [],
            },
            extract_fn=lambda d, ctx: {
                "primary_entity": d["entity"],
                "entities": [],
                "relationships": [],
                "stack_candidates": [],
            },
        )

        self.assertEqual(result["query_context"]["original_query"], "Find connections")
        self.assertEqual(result["query_context"]["clarified_query"], "Find connections from A")
        self.assertEqual(result["query_context"]["case_id"], "case-1")
        self.assertEqual(result["query_context"]["max_depth"], 8)

    def test_empty_stack_completes(self):
        result = run_investigation(
            self.make_context(),
            graph_service=Mock(),
            get_data_fn=lambda eid: {
                "entity": entity("A", "PERSON", "A"),
                "relationships": [],
                "evidence": [],
            },
            extract_fn=lambda d, ctx: {
                "primary_entity": d["entity"],
                "entities": [],
                "relationships": [],
                "stack_candidates": [],
            },
        )
        self.assertEqual(result["status"], "COMPLETED")


if __name__ == "__main__":
    unittest.main()
