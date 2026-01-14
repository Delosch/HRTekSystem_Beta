# core/lead_capture.py
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Tuple
import json
import re

@dataclass(frozen=True)
class LeadCaptureResult:
    done: bool
    message: str
    state: Dict[str, Any]
    payload: Dict[str, Any] | None = None

def load_intake_questions(kb_dir: str | Path) -> List[Dict[str, Any]]:
    path = Path(kb_dir) / "intake_questions.json"
    if not path.exists():
        raise FileNotFoundError(f"Missing intake KB: {path}")
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("intake_questions.json must be a JSON list")
    return data

def start_state(questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    return {
        "mode": "LEAD_CAPTURE",
        "current_index": 0,
        "answers": {},       # intake_id -> chosen option(s)
        "completed": False,
        "total": len(questions),
    }

def _normalize(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip().lower())

def format_question(q: Dict[str, Any]) -> str:
    header = f"{q['section_id']} — {q['section_title']}\nQ{q['question_number']}. {q['question']}"
    opts = q.get("options", [])
    if not opts:
        return header + "\n(Answer in free text.)"

    lines = [header, ""]
    for i, opt in enumerate(opts, start=1):
        lines.append(f"{i}) {opt}")

    if q.get("answer_type") == "multi_choice":
        lines.append("")
        lines.append(f"Select up to {q.get('max_selections', 3)} options (e.g., 1,3,5).")

    return "\n".join(lines)

def _parse_single_choice(user_text: str, options: List[str]) -> Tuple[bool, str | None]:
    t = _normalize(user_text)

    # numeric input: "2"
    if re.fullmatch(r"\d+", t):
        idx = int(t)
        if 1 <= idx <= len(options):
            return True, options[idx - 1]
        return False, None

    # exact option text match (normalized)
    norm_map = {_normalize(o): o for o in options}
    if t in norm_map:
        return True, norm_map[t]

    return False, None

def _parse_multi_choice(user_text: str, options: List[str], max_sel: int) -> Tuple[bool, List[str] | None]:
    t = _normalize(user_text)
    if not t:
        return False, None

    parts = re.split(r"[,\s]+", t)
    parts = [p for p in parts if p]

    # numeric mode: "1,3,5"
    if parts and all(re.fullmatch(r"\d+", p) for p in parts):
        idxs = []
        for p in parts:
            i = int(p)
            if i not in idxs:
                idxs.append(i)
        if any(i < 1 or i > len(options) for i in idxs):
            return False, None
        if len(idxs) > max_sel:
            return False, None
        return True, [options[i - 1] for i in idxs]

    # text mode: allow comma-separated exact option strings
    norm_map = {_normalize(o): o for o in options}
    selected = []
    for raw in user_text.split(","):
        key = _normalize(raw)
        if key in norm_map and norm_map[key] not in selected:
            selected.append(norm_map[key])

    if not selected or len(selected) > max_sel:
        return False, None
    return True, selected

def apply_answer(state: Dict[str, Any], questions: List[Dict[str, Any]], user_text: str) -> Tuple[bool, str]:
    idx = state["current_index"]
    if idx >= len(questions):
        return False, "Intake already completed."

    q = questions[idx]
    qid = q["id"]
    options = q.get("options", [])
    answer_type = q.get("answer_type", "single_choice")

    if answer_type == "multi_choice":
        ok, parsed = _parse_multi_choice(user_text, options, int(q.get("max_selections", 3)))
        if not ok or parsed is None:
            return False, f"Please select up to {q.get('max_selections', 3)} valid options (e.g., 1,3)."
        state["answers"][qid] = parsed
        return True, ""

    ok, parsed = _parse_single_choice(user_text, options)
    if not ok or parsed is None:
        return False, "Please reply with a valid option number (e.g., 2) or exact option text."
    state["answers"][qid] = parsed
    return True, ""

def advance(state: Dict[str, Any], questions: List[Dict[str, Any]]) -> None:
    state["current_index"] += 1
    if state["current_index"] >= len(questions):
        state["completed"] = True

def build_payload(state: Dict[str, Any], questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    payload = {
        "mode": "LEAD_CAPTURE",
        "completed": True,
        "answered_count": len(state["answers"]),
        "total_questions": len(questions),
        "answers": state["answers"],
    }

    # human-friendly summary (useful for demos / later engines)
    summary = []
    for q in questions:
        qid = q["id"]
        if qid in state["answers"]:
            summary.append({"id": qid, "question": q["question"], "answer": state["answers"][qid]})
    payload["summary"] = summary
    return payload

def handle_turn(state: Dict[str, Any], questions: List[Dict[str, Any]], user_text: str | None) -> LeadCaptureResult:
    if state.get("completed"):
        payload = build_payload(state, questions)
        return LeadCaptureResult(True, "Intake already completed.", state, payload)

    # If UI wants to start the intake, it can call with empty string to get Q1
    if user_text is None or _normalize(user_text) == "":
        q = questions[state["current_index"]]
        return LeadCaptureResult(False, format_question(q), state)

    ok, err = apply_answer(state, questions, user_text)
    if not ok:
        q = questions[state["current_index"]]
        msg = f"{err}\n\n{format_question(q)}"
        return LeadCaptureResult(False, msg, state)

    advance(state, questions)

    if state.get("completed"):
        payload = build_payload(state, questions)
        return LeadCaptureResult(True, "Thanks — I’ve captured your inputs. Intake is complete.", state, payload)

    q = questions[state["current_index"]]
    return LeadCaptureResult(False, format_question(q), state)
