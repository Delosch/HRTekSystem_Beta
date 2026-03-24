# core/router.py
# Goal:Deterministically select the correct bot "mode" BEFORE calling the LLM.
# Modes:ROADMAP, ASSESSMENT, FAQ, LEAD_CAPTURE, SAFE_FALLBACK

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
import re
from typing import Dict, List, Optional, Tuple


class RouteModule(str, Enum):
    ROADMAP = "ROADMAP"
    ASSESSMENT = "ASSESSMENT"
    FAQ = "FAQ"       # FAQ mode = Direct KB answers (pricing, plans, modules, policies)
    LEAD_CAPTURE = "LEAD_CAPTURE"
    SAFE_FALLBACK = "SAFE_FALLBACK"


class FallbackAction(str, Enum):
    ASK_CLARIFYING_QUESTION = "ASK_CLARIFYING_QUESTION"
    PRESENT_TWO_OPTIONS = "PRESENT_TWO_OPTIONS"
    NONE = "NONE"


@dataclass(frozen=True)
class RouteDecision:
    module: RouteModule
    confidence: float  # 0.0..1.0
    reason: str
    matched_signals: Dict[str, object]  # for debugging/tests
    fallback_action: FallbackAction
    fallback_message: Optional[str]


@dataclass(frozen=True)
class RouterConfig:
    # thresholds
    high_confidence_threshold: float = 0.70
    low_confidence_threshold: float = 0.45

    # fallback behavior when unsure
    default_fallback_action: FallbackAction = FallbackAction.PRESENT_TWO_OPTIONS

    # scoring weights (keep these stable for Phase 1)
    page_context_boost: float = 0.85  # near certain when context is explicit
    report_type_boost: float = 0.95   # even stronger than page context

    keyword_weight: float = 0.12
    exact_phrase_bonus: float = 0.18

    # low-signal protection
    min_tokens_for_keywords: int = 2

    # ambiguity detection: if top2 scores are too close, fallback
    ambiguous_delta: float = 0.15


# -------------------------
# Keyword/Phrase dictionaries
# -------------------------
# Keep minimal to avoid false positives.
# If you expand, update tests accordingly.

ROADMAP_KEYWORDS = {
    "roadmap", "initiative", "initiatives", "timeline", "phase", "phases", "milestone", "milestones", "plan"
}
ASSESSMENT_KEYWORDS = {
    "maturity", "assessment", "score", "scores", "process", "technology", "tech", "governance", "people"
}
FAQ_KEYWORDS = {
    "pricing", "price", "cost", "subscription", "plan", "plans", "module", "modules", "tier", "tiers", "refund", "gst"
}
LEAD_CAPTURE_KEYWORDS = {
    "start", "begin", "questions", "questionnaire", "intake", "assess", "assessment", "evaluate", "help me decide"
}

ROADMAP_PHRASES = {
    "explain my roadmap", "roadmap report", "roadmap output", "roadmap initiatives"
}
ASSESSMENT_PHRASES = {
    "maturity score", "assessment report", "explain my assessment", "explain my maturity"
}
FAQ_PHRASES = {
    "how much", "what does it cost", "pricing plan", "subscription plan", "standalone report"
}
LEAD_CAPTURE_PHRASES = {
    "start assessment", "ask me questions", "guide me", "help me choose"
}

# Page context mapping
PAGE_CONTEXT_TO_MODULE = {
    # Roadmap contexts
    "roadmap_report": RouteModule.ROADMAP,
    "roadmap_page": RouteModule.ROADMAP,
    "roadmap_results": RouteModule.ROADMAP,

    # Assessment contexts
    "assessment_report": RouteModule.ASSESSMENT,
    "assessment_page": RouteModule.ASSESSMENT,
    "maturity_results": RouteModule.ASSESSMENT,

    # Pricing contexts
    "pricing": RouteModule.FAQ,
    "pricing_page": RouteModule.FAQ,
    "plans_page": RouteModule.FAQ,

    # Intake contexts
    "assessment_start": RouteModule.LEAD_CAPTURE,
    "start_assessment": RouteModule.LEAD_CAPTURE,
    "intake": RouteModule.LEAD_CAPTURE,
    "lead_form": RouteModule.LEAD_CAPTURE,
}

REPORT_TYPE_TO_MODULE = {
    "roadmap": RouteModule.ROADMAP,
    "roadmap_report": RouteModule.ROADMAP,
    "assessment": RouteModule.ASSESSMENT,
    "assessment_report": RouteModule.ASSESSMENT,
    "maturity": RouteModule.ASSESSMENT,
    "faq": RouteModule.FAQ,
    "pricing": RouteModule.FAQ,
    "lead_capture": RouteModule.LEAD_CAPTURE,
    "intake": RouteModule.LEAD_CAPTURE,
}


# =========================
# Public API
# =========================

def interpret_menu_choice(message: str) -> RouteModule | None:
    t = (message or "").strip().lower()

    if t in {"roadmap"}:
        return RouteModule.ROADMAP

    if t in {"assessment", "maturity", "explain assessment", "explain assesment"}:
        return RouteModule.ASSESSMENT

    if t in {"faq", "pricing", "plans"}:
        return RouteModule.FAQ


    return None



def route(
    page_context: Optional[str],
    message: str,
    report_type: Optional[str] = None,
    config: Optional[RouterConfig] = None
) -> RouteDecision:
    """
    Main entry point for routing.
    """

    cfg = config or RouterConfig()

    choice = interpret_menu_choice(message)
    if choice is not None:
        return RouteDecision(
            module=choice,
            confidence=0.99,
            reason="menu_choice",
            matched_signals={"source": "menu_choice"},
            fallback_action=FallbackAction.NONE,
            fallback_message=None,
        )


    normalized_message = _normalize_text(message)
    tokens = _tokenize(normalized_message)

    # 1) Strong context signals
    context_signal = _infer_from_context(page_context=page_context, report_type=report_type)
    forced = context_signal.get("forced_module")

    if forced is not None:
        return RouteDecision(
        module=forced,
        confidence=1.0,
        reason=f"Forced by {context_signal.get('source')}: {context_signal.get('reason')}",
        matched_signals={"context": context_signal},
        fallback_action=FallbackAction.NONE,
        fallback_message=None,
        )


    # 2) Keyword/phrase signals
    keyword_signal = _infer_from_keywords(normalized_message, tokens, cfg)

    # 3) Merge into scores
    score_map = _merge_signals_to_scores(context_signal, keyword_signal, cfg)

    # 4) Choose best + confidence
    best_module, confidence, top2 = _choose_best_module(score_map)

    # 5) Build final decision (may fallback)
    return _build_decision(
        best_module=best_module,
        confidence=confidence,
        score_map=score_map,
        top2=top2,
        context_signal=context_signal,
        keyword_signal=keyword_signal,
        cfg=cfg
    )


def route_module_only(
    page_context: Optional[str],
    message: str,
    report_type: Optional[str] = None,
    config: Optional[RouterConfig] = None
) -> RouteModule:
    """Convenience: return only the module."""
    return route(page_context, message, report_type, config).module


def needs_fallback(decision: RouteDecision) -> bool:
    """True if router requires clarification rather than proceeding."""
    return decision.module == RouteModule.SAFE_FALLBACK and decision.fallback_action != FallbackAction.NONE


# =========================
# Context inference
# =========================

def _infer_from_context(page_context: Optional[str], report_type: Optional[str]) -> Dict[str, object]:
    """
    Context signal builder (strongest signal).
    """
    ctx = (page_context or "").strip().lower()
    rpt = (report_type or "").strip().lower()

    forced_module = None
    reason = None
    source = None

    # report_type overrides page_context (caller knows best)
    if rpt and rpt in REPORT_TYPE_TO_MODULE:
        forced_module = REPORT_TYPE_TO_MODULE[rpt]
        reason = f"report_type={rpt}"
        source = "report_type"
    elif ctx and ctx in PAGE_CONTEXT_TO_MODULE:
        forced_module = PAGE_CONTEXT_TO_MODULE[ctx]
        reason = f"page_context={ctx}"
        source = "page_context"

    return {
        "forced_module": forced_module,
        "reason": reason,
        "source": source
    }


# =========================
# Keyword inference
# =========================

def _infer_from_keywords(normalized_message: str, tokens: List[str], cfg: RouterConfig) -> Dict[str, object]:
    """
    Keyword+phrase signal builder (supporting evidence).
    """
    matches: Dict[RouteModule, List[str]] = {m: [] for m in RouteModule}
    boosts: Dict[RouteModule, float] = {m: 0.0 for m in RouteModule}

    # Very short messages => low signal (avoid false routing)
    if len(tokens) < cfg.min_tokens_for_keywords:
        return {"matches": matches, "boosts": boosts, "reason": "message too short"}

    token_set = set(tokens)

    # Token keyword matches
    _collect_token_matches(token_set, ROADMAP_KEYWORDS, RouteModule.ROADMAP, matches)
    _collect_token_matches(token_set, ASSESSMENT_KEYWORDS, RouteModule.ASSESSMENT, matches)
    _collect_token_matches(token_set, FAQ_KEYWORDS, RouteModule.FAQ, matches)
    _collect_token_matches(token_set, LEAD_CAPTURE_KEYWORDS, RouteModule.LEAD_CAPTURE, matches)

    # Phrase matches (higher confidence)
    _collect_phrase_bonus(normalized_message, ROADMAP_PHRASES, RouteModule.ROADMAP, matches, boosts, cfg)
    _collect_phrase_bonus(normalized_message, ASSESSMENT_PHRASES, RouteModule.ASSESSMENT, matches, boosts, cfg)
    _collect_phrase_bonus(normalized_message, FAQ_PHRASES, RouteModule.FAQ, matches, boosts, cfg)
    _collect_phrase_bonus(normalized_message, LEAD_CAPTURE_PHRASES, RouteModule.LEAD_CAPTURE, matches, boosts, cfg)

    # Convert token matches to boosts
    for module in (RouteModule.ROADMAP, RouteModule.ASSESSMENT, RouteModule.FAQ, RouteModule.LEAD_CAPTURE):
        uniq = len(set(matches[module]))
        boosts[module] += min(0.60, uniq * cfg.keyword_weight)

    return {"matches": matches, "boosts": boosts, "reason": "keyword/phrase inference"}


def _collect_token_matches(token_set: set, keywords: set, module: RouteModule, matches: Dict[RouteModule, List[str]]) -> None:
    for kw in keywords:
        if kw in token_set:
            matches[module].append(kw)


def _collect_phrase_bonus(
    normalized_message: str,
    phrases: set,
    module: RouteModule,
    matches: Dict[RouteModule, List[str]],
    boosts: Dict[RouteModule, float],
    cfg: RouterConfig
) -> None:
    for phrase in phrases:
        if phrase in normalized_message:
            matches[module].append(phrase)
            boosts[module] += cfg.exact_phrase_bonus


# =========================
# Score merge & selection
# =========================

def _merge_signals_to_scores(
    context_signal: Dict[str, object],
    keyword_signal: Dict[str, object],
    cfg: RouterConfig
) -> Dict[RouteModule, float]:
    """
    Combine context and keyword signals into a per-module score map.
    SAFE_FALLBACK is never scored directly.
    """
    scores: Dict[RouteModule, float] = {m: 0.0 for m in RouteModule}

    forced_module: Optional[RouteModule] = context_signal.get("forced_module")  # type: ignore

    if forced_module is not None:
        # Distinguish report_type vs page_context for strength
        source = context_signal.get("source")
        if source == "report_type":
            scores[forced_module] += cfg.report_type_boost
        else:
            scores[forced_module] += cfg.page_context_boost

    boosts: Dict[RouteModule, float] = keyword_signal.get("boosts", {})  # type: ignore
    for module, boost in boosts.items():
        # ignore SAFE_FALLBACK
        if module != RouteModule.SAFE_FALLBACK:
            scores[module] += float(boost)

    return scores


def _choose_best_module(score_map: Dict[RouteModule, float]) -> Tuple[RouteModule, float, List[Tuple[RouteModule, float]]]:
    """
    Choose best module and compute confidence based on top score + margin vs runner-up.
    Returns top2 list for ambiguity checks.
    """
    candidates = [(m, s) for m, s in score_map.items() if m != RouteModule.SAFE_FALLBACK]
    candidates.sort(key=lambda x: x[1], reverse=True)

    best_module, best_score = candidates[0]
    runner_up_score = candidates[1][1] if len(candidates) > 1 else 0.0

    # Confidence: score magnitude + separation
    separation = max(0.0, best_score - runner_up_score)
    confidence = min(1.0, max(0.0, best_score * 0.85 + separation * 0.75))

    return best_module, confidence, candidates[:2]


# =========================
# Decision / fallback
# =========================

def _build_decision(
    best_module: RouteModule,
    confidence: float,
    score_map: Dict[RouteModule, float],
    top2: List[Tuple[RouteModule, float]],
    context_signal: Dict[str, object],
    keyword_signal: Dict[str, object],
    cfg: RouterConfig
) -> RouteDecision:
    """
    Build final RouteDecision.
    Falls back if low confidence or ambiguous.
    """
    matched_signals = {
        "context": context_signal,
        "keywords": {
            "reason": keyword_signal.get("reason"),
            "matches": _serialize_matches(keyword_signal.get("matches", {}))
        },
        "scores": {m.value: round(score_map[m], 3) for m in score_map},
        "top2": [(m.value, round(s, 3)) for m, s in top2]
    }

    # Ambiguity guard: if top2 are close, don't guess
    ambiguous = False
    if len(top2) >= 2:
        delta = top2[0][1] - top2[1][1]
        if delta < cfg.ambiguous_delta and confidence < cfg.high_confidence_threshold:
            ambiguous = True

    if confidence >= cfg.high_confidence_threshold and not ambiguous:
        return RouteDecision(
            module=best_module,
            confidence=round(confidence, 3),
            reason=f"High confidence via signals; route={best_module.value}",
            matched_signals=matched_signals,
            fallback_action=FallbackAction.NONE,
            fallback_message=None
        )

    # Low or medium confidence -> SAFE_FALLBACK
    fallback_action = cfg.default_fallback_action
    fallback_message = _build_fallback_message(fallback_action)

    reason = "Low confidence routing; fallback"
    if ambiguous:
        reason = "Ambiguous routing; fallback"

    return RouteDecision(
        module=RouteModule.SAFE_FALLBACK,
        confidence=round(confidence, 3),
        reason=reason,
        matched_signals=matched_signals,
        fallback_action=fallback_action,
        fallback_message=fallback_message
    )


def _build_fallback_message(action: FallbackAction) -> str:
    """
    User-facing fallback prompt when routing is unclear.
    Keep it short and actionable.
    """
    if action == FallbackAction.ASK_CLARIFYING_QUESTION:
        return "Quick check — do you want help with your Roadmap or your Assessment/Maturity results?"
    if action == FallbackAction.PRESENT_TWO_OPTIONS:
        return "What would you like to do?\n- roadmap (Explain my Roadmap)\n- assessment (Explain my Assessment/Maturity results)\n- faq (Pricing, billing, refunds, modules)"
    return "Could you clarify what you want help with?"


def _serialize_matches(raw_matches: object) -> Dict[str, List[str]]:
    """
    Convert matches dict keyed by RouteModule into JSON-serializable dict keyed by strings.
    """
    out: Dict[str, List[str]] = {}
    if not isinstance(raw_matches, dict):
        return out
    for k, v in raw_matches.items():
        key = k.value if isinstance(k, RouteModule) else str(k)
        if isinstance(v, list):
            out[key] = [str(x) for x in v]
    return out


# =========================
# Text utilities
# =========================

_WHITESPACE_RE = re.compile(r"\s+")
# Keep letters/numbers/spaces; convert most punctuation to spaces.
# We keep dashes because roadmap timelines may include "12-24".
_PUNCT_RE = re.compile(r"[^a-z0-9\s\-–]")

def _normalize_text(text: str) -> str:
    if text is None:
        return ""
    t = text.lower().strip()
    t = _PUNCT_RE.sub(" ", t)
    t = _WHITESPACE_RE.sub(" ", t).strip()
    return t


def _tokenize(normalized_text: str) -> List[str]:
    if not normalized_text:
        return []
    return [tok for tok in normalized_text.split(" ") if tok]
