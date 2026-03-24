# tests/test_answer_engine.py
# -----------------------------------------------------------------------------
# Phase 1 Answer Engine tests (LLM is mocked/stubbed via MockLLMClient).
#
# What we verify:
# 1) If router chooses FAQ and retriever returns [] -> hallucination guard message
# 2) If router chooses FAQ and retriever returns chunks -> sources_used populated
# 3) If router returns SAFE_FALLBACK -> returns router fallback message (no hallucination)
#
# Notes:
# - These tests run against your REAL kb/ directory.
# - Make sure kb/faqs.json, kb/pricing.json, kb/modules.json exist.
# -----------------------------------------------------------------------------

import pytest

from core.answer_engine import generate


def test_answer_engine_faq_hallucination_guard_when_no_kb_match():
    resp = generate(
        message="Who is the founder of Apple?",
        page_context="pricing_page",
        report_json=None,
        session_id="t1"
    )
    assert isinstance(resp, dict)
    assert "answer" in resp

    ans = resp["answer"].replace("'", "'")
    assert "i don't have approved info for that yet." in ans.lower()

    assert resp["module"] in ["SAFE_FALLBACK", "FAQ"]
    assert resp.get("sources_used", []) == []



def test_answer_engine_faq_returns_sources_when_kb_matches():
    """
    A pricing-related query should retrieve KB chunks and return sources_used IDs.
    """
    resp = generate(
        message="Is GST included in the pricing?",
        page_context="pricing_page",   # forces FAQ mode
        report_json=None,
        session_id="t2"
    )
    assert isinstance(resp, dict)
    assert "answer" in resp
    assert resp["module"] == "FAQ"
    assert isinstance(resp.get("sources_used"), list)
    assert len(resp["sources_used"]) > 0


def test_answer_engine_returns_router_fallback_message_for_low_signal():
    """
    Low-signal message with no context should route to SAFE_FALLBACK and return its message.
    """
    resp = generate(
        message="hi",
        page_context="",               # no known context
        report_json=None,
        session_id="t3"
    )
    assert isinstance(resp, dict)
    assert resp["module"] == "SAFE_FALLBACK"
    assert resp.get("answer")  # non-empty
    # Router fallback message usually contains options or a clarification prompt
    assert ("What would you like to do?" in resp["answer"]) or ("Quick check" in resp["answer"])


def test_answer_engine_lead_capture_ignores_numeric_menu():
    """
    If active_module is LEAD_CAPTURE, typing '1'/'2'/'3' should NOT switch to ROADMAP/ASSESSMENT/FAQ.
    """
    from core.session_store import put_session
    # Force the session into LEAD_CAPTURE mode
    put_session("t_lc_numeric", {"active_module": "LEAD_CAPTURE", "answers": {}, "current_index": 0})

    resp = generate(
        message="1",
        page_context="landing",
        report_json=None,
        session_id="t_lc_numeric"
    )
    # the active module should have remained LEAD_CAPTURE and answer generated for it
    assert resp["module"] == "LEAD_CAPTURE"


def test_answer_engine_menu_text_commands_routing():
    """
    Text commands 'roadmap', 'assessment', 'faq' should trigger corresponding routing.
    """
    resp1 = generate(
        message="roadmap",
        page_context="landing",
        report_json=None,
        session_id="t_txt_1"
    )
    assert resp1["module"] == "ROADMAP"

    resp2 = generate(
        message="assessment",
        page_context="landing",
        report_json=None,
        session_id="t_txt_2"
    )
    assert resp2["module"] == "ASSESSMENT"

    resp3 = generate(
        message="faq",
        page_context="landing",
        report_json=None,
        session_id="t_txt_3"
    )
    assert resp3["module"] == "FAQ"


def test_answer_engine_menu_text_commands_routing_explain_assessment():
    """
    Text command 'explain assessment' should trigger ASSESSMENT routing.
    """
    resp4 = generate(
        message="explain assessment",
        page_context="landing",
        report_json=None,
        session_id="t_txt_4"
    )
    assert resp4["module"] == "ASSESSMENT"


def test_answer_engine_lead_capture_ignores_text_commands():
    """
    If active_module is LEAD_CAPTURE, typing 'roadmap', 'assessment', 'explain assessment', 'faq' should NOT switch modules.
    """
    from core.session_store import put_session

    for word in ["roadmap", "assessment", "explain assessment", "faq"]:
        sid = f"t_lc_{word.replace(' ', '_')}"
        put_session(sid, {"active_module": "LEAD_CAPTURE", "answers": {}, "current_index": 0})
        
        resp = generate(
            message=word,
            page_context="landing",
            report_json=None,
            session_id=sid
        )
        assert resp["module"] == "LEAD_CAPTURE"
