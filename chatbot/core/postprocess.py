#used to clean the output generated and pass only the required fields as output
from __future__ import annotations

import re
from typing import Any, Dict, List

from core.router import RouteModule



_THINK_RE = re.compile(r"<think>.*?</think>", flags=re.DOTALL | re.IGNORECASE)


def strip_think(text: str) -> str:
    if not text:
        return ""
    return _THINK_RE.sub("", text).strip()


def _has_section(text: str, heading: str) -> bool:
    return heading.lower() in (text or "").lower()


def _render_sources(module: RouteModule, sources_used: List[str]) -> str:
    if sources_used:
        items = "\n".join([f"- {s}" for s in sources_used])
        return items
    # For safety outputs / fallback
    return "- None (no approved source found)"


def _default_disclaimer(module: RouteModule) -> str:
    if module == RouteModule.FAQ:
        return "Advisory only. Based only on approved KB provided."
    if module in {RouteModule.ROADMAP, RouteModule.ASSESSMENT}:
        return "Advisory only. Based only on the provided report."
    if module == RouteModule.LEAD_CAPTURE:
        return "Advisory only. Information captured from user responses."
    return "Advisory only. Based only on available approved sources."


def ensure_required_sections(text: str, module: RouteModule, sources_used: List[str]) -> str:
    out = strip_think(text)

    # Ensure "What I used"
    if not _has_section(out, "### What I used"):
        out = out.rstrip() + "\n\n### What I used\n" + _render_sources(module, sources_used)

    # Ensure Disclaimer
    if not _has_section(out, "### Disclaimer"):
        out = out.rstrip() + "\n\n### Disclaimer\n" + _default_disclaimer(module)

    return out.strip()


def strip_unsupported_claims(text: str, module: RouteModule, sources_used: List[str],no_sources_ok:bool) -> str:
    """
    - If FAQ has no sources, refuse safely (no LLM made-up answers).
    """
    if module == RouteModule.FAQ and not sources_used and not no_sources_ok :
        return (
            "This is not present in the approved knowledge.\n\n"
            "I can't verify this from the approved KB chunks I have."
        )
    return text


def postprocess_response(resp: Dict[str, Any]) -> Dict[str, Any]:
    module_val = (resp.get("module") or "").strip()
    try:
        module = RouteModule(module_val)
    except Exception:
        module = RouteModule.SAFE_FALLBACK

    sources_used = resp.get("sources_used") or []
    if not isinstance(sources_used, list):
        sources_used = []

    no_sources_ok = bool(resp.get("no_sources_ok", False))

    text = resp.get("answer") or ""
    text = strip_unsupported_claims(
        text=text,
        module=module,
        sources_used=sources_used,
        no_sources_ok=no_sources_ok,
    )

    text = ensure_required_sections(text, module, sources_used)

    resp["answer"] = text
    resp["sources_used"] = sources_used

    # housekeeping (don’t leak internal flags)
    resp.pop("no_sources_ok", None)

    return resp


