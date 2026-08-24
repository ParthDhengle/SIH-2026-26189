from __future__ import annotations

import asyncio
import logging
from collections import deque
from concurrent.futures import ThreadPoolExecutor
from threading import Condition, Lock
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.services.data_ingestion import repository
from src.services.dfs_service import MAX_DEPTH, QueryContext, run_investigation
from src.services.graph_service import get_graph_service
from src.services.pattern_service import analyze_patterns
from src.utils.db import get_db_connection

logger = logging.getLogger("sih.investigation")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")


class QueryRequest(BaseModel):
	query: str = Field(min_length=3, max_length=2000)
	session_id: str | None = None


class CaseCreateRequest(BaseModel):
	title: str = Field(min_length=3, max_length=200)
	case_type: str = Field(min_length=2, max_length=100)
	description: str | None = Field(default=None, max_length=5000)
	created_by: str | None = Field(default=None, max_length=200)


class Session:
	def __init__(self, context: QueryContext, run_id: str | None = None):
		self.context = context
		self.run_id = run_id
		self.events: deque[dict[str, Any]] = deque()
		self.condition = Condition(Lock())
		self.started = False
		self.completed = False
		self.result: dict[str, Any] | None = None

	def publish(self, event: dict[str, Any]) -> None:
		with self.condition:
			self.events.append(event)
			if event["type"] in {"investigation_completed", "investigation_error"}:
				self.completed = True
			self.condition.notify_all()

	def read_from(self, index: int) -> tuple[int, dict[str, Any] | None]:
		with self.condition:
			while index >= len(self.events) and not self.completed:
				self.condition.wait(timeout=1)
			if index < len(self.events):
				event = list(self.events)[index]
				return index + 1, event
			return index, None

	def update_context(self, context: QueryContext) -> None:
		with self.condition:
			self.context = context
			self.events.clear()
			self.started = False
			self.completed = False
			self.result = None


app = FastAPI(title="SIH 2026 Investigation API", version="1.0")
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

sessions: dict[str, Session] = {}
sessions_lock = Lock()
executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="investigation")


def _resolve_context(case_ref: str, query: str, session_id: str) -> QueryContext:
	with get_db_connection() as conn:
		case = repository.get_case_context(conn, case_ref)
	if not case:
		raise HTTPException(
			status_code=404,
			detail={
				"code": "CASE_NOT_FOUND",
				"message": f"Case {case_ref} is not persisted in the investigation database.",
			},
		)

	with get_db_connection() as conn:
		matching = repository.find_entities_by_query(conn, query)
	normalized_query = query.casefold()
	full_name_matches = [
		entity for entity in matching
		if entity.get("canonical_name")
		and str(entity["canonical_name"]).casefold() in normalized_query
	]
	if full_name_matches:
		matching = full_name_matches
	elif len(matching) > 1:
		matching = []
	if not matching:
		return QueryContext(
			session_id=session_id,
			case_id=str(case["case_id"]),
			original_query=query,
			clarified_query=None,
			seed_entity_ids=[],
			max_depth=MAX_DEPTH,
		)

	return QueryContext(
		session_id=session_id,
		case_id=str(case["case_id"]),
		original_query=query,
		clarified_query=query,
		seed_entity_ids=[str(entity["entity_id"]) for entity in matching],
		target_entity_ids=[],
		max_depth=MAX_DEPTH,
	)


def _run_session(session: Session) -> None:
	try:
		logger.info("[INVESTIGATION] Started | session=%s", session.context.session_id)
		session.publish({
			"type": "query_context_ready",
			"session_id": session.context.session_id,
			"query_context": session.context.to_dict(),
		})

		def publish_dfs_event(event: dict[str, Any]) -> None:
			if event["type"] == "investigation_completed":
				event = {**event, "type": "dfs_completed"}
			session.publish(event)

		dfs_result = run_investigation(session.context, on_event=publish_dfs_event)
		if dfs_result["status"] != "COMPLETED":
			with get_db_connection() as conn:
				repository.complete_investigation_run(conn, session.run_id, "ERROR", dfs_result.get("depth_reached"), dfs_result)
				repository.touch_investigation_session(conn, session.context.session_id, "ERROR")
			session.publish({"type": "investigation_error", "session_id": session.context.session_id, "error": "DFS failed"})
			return

		logger.info("[INVESTIGATION] Final KG READY")
		graph = get_graph_service().get_investigation_graph(dfs_result["visited_entity_ids"])
		session.publish({"type": "pattern_analysis_started", "session_id": session.context.session_id})
		findings = analyze_patterns(session.context.original_query, session.context.clarified_query, graph)
		findings = [{**finding, "run_id": session.run_id} for finding in findings]
		result = {
			"status": "COMPLETED",
			"session_id": session.context.session_id,
			"case_id": session.context.case_id,
			"original_query": session.context.original_query,
			"clarified_query": session.context.clarified_query,
			"depth_reached": dfs_result["depth_reached"],
			"graph": graph,
			"findings": findings,
		}
		with get_db_connection() as conn:
			repository.complete_investigation_run(conn, session.run_id, "COMPLETED", dfs_result["depth_reached"], result)
			for finding in findings:
				repository.add_investigation_finding(conn, session.run_id, finding)
			repository.add_investigation_message(conn, session.context.session_id, "system", "Investigation completed. The final knowledge graph and findings are ready.")
			repository.touch_investigation_session(conn, session.context.session_id, "COMPLETED")
		session.publish({"type": "findings_ready", "session_id": session.context.session_id, "findings": findings})
		logger.info("[OUTPUT] Findings generated")
		session.result = result
		logger.info("[OUTPUT] Sending final result to frontend")
		session.publish({"type": "investigation_completed", "session_id": session.context.session_id, "result": result})
		logger.info("[INVESTIGATION] COMPLETED")
	except Exception:
		logger.exception("[INVESTIGATION] Failed")
		try:
			with get_db_connection() as conn:
				repository.complete_investigation_run(conn, session.run_id, "ERROR", None, None)
				repository.touch_investigation_session(conn, session.context.session_id, "ERROR")
		except Exception:
			logger.exception("[PERSISTENCE] Failed to record investigation error")
		session.publish({"type": "investigation_error", "session_id": session.context.session_id, "error": "Investigation failed"})


@app.get("/health")
def health() -> dict[str, str]:
	return {"status": "ok"}


@app.post("/api/cases", status_code=201)
def create_case(request: CaseCreateRequest) -> dict[str, Any]:
	case_number = f"CASE-{uuid4().hex[:10].upper()}"
	with get_db_connection() as conn:
		case = repository.create_case(
			conn,
			case_number=case_number,
			title=request.title.strip(),
			case_type=request.case_type.strip(),
			description=request.description.strip() if request.description else None,
			created_by=request.created_by.strip() if request.created_by else None,
		)
	return {"status": "CREATED", "case": case}


@app.post("/api/cases/{case_id}/query")
def create_query(case_id: str, request: QueryRequest) -> dict[str, Any]:
	session_id = request.session_id or str(uuid4())
	with sessions_lock:
		existing_session = sessions.get(session_id)
		if existing_session and not existing_session.completed:
			raise HTTPException(status_code=409, detail="SESSION_ALREADY_EXISTS")
	context = _resolve_context(case_id, request.query.strip(), session_id)
	with get_db_connection() as conn:
		case = repository.get_case_context(conn, case_id)
		persisted_session = repository.get_or_create_investigation_session(conn, session_id, str(case["case_id"]))
		repository.add_investigation_message(conn, session_id, "investigator", request.query.strip())
		run = repository.create_investigation_run(conn, session_id, request.query.strip())
	with sessions_lock:
		if existing_session:
			existing_session.update_context(context)
			existing_session.run_id = str(run["run_id"])
		else:
			sessions[session_id] = Session(context, str(run["run_id"]))
	if not context.seed_entity_ids:
		with get_db_connection() as conn:
			repository.add_investigation_message(conn, session_id, "system", "Which person or entity from this case should be investigated?")
		return {
			"status": "CLARIFICATION_REQUIRED",
			"session_id": session_id,
			"question": "Which person or entity from this case should be investigated?",
		}
	return {"status": "READY", "session_id": session_id, "query_context": context.to_dict()}


@app.post("/api/investigations/{session_id}/clarify")
def clarify_investigation(session_id: str, request: QueryRequest) -> dict[str, Any]:
	with sessions_lock:
		session = sessions.get(session_id)
	if not session:
		raise HTTPException(status_code=404, detail="SESSION_NOT_FOUND")
	context = _resolve_context(str(session.context.case_id), request.query.strip(), session_id)
	context = QueryContext(
		session_id=session_id,
		case_id=context.case_id,
		original_query=session.context.original_query,
		clarified_query=request.query.strip(),
		seed_entity_ids=context.seed_entity_ids,
		target_entity_ids=context.target_entity_ids,
		max_depth=context.max_depth,
	)
	session.update_context(context)
	with get_db_connection() as conn:
		repository.add_investigation_message(conn, session_id, "investigator", request.query.strip())
		conn.cursor().execute("UPDATE investigation_runs SET clarified_query = %s WHERE run_id = %s", (context.clarified_query, session.run_id))
	if not context.seed_entity_ids:
		with get_db_connection() as conn:
			repository.add_investigation_message(conn, session_id, "system", "Which person or entity should be investigated?")
		return {"status": "CLARIFICATION_REQUIRED", "session_id": session_id, "question": "Name a person or entity to investigate."}
	return {"status": "READY", "session_id": session_id, "query_context": context.to_dict()}


@app.post("/api/investigations/{session_id}/start", status_code=202)
def start_investigation(session_id: str) -> dict[str, Any]:
	with sessions_lock:
		session = sessions.get(session_id)
		if not session:
			raise HTTPException(status_code=404, detail="SESSION_NOT_FOUND")
		if session.started:
			raise HTTPException(status_code=409, detail="INVESTIGATION_ALREADY_STARTED")
		if not session.context.seed_entity_ids:
			raise HTTPException(status_code=400, detail="QUERY_CONTEXT_INCOMPLETE")
		session.started = True
	executor.submit(_run_session, session)
	return {"status": "STARTED", "session_id": session_id}


@app.get("/api/investigations/{session_id}")
def get_investigation_result(session_id: str) -> dict[str, Any]:
	with sessions_lock:
		session = sessions.get(session_id)
	if not session:
		raise HTTPException(status_code=404, detail="SESSION_NOT_FOUND")
	if session.result is None:
		return {"status": "RUNNING", "session_id": session_id}
	return session.result


@app.get("/api/cases/{case_id}/conversation")
def get_case_conversation(case_id: str, session_id: str | None = None) -> dict[str, Any]:
	with get_db_connection() as conn:
		case = repository.get_case_context(conn, case_id)
		if not case:
			raise HTTPException(status_code=404, detail="CASE_NOT_FOUND")
		return repository.get_conversation(conn, str(case["case_id"]), session_id)


@app.post("/api/cases/{case_id}/follow-up")
def follow_up(case_id: str, request: QueryRequest) -> dict[str, Any]:
	return create_query(case_id, request)


@app.websocket("/api/investigations/{session_id}/stream")
async def investigation_stream(websocket: WebSocket, session_id: str) -> None:
	with sessions_lock:
		session = sessions.get(session_id)
	if not session:
		await websocket.close(code=4404, reason="SESSION_NOT_FOUND")
		return

	await websocket.accept()
	index = 0
	try:
		while True:
			index, event = await asyncio.to_thread(session.read_from, index)
			if event is None:
				break
			await websocket.send_json(event)
			if event["type"] in {"investigation_completed", "investigation_error"}:
				break
	except WebSocketDisconnect:
		return
