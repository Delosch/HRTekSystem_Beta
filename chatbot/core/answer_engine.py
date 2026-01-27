# core/answer_engine.py

from __future__ import annotations


from pathlib import Path
import json
from core.prompt_loader import load_prompt
from core.router import (
    route,
    interpret_menu_choice,
    RouteModule,
    RouteDecision,
    FallbackAction,
)
from core.retriever import Retriever
from core.session_store import get_session, put_session
from core.lead_capture import load_intake_questions, start_state, handle_turn
from llm.client_factory import get_llm_client

#added for post processing of output
from safety.grounding_guard import grounding_guard
from core.postprocess import postprocess_response


# -------------------------
# Session helpers (sticky mode)
# -------------------------

def _get_state(sid: str) -> dict:
    return get_session(sid) or {}

def _set_state(sid: str, state: dict) -> None:
    put_session(sid, state)

def _get_active_module(sid: str) -> str | None:
    return _get_state(sid).get("active_module")

def _set_active_module(sid: str, module_value: str) -> None:
    state = _get_state(sid)
    state["active_module"] = module_value
    _set_state(sid, state)

def _clear_active_module(sid: str) -> None:
    state = _get_state(sid)
    state.pop("active_module", None)
    _set_state(sid, state)


# -------------------------
# Shared responses/helpers
# -------------------------

def _main_menu_text() -> str:
    return (
        "What would you like to do?\n"
        "1) Explain my Roadmap\n"
        "2) Explain my Assessment/Maturity results\n"
        "3) FAQ (Pricing, billing, refunds, modules)"
    )

def _no_kb_info_response(prompt_version: str = "v1") -> dict:
    # Hallucination guard: if retriever returns nothing, do NOT call LLM.
    return {
        "answer": (
            "I don't have approved info for that yet.\n\n"
            "You can ask me about:\n"
            "- Pricing & plans (tiers, subscriptions)\n"
            "- Standalone report pricing\n"
            "- GST, billing, refunds\n"
            "- Available modules and what each one does\n\n"
            "If you need help beyond these topics, please contact support."
        ),
        "module": RouteModule.SAFE_FALLBACK.value,
        "prompt_version": prompt_version,
        "sources_used": []
    }

def _format_kb_chunks_for_prompt(chunks: list, max_chars_per_chunk: int = 900) -> str:
    lines = []
    for i, c in enumerate(chunks, start=1):
        entry = c.entry
        title = str(entry.get("title", "")).strip()
        text = str(entry.get("text", "")).strip()
        source = str(entry.get("source", "")).strip()
        entry_id = str(entry.get("id", "")).strip()

        if len(text) > max_chars_per_chunk:
            text = text[:max_chars_per_chunk].rstrip() + "…"

        lines.append(
            f"[{i}] id={entry_id} | kb={c.kb_name} | title={title}\n"
            f"text: {text}\n"
            f"source: {source}"
        )
    return "\n\n".join(lines)

def _load_sample_report(mode: str):
    """
    mode: 'roadmap' | 'assessment'
    """
    base = Path(__file__).resolve().parents[1] / "samples"

    if mode == "roadmap":
        path = base / "mock_roadmap_output_v1.json"
    elif mode == "assessment":
        path = base / "mock_assessment_output_v1.json"
    else:
        return None

    if not path.exists():
        return None

    return json.loads(path.read_text(encoding="utf-8"))



# -------------------------
# Main entry
# -------------------------

def generate(
    message: str,
    page_context: str,
    report_json: dict | None = None,
    session_id: str | None = None
) -> dict:
    BASE_DIR = Path(__file__).resolve().parents[1]   # .../chatbot
    KB_DIR = BASE_DIR / "kb"
    PROMPTS_DIR = BASE_DIR / "prompts"

    prompt_version = "v1"

    sid = session_id or "default"
    msg = (message or "").strip()

    # 0) Exit/menu commands reset sticky mode and show menu
    if msg.lower() in {"menu", "/menu", "exit", "/exit"}:
        _clear_active_module(sid)
        return {
            "answer": _main_menu_text(),
            "module": RouteModule.SAFE_FALLBACK.value,
            "prompt_version": prompt_version,
            "sources_used": []
        }

    # 1) If user types 1/2/3 anytime, switch active module immediately
    choice = interpret_menu_choice(msg)
    if choice is not None:
        _set_active_module(sid, choice.value)

    active = _get_active_module(sid)

    # 2) Build routing decision (forced by active module or normal routing)
    if active in {"FAQ", "ROADMAP", "ASSESSMENT", "LEAD_CAPTURE"}:
        decision = RouteDecision(
            module=RouteModule(active),
            confidence=0.99,
            reason=f"active_module={active}",
            matched_signals={"source": "active_module"},
            fallback_action=FallbackAction.NONE,
            fallback_message=None,
        )
    else:
        decision = route(page_context=page_context, message=message)

        # If router says fallback and no active mode, show fallback menu/message
        if decision.module == RouteModule.SAFE_FALLBACK:
            return {
                "answer": decision.fallback_message or _main_menu_text(),
                "module": RouteModule.SAFE_FALLBACK.value,
                "prompt_version": prompt_version,
                "sources_used": []
            }

        # Lock in mode once router picks a real module
        if decision.module in {RouteModule.FAQ, RouteModule.ROADMAP, RouteModule.ASSESSMENT, RouteModule.LEAD_CAPTURE}:
            _set_active_module(sid, decision.module.value)

    # -------------------------
    # 3) Dispatch by module
    # -------------------------

        # --- FAQ ---
    if decision.module == RouteModule.FAQ:

        # If user just selected FAQ option, show FAQ intro and don't retrieve on "3"
        if msg == "3":
            _set_active_module(sid, RouteModule.FAQ.value)
            return postprocess_response({
                "answer": (
                    "Sure — FAQ mode.\n\n"
                    "Ask me anything from these areas:\n"
                    "1) Pricing & plans (GST, tiers, refunds, billing)\n"
                    "2) Modules (what each module does)\n"
                    "3) General FAQs (how the platform works)\n\n"
                    "Example questions:\n"
                    "- Is GST included?\n"
                    "- Can I buy a report without subscribing?"
                ),
                "module": RouteModule.FAQ.value,
                "prompt_version": prompt_version,
                "sources_used": [],
                "no_sources_ok":True,
            })

        retriever = Retriever(kb_dir=KB_DIR)
        chunks = retriever.retrieve(message, top_k=5)

        # Grounding guard: if FAQ requires KB chunks and none found → refuse safely
        guard_resp = grounding_guard(
            RouteModule.FAQ,
            report_json=report_json,
            kb_chunks=chunks,
            prompt_version=prompt_version,
        )
        if guard_resp:
            return postprocess_response(guard_resp)

        prompt_template = load_prompt(
            "faq_navigator",
            version=prompt_version,
            prompts_dir=PROMPTS_DIR
        )
        kb_context = _format_kb_chunks_for_prompt(chunks)

        prompt = (
            f"{prompt_template}\n\n"
            f"PageContext: {page_context}\n"
            f"UserQuestion: {message}\n\n"
            "APPROVED_KB_CHUNKS:\n"
            f"{kb_context}\n"
        )

        client = get_llm_client()
        text = client.generate(prompt)

        return postprocess_response({
            "answer": text,
            "module": RouteModule.FAQ.value,
            "prompt_version": prompt_version,
            "sources_used": [c.entry.get("id") for c in chunks if c.entry.get("id")]
        })


    # --- ROADMAP / ASSESSMENT ---
    if decision.module in (RouteModule.ROADMAP, RouteModule.ASSESSMENT):
        prompt_name = "roadmap_explainer" if decision.module == RouteModule.ROADMAP else "assessment_explainer"
        prompt_template = load_prompt(prompt_name, version=prompt_version, prompts_dir=PROMPTS_DIR)

            # Auto-load sample report JSON when report_json is not provided (demo/dev)
        if report_json is None:
            if decision.module == RouteModule.ROADMAP:
                report_json = _load_sample_report("roadmap")
            elif decision.module == RouteModule.ASSESSMENT:
                report_json = _load_sample_report("assessment")

        guard_resp = grounding_guard(
        decision.module,
        report_json=report_json,
        kb_chunks=None,
        prompt_version=prompt_version,
        )
        if guard_resp:
            return postprocess_response(guard_resp)

    
        prompt = (
            f"{prompt_template}\n\n"
            f"PageContext: {page_context}\n"
            f"UserQuestion: {message}\n\n"
            f"{decision.module.value}_JSON:\n"
            f"{report_json if report_json else {}}\n"
        )

        client = get_llm_client()
        text = client.generate(prompt)

        return postprocess_response( {
            "answer": text,
            "module": decision.module.value,
            "prompt_version": prompt_version,
            "sources_used": ["report_json"]
        })

    # --- LEAD_CAPTURE ---
    if decision.module == RouteModule.LEAD_CAPTURE:
        questions = load_intake_questions(kb_dir=KB_DIR)

        state = get_session(sid)
        if state is None:
            state = start_state(questions)

        result = handle_turn(state, questions, user_text=message)
        put_session(sid, result.state)

        resp = {
            "answer": result.message,
            "module": RouteModule.LEAD_CAPTURE.value,
            "prompt_version": prompt_version,
            "sources_used": ["intake_questions.json"]
        }
        if result.done and result.payload is not None:
            resp["lead_payload"] = result.payload
        return resp

    # Fallback (should rarely happen)
    return postprocess_response({
    "answer": decision.fallback_message or _main_menu_text(),
    "module": RouteModule.SAFE_FALLBACK.value,
    "prompt_version": prompt_version,
    "sources_used": [],
    })
