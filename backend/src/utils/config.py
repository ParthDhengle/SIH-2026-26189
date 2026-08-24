from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def get_required_setting(name: str) -> str:
	value = os.getenv(name)
	if not value:
		raise RuntimeError(f"Missing required configuration: {name}")
	return value


def gemini_configured() -> bool:
	return bool(os.getenv("GEMINI_API_KEY"))
