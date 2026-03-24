import pytest
from llm.bedrock_client import _clean_model_text

def test_clean_model_text_removes_think_tags():
    raw = "<think>internal reasoning</think>\nHere is the real output."
    cleaned = _clean_model_text(raw)
    assert cleaned == "Here is the real output."

def test_clean_model_text_does_not_truncate_at_summary():
    """
    Valid model output must not be truncated just because it contains ### Summary.
    """
    raw = "Here is the introduction.\n\n### Summary\nThis is the summary."
    cleaned = _clean_model_text(raw)
    assert cleaned == "Here is the introduction.\n\n### Summary\nThis is the summary."
    
def test_clean_model_text_normalizes_whitespace():
    raw = "Line 1\n\n\n\nLine 2"
    cleaned = _clean_model_text(raw)
    assert cleaned == "Line 1\n\nLine 2"
