# tests/test_retriever.py

import json
from pathlib import Path

import pytest

from core.retriever import Retriever


@pytest.fixture()
def kb_dir(tmp_path: Path) -> Path:
    kb = tmp_path / "kb"
    kb.mkdir(parents=True, exist_ok=True)

    # Minimal but representative KBs
    faqs = [
        {
            "id": "faq_1",
            "title": "What modules are available?",
            "text": "Modules include HR Tech Maturity Assessment, Digital Roadmap Generator, Vendor Fit, Shared Services, and Change Management.",
            "tags": ["faq", "modules"],
            "source": "doc",
            "last_updated": "2026-01-11",
        }
    ]

    pricing = [
        {
            "id": "p_1",
            "title": "Starter plan",
            "text": "Starter is ₹0 annual for <250 employees; dashboard only.",
            "tags": ["pricing", "starter", "plan"],
            "source": "pricing",
            "last_updated": "2026-01-11",
        },
        {
            "id": "p_2",
            "title": "Refund policy",
            "text": "Refunds only for technical failure or billing error.",
            "tags": ["pricing", "refund", "policy"],
            "source": "pricing",
            "last_updated": "2026-01-11",
        },
        {
            "id": "p_3",
            "title": "GST note",
            "text": "Prices are exclusive of GST (18%).",
            "tags": ["pricing", "gst", "billing"],
            "source": "pricing",
            "last_updated": "2026-01-11",
        }
    ]

    modules = [
        {
            "id": "m_1",
            "title": "Digital Roadmap Generator",
            "text": "Generates initiatives and a phased timeline for HR transformation.",
            "tags": ["modules", "roadmap"],
            "source": "doc",
            "last_updated": "2026-01-11",
        },
        {
            "id": "m_2",
            "title": "HR Tech Maturity Assessment",
            "text": "Assesses process, technology, governance, and people maturity and outputs a score.",
            "tags": ["modules", "assessment", "maturity"],
            "source": "doc",
            "last_updated": "2026-01-11",
        }
    ]

    (kb / "faqs.json").write_text(json.dumps(faqs, ensure_ascii=False, indent=2), encoding="utf-8")
    (kb / "pricing.json").write_text(json.dumps(pricing, ensure_ascii=False, indent=2), encoding="utf-8")
    (kb / "modules.json").write_text(json.dumps(modules, ensure_ascii=False, indent=2), encoding="utf-8")

    return kb


def test_pricing_question_returns_pricing_chunks(kb_dir: Path):
    r = Retriever(kb_dir=kb_dir)
    chunks = r.retrieve("What is the pricing plan and cost?", top_k=5)
    assert len(chunks) > 0
    assert chunks[0].kb_name == "pricing"


def test_refund_question_returns_refund_chunk(kb_dir: Path):
    r = Retriever(kb_dir=kb_dir)
    chunks = r.retrieve("What is the refund policy?", top_k=5)
    assert len(chunks) > 0
    # ensure refund policy entry is included
    ids = [c.entry["id"] for c in chunks]
    assert "p_2" in ids


def test_gst_question_returns_gst_chunk(kb_dir: Path):
    r = Retriever(kb_dir=kb_dir)
    chunks = r.retrieve("Is GST included in price?", top_k=5)
    assert len(chunks) > 0
    ids = [c.entry["id"] for c in chunks]
    assert "p_3" in ids


def test_module_question_returns_modules_chunks(kb_dir: Path):
    r = Retriever(kb_dir=kb_dir)
    chunks = r.retrieve("Tell me about the roadmap generator module", top_k=5)
    assert len(chunks) > 0
    assert chunks[0].kb_name == "modules"


def test_assessment_question_returns_assessment_module(kb_dir: Path):
    r = Retriever(kb_dir=kb_dir)
    chunks = r.retrieve("What does maturity assessment score mean?", top_k=5)
    assert len(chunks) > 0
    ids = [c.entry["id"] for c in chunks]
    assert "m_2" in ids


def test_irrelevant_question_returns_empty_list(kb_dir: Path):
    r = Retriever(kb_dir=kb_dir)
    chunks = r.retrieve("What is the capital of France?", top_k=5)
    assert chunks == []


def test_low_signal_query_returns_empty_list(kb_dir: Path):
    r = Retriever(kb_dir=kb_dir)
    assert r.retrieve("hi", top_k=5) == []


def test_top_k_limits_results(kb_dir: Path):
    r = Retriever(kb_dir=kb_dir)
    chunks = r.retrieve("pricing plan refund gst cost price", top_k=2)
    assert len(chunks) <= 2


def test_min_score_filters_noise(kb_dir: Path):
    r = Retriever(kb_dir=kb_dir)
    # Force strict threshold to likely empty
    chunks = r.retrieve("modules", top_k=5, min_score=10.0)
    assert chunks == []


def test_can_restrict_search_to_specific_kb(kb_dir: Path):
    r = Retriever(kb_dir=kb_dir)
    chunks = r.retrieve("pricing cost plan", top_k=5, kb_names=["modules"])
    # searching only modules for pricing question should likely yield empty
    assert chunks == []