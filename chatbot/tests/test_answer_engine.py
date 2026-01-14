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
