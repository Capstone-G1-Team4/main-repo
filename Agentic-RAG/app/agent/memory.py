"""
Persistent session memory for the shopping agent.

Uses SQLite so chat history and order state survive page reloads,
server restarts, and new browser sessions. Every session is keyed by
a session_id (the frontend should generate one, store it in
localStorage, and send it with every /chat request).
"""

import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

# Store the DB relative to the project root (not the cwd), so sessions
# are found no matter which folder the server is started from.
_BASE_DIR = Path(__file__).resolve().parents[2]
DB_DIR = os.getenv("AGENT_DB_DIR", str(_BASE_DIR / "data"))
DB_PATH = os.path.join(DB_DIR, "agent_memory.db")

# JSON-encoded session fields
_JSON_FIELDS = ("selected_product", "customer_info", "last_products", "orders")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _connect() -> sqlite3.Connection:
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db():
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                user_id          TEXT PRIMARY KEY,
                step             TEXT DEFAULT '',
                selected_product TEXT DEFAULT 'null',
                customer_info    TEXT DEFAULT '{}',
                last_products    TEXT DEFAULT '[]',
                orders           TEXT DEFAULT '[]',
                created_at       TEXT,
                updated_at       TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    TEXT NOT NULL,
                role       TEXT NOT NULL,
                content    TEXT NOT NULL,
                created_at TEXT
            )
            """
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_user ON messages (user_id, id)"
        )


_init_db()


def init_session(user_id: str):
    """Create the session row if it does not exist yet."""
    with _connect() as conn:
        conn.execute(
            """
            INSERT OR IGNORE INTO sessions (user_id, created_at, updated_at)
            VALUES (?, ?, ?)
            """,
            (user_id, _now(), _now()),
        )


def get_session(user_id: str):
    """Return the session as a dict (JSON fields decoded), or None."""
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM sessions WHERE user_id = ?", (user_id,)
        ).fetchone()

    if row is None:
        return None

    session = dict(row)
    for field in _JSON_FIELDS:
        try:
            session[field] = json.loads(session[field])
        except (TypeError, json.JSONDecodeError):
            session[field] = None
    return session


def update_session(user_id: str, key: str, value):
    """Update a single session field (dicts/lists are stored as JSON)."""
    if key in _JSON_FIELDS:
        value = json.dumps(value, ensure_ascii=False)

    init_session(user_id)
    with _connect() as conn:
        conn.execute(
            f"UPDATE sessions SET {key} = ?, updated_at = ? WHERE user_id = ?",
            (value, _now(), user_id),
        )


def append_history(user_id: str, role: str, content: str):
    """Persist one chat message. role is 'user' or 'assistant'."""
    init_session(user_id)
    with _connect() as conn:
        conn.execute(
            "INSERT INTO messages (user_id, role, content, created_at) VALUES (?, ?, ?, ?)",
            (user_id, role, content, _now()),
        )


def get_history(user_id: str, limit: int = 50):
    """Return the last `limit` messages, oldest first."""
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT role, content, created_at FROM messages
            WHERE user_id = ?
            ORDER BY id DESC LIMIT ?
            """,
            (user_id, limit),
        ).fetchall()
    return [dict(r) for r in reversed(rows)]


def get_history_for_llm(user_id: str, limit: int = 10):
    """History formatted as OpenAI-style messages for the LLM."""
    return [
        {"role": m["role"], "content": m["content"]}
        for m in get_history(user_id, limit)
    ]


def list_sessions():
    """All session ids with basic info (for debugging / admin)."""
    with _connect() as conn:
        rows = conn.execute(
            "SELECT user_id, step, created_at, updated_at FROM sessions ORDER BY updated_at DESC"
        ).fetchall()
    return [dict(r) for r in rows]


def clear_session(user_id: str):
    """Delete a session and all of its messages."""
    with _connect() as conn:
        conn.execute("DELETE FROM messages WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))


def reset_order_state(user_id: str):
    """Clear order-flow state but keep chat history."""
    update_session(user_id, "step", "")
    update_session(user_id, "selected_product", None)
    update_session(user_id, "customer_info", {})
