"""
Reusable Neo4j driver for the SIH investigation engine.

Connection configuration:
    NEO4J_URI
    NEO4J_USERNAME
    NEO4J_PASSWORD

The driver is process-wide/reusable. DFS sessions do not create a new
Neo4j driver for every entity.
"""
from __future__ import annotations
import os
from threading import Lock
from typing import Optional

from dotenv import load_dotenv
from neo4j import Driver, GraphDatabase

load_dotenv()

_driver: Optional[Driver] = None
_lock = Lock()


def get_driver() -> Driver:
    """Return a reusable Neo4j driver, creating it lazily on first use."""
    global _driver

    if _driver is not None:
        return _driver

    with _lock:
        if _driver is None:
            uri = os.getenv("NEO4J_URI")
            username = os.getenv("NEO4J_USERNAME")
            password = os.getenv("NEO4J_PASSWORD")

            missing = [
                name
                for name, value in (
                    ("NEO4J_URI", uri),
                    ("NEO4J_USERNAME", username),
                    ("NEO4J_PASSWORD", password),
                )
                if not value
            ]
            if missing:
                raise RuntimeError(
                    "Missing Neo4j environment variables: " + ", ".join(missing)
                )

            _driver = GraphDatabase.driver(
                uri,
                auth=(username, password),
            )

    return _driver


def verify_connection() -> bool:
    """Verify connectivity to Neo4j using the reusable driver."""
    driver = get_driver()
    driver.verify_connectivity()
    return True


def close_driver() -> None:
    """Close the process-wide driver, primarily for shutdown/tests."""
    global _driver

    with _lock:
        if _driver is not None:
            _driver.close()
            _driver = None


if __name__ == "__main__":
    try:
        verify_connection()
        print("Neo4j connection successful")
    except Exception as exc:
        print(f"Neo4j connection failed: {exc}")