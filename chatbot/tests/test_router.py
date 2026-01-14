# tests/test_router.py
# -----------------------------------------------------------------------------
# Phase 1 Router tests (20 scenarios)
#
# What we’re testing:
# - page_context/report_type overrides (highest confidence, deterministic)
# - strong keyword/phrase triggers (ROADMAP / ASSESSMENT / FAQ)
# - LEAD_CAPTURE via context/report_type (since "assessment" can be ambiguous)
# - SAFE_FALLBACK for ambiguous/low-signal cases

# -----------------------------------------------------------------------------

import pytest

from core.router import route, RouteModule


@pytest.mark.parametrize(
    "page_context,message,report_type,expected",
    [
        # ----------------------------
        # A) Page-context overrides (6)
        # ----------------------------
        ("pricing_page", "Explain my roadmap initiatives and timeline", None, RouteModule.FAQ),
        ("roadmap_report", "What is the pricing plan and refund policy?", None, RouteModule.ROADMAP),
        ("assessment_report", "Explain my roadmap timeline phases", None, RouteModule.ASSESSMENT),
        ("assessment_start", "hello", None, RouteModule.LEAD_CAPTURE),
        ("lead_form", "pricing subscription", None, RouteModule.LEAD_CAPTURE),
        ("roadmap_results", "refund GST cost", None, RouteModule.ROADMAP),

        # ----------------------------
        # B) report_type overrides (4)
        # ----------------------------
        (None, "pricing subscription plan", "roadmap", RouteModule.ROADMAP),
        (None, "roadmap timeline initiatives", "assessment", RouteModule.ASSESSMENT),
        (None, "hi", "pricing", RouteModule.FAQ),
        (None, "start please", "intake", RouteModule.LEAD_CAPTURE),

        # ----------------------------
        # C) Strong keyword/phrase triggers (8)
        # Use many keywords + phrase bonuses to ensure high confidence.
        # ----------------------------
        (
            None,
            "Please explain my roadmap report: roadmap initiatives timeline phases milestones plan",
            None,
            RouteModule.ROADMAP,
        ),
        (
            None,
            "I need the roadmap output explained: explain my roadmap and its timeline initiatives phases",
            None,
            RouteModule.ROADMAP,
        ),
        (
            None,
            "Explain my assessment report and maturity score: governance people process technology tech scores",
            None,
            RouteModule.ASSESSMENT,
        ),
        (
            None,
            "What does my maturity score mean? assessment report: process governance people technology tech",
            None,
            RouteModule.ASSESSMENT,
        ),
        (
            None,
            "What does it cost? pricing subscription plan tiers price cost gst refund module modules",
            None,
            RouteModule.FAQ,
        ),
        (
            None,
            "Pricing plan details: subscription tiers cost price gst refund standalone report module",
            None,
            RouteModule.FAQ,
        ),
        (
            None,
            "How much is the subscription? what does it cost pricing plan tiers price cost gst refund",
            None,
            RouteModule.FAQ,
        ),
        (
            None,
            "Refund policy and GST for pricing: cost price subscription plan tiers refund gst",
            None,
            RouteModule.FAQ,
        ),

        # ----------------------------
        # D) Ambiguous / low-signal fallback (2)
        # ----------------------------
        (None, "hi", None, RouteModule.SAFE_FALLBACK),
        (None, "roadmap pricing", None, RouteModule.SAFE_FALLBACK),
    ],
)
def test_router_20_scenarios(page_context, message, report_type, expected):
    d = route(page_context=page_context, message=message, report_type=report_type)
    assert d.module == expected


def test_fallback_has_message_and_action():
    d = route(page_context=None, message="help", report_type=None)
    assert d.module == RouteModule.SAFE_FALLBACK
    assert d.fallback_message is not None
    assert d.fallback_action is not None
