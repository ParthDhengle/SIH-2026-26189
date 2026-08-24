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
