# core/retriever.py
# -----------------------------------------------------------------------------
# Phase 1 MVP: RAG-lite retriever for KB (FAQ / Modules / Pricing)
#
# Goal:
#   Given a question, return top_k relevant KB chunks using deterministic scoring:
#     - keyword overlap (token intersection)
#     - tag match (if query contains tag tokens)
#
# Design:
#   - No embeddings, no vector DB (Phase 2+)
#   - Fast: O(N * small_token_ops), suitable for MVP
#   - Safe: returns [] if nothing relevant (answer_engine will safe-fallback)
# -----------------------------------------------------------------------------

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import json
import re


# ----------------------------
# Public result type
# ----------------------------

@dataclass(frozen=True)
class RetrievedChunk:
    score: float
    kb_name: str                 # "pricing" | "modules" | "faqs" | etc.
    entry: Dict[str, Any]        # original KB entry JSON


# ----------------------------
# Retriever
# ----------------------------

class Retriever:
    """
    Loads KB JSON files and retrieves top_k chunks for a query.
    """
    def __init__(
        self,
        kb_dir: str | Path = "kb",
        kb_files: Optional[Dict[str, str]] = None,
    ) -> None:
        self.kb_dir = Path(kb_dir)
        self.kb_files = kb_files or {
            "faqs": "faqs.json",
            "pricing": "pricing.json",
            "modules": "modules.json",
        }

        # cache: kb_name -> list[entry]
        self._kb_cache: Dict[str, List[Dict[str, Any]]] = {}
        # cache: (kb_name, entry_id) -> token set for entry text
        self._entry_tokens: Dict[Tuple[str, str], set[str]] = {}
        # cache: (kb_name, entry_id) -> tag token set
        self._entry_tag_tokens: Dict[Tuple[str, str], set[str]] = {}

    # ----------------------------
    # Main API
    # ----------------------------

    def retrieve(self, question: str, top_k: int = 5, kb_names: list[str] | None = None, min_score: float = 1.2):

        """
        Input: question (string)
        Output: list of top_k RetrievedChunk sorted by score desc.

        min_score:
          - If best score is below min_score, return [] (safe behavior).
          - Tune lightly if needed; keep stable for Phase 1.
        """
        q_norm = _normalize_text(question)
        q_tokens = _tokenize(q_norm)

        # Low-signal query (e.g. "hi") -> return empty quickly
        if len(q_tokens) < 2:
            return []

        query_tag_tokens = q_tokens  # we simply reuse tokens to match tags

        kb_to_search = kb_names or list(self.kb_files.keys())

        scored: List[RetrievedChunk] = []
        for kb_name in kb_to_search:
            entries = self._load_kb(kb_name)
            for entry in entries:
                entry_id = str(entry.get("id", "")).strip()
                if not entry_id:
                    # Skip malformed entries
                    continue

                text_tokens = self._get_entry_text_tokens(kb_name, entry_id, entry)
                tag_tokens = self._get_entry_tag_tokens(kb_name, entry_id, entry)

                score, dbg = _score_entry(q_tokens, query_tag_tokens, text_tokens, tag_tokens)

                if score > 0:
                    # attach optional debug for development if you want later
                    scored.append(RetrievedChunk(score=score, kb_name=kb_name, entry=entry))

        # Sort by score desc; deterministic tie-breaker by id
        scored.sort(key=lambda c: (-c.score, str(c.entry.get("id", ""))))

        # Apply top_k
        top = scored[: max(0, int(top_k))]

        # Safety: if nothing meets threshold, return empty
        if not top or top[0].score < min_score:
            return []

        # Optionally filter out very weak tail results:
        # keep results that are within 60% of best score (prevents noise)
        best = top[0].score
        filtered = [c for c in top if c.score >= best * 0.60]

        return filtered

    # ----------------------------
    # KB load & token caches
    # ----------------------------

    def _load_kb(self, kb_name: str) -> List[Dict[str, Any]]:
        if kb_name in self._kb_cache:
            return self._kb_cache[kb_name]

        if kb_name not in self.kb_files:
            raise ValueError(f"Unknown kb_name: {kb_name}")

        path = self.kb_dir / self.kb_files[kb_name]
        if not path.exists():
            # For Phase 1 we fail loudly so you notice missing KB files.
            raise FileNotFoundError(f"KB file not found: {path}")

        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)

        if not isinstance(data, list):
            raise ValueError(f"KB file must contain a JSON list: {path}")

        self._kb_cache[kb_name] = data
        return data

    def _get_entry_text_tokens(self, kb_name: str, entry_id: str, entry: Dict[str, Any]) -> set[str]:
        key = (kb_name, entry_id)
        if key in self._entry_tokens:
            return self._entry_tokens[key]

        # Build text blob from title + text (most useful)
        title = str(entry.get("title", ""))
        text = str(entry.get("text", ""))
        blob = f"{title} {text}"
        blob_norm = _normalize_text(blob)
        tokens = set(_tokenize(blob_norm))
        self._entry_tokens[key] = tokens
        return tokens

    def _get_entry_tag_tokens(self, kb_name: str, entry_id: str, entry: Dict[str, Any]) -> set[str]:
        key = (kb_name, entry_id)
        if key in self._entry_tag_tokens:
            return self._entry_tag_tokens[key]

        tags = entry.get("tags", [])
        if not isinstance(tags, list):
            tags = []

        # Tags may contain hyphenated tokens like "employee-size" → split to tokens
        tag_blob = " ".join(str(t) for t in tags)
        tag_norm = _normalize_text(tag_blob)
        tag_tokens = set(_tokenize(tag_norm))
        self._entry_tag_tokens[key] = tag_tokens
        return tag_tokens


# ----------------------------
# Scoring helpers (deterministic)
# ----------------------------

def _score_entry(
    q_tokens: List[str],
    q_tag_tokens: List[str],
    entry_text_tokens: set[str],
    entry_tag_tokens: set[str],
) -> Tuple[float, Dict[str, Any]]:
    """
    Returns a score in [0, ~2] range (not normalized).
    Deterministic scoring for Phase 1:

    - keyword overlap: intersection count / sqrt(len(query_tokens))
    - tag match bonus: if query tokens overlap entry tags
    - small boost if query contains "price/cost/pricing" and entry has pricing tags/text tokens
    """
    q_set = set(q_tokens)

    # keyword overlap
    overlap = q_set.intersection(entry_text_tokens)
    overlap_count = len(overlap)

    # quick reject: no overlap and no tag match
    tag_overlap = q_set.intersection(entry_tag_tokens)
    if overlap_count == 0 and len(tag_overlap) == 0:
        return 0.0, {"reason": "no_overlap"}


    # normalize overlap by query length (prevents long queries from dominating)
    denom = max(1.0, (len(q_set) ** 0.5))
    keyword_score = overlap_count / denom

    # tag bonus (tags are curated, so treat as strong signals)
    tag_score = 0.0
    if len(tag_overlap) > 0:
        # bounded bonus
        tag_score = min(0.8, 0.25 + 0.15 * len(tag_overlap))

    # domain bump: pricing-like query → pricing chunks bubble up
    pricing_terms = {"pricing", "price", "cost", "subscription", "plan", "gst", "refund"}
    pricing_bump = 0.0
    if q_set.intersection(pricing_terms):
        # if entry tags or text contain pricing terms, bump it
        if entry_tag_tokens.intersection({"pricing", "billing", "payments"}) or entry_text_tokens.intersection(pricing_terms):
            pricing_bump = 0.20

    score = float(keyword_score + tag_score + pricing_bump)

    dbg = {
        "overlap_count": overlap_count,
        "tag_overlap": list(tag_overlap),
        "keyword_score": round(keyword_score, 3),
        "tag_score": round(tag_score, 3),
        "pricing_bump": round(pricing_bump, 3),
        "final": round(score, 3),
    }
    return score, dbg


# ----------------------------
# Text normalization utilities
# ----------------------------

_WS_RE = re.compile(r"\s+")
_KEEP_RE = re.compile(r"[^a-z0-9\s\-–]")  # keep hyphens/dashes


STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "but", "by",
    "for", "from", "has", "have", "how", "i", "in", "into", "is",
    "it", "its", "me", "my", "of", "on", "or", "our", "so", "that",
    "the", "their", "then", "there", "these", "they", "this", "to",
    "was", "we", "were", "what", "when", "where", "which", "who",
    "will", "with", "you", "your"
}

def _normalize_text(text: str) -> str:
    if text is None:
        return ""
    t = text.lower().strip()
    t = _KEEP_RE.sub(" ", t)
    t = _WS_RE.sub(" ", t).strip()
    return t

def _tokenize(normalized_text: str) -> List[str]:
    if not normalized_text:
        return []
    toks = [tok for tok in normalized_text.split(" ") if tok]
    # Remove stopwords + 1-char tokens (noise)
    return [t for t in toks if t not in STOPWORDS and len(t) > 1]
