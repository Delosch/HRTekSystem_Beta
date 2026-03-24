# tests/test_grounding_guard.py
# ---------------------------------------------------------------------------
# Targeted tests for the grounding guard (safety/grounding_guard.py).
#
# Verifies:
#   1) FAQ with no KB chunks → returns refusal dict (not None)
#   2) FAQ with KB chunks → returns None (proceed normally)
#   3) ROADMAP/ASSESSMENT with no report → returns refusal dict
#   4) ROADMAP/ASSESSMENT with report → returns None
# ---------------------------------------------------------------------------

import pytest

from core.router import RouteModule
from safety.grounding_guard import grounding_guard


# ---- FAQ grounding ----

def test_faq_guard_returns_refusal_when_no_kb_chunks():
    """Core regression test for F-01: guard must RETURN refusal, not discard it."""
    result = grounding_guard(
        RouteModule.FAQ,
        report_json=None,
        kb_chunks=[],       # empty list → no grounding
        prompt_version="v1",
    )
    assert result is not None, "Guard must return a refusal dict when FAQ has no KB chunks"
    assert isinstance(result, dict)
    assert "answer" in result
    assert "approved kb chunks" in result["answer"].lower()
    assert result["module"] == "FAQ"


def test_faq_guard_returns_refusal_when_kb_chunks_is_none():
    result = grounding_guard(
        RouteModule.FAQ,
        report_json=None,
        kb_chunks=None,      # None → no grounding
        prompt_version="v1",
    )
    assert result is not None, "Guard must return refusal when kb_chunks is None"
    assert result["module"] == "FAQ"


def test_faq_guard_passes_when_kb_chunks_present():
    """If KB chunks exist, guard should return None (allow proceeding)."""
    dummy_chunks = [{"id": "faq_1", "text": "some content"}]
    result = grounding_guard(
        RouteModule.FAQ,
        report_json=None,
        kb_chunks=dummy_chunks,
        prompt_version="v1",
    )
    assert result is None, "Guard should return None when KB chunks are present"


# ---- ROADMAP / ASSESSMENT grounding ----

def test_roadmap_guard_returns_refusal_when_no_report():
    result = grounding_guard(
        RouteModule.ROADMAP,
        report_json=None,
        kb_chunks=None,
        prompt_version="v1",
    )
    assert result is not None
    assert result["module"] == "ROADMAP"


def test_roadmap_guard_returns_refusal_when_empty_report():
    result = grounding_guard(
        RouteModule.ROADMAP,
        report_json={},
        kb_chunks=None,
        prompt_version="v1",
    )
    assert result is not None, "Empty dict is falsy for 'not report_json' — should refuse"


def test_roadmap_guard_passes_when_report_present():
    result = grounding_guard(
        RouteModule.ROADMAP,
        report_json={"roadmap_id": "rdm_001", "initiatives": []},
        kb_chunks=None,
        prompt_version="v1",
    )
    assert result is None


def test_assessment_guard_returns_refusal_when_no_report():
    result = grounding_guard(
        RouteModule.ASSESSMENT,
        report_json=None,
        kb_chunks=None,
        prompt_version="v1",
    )
    assert result is not None
    assert result["module"] == "ASSESSMENT"


def test_assessment_guard_passes_when_report_present():
    result = grounding_guard(
        RouteModule.ASSESSMENT,
        report_json={"assessment_id": "asm_001"},
        kb_chunks=None,
        prompt_version="v1",
    )
    assert result is None
