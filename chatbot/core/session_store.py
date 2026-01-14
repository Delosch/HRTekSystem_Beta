# core/session_store.py
from __future__ import annotations
from typing import Any, Dict,Optional

_SESSIONS: Dict[str, Dict[str, Any]] = {}

def get_session(session_id: str) -> Dict[str, Any] | None:
    return _SESSIONS.get(session_id)

def put_session(session_id: str, state: Dict[str, Any]) -> None:
    _SESSIONS[session_id] = state

def clear_session(session_id: str) -> None:
    _SESSIONS.pop(session_id, None)


