# core/prompt_loader.py
from __future__ import annotations

from pathlib import Path


def load_prompt(prompt_name: str, version: str = "v1", prompts_dir: str | Path = "prompts") -> str:
    """
    Loads a prompt markdown file from prompts/{version}/{prompt_name}.md

    Example:
      load_prompt("faq_navigator", "v1") -> prompts/v1/faq_navigator.md
    """
    base = Path(prompts_dir)
    path = base / version / f"{prompt_name}.md"
    if not path.exists():
        raise FileNotFoundError(f"Prompt not found: {path}")
    return path.read_text(encoding="utf-8")
