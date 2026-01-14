# llm/mock_client.py
from __future__ import annotations

from llm.base import LLMClient


class MockLLMClient(LLMClient):
    def generate(self, prompt: str) -> str:
        # Deterministic placeholder so tests stay stable
        return "MOCK_RESPONSE: grounded response would be generated here."
