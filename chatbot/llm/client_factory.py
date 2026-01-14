# llm/client_factory.py
from __future__ import annotations

import os

from llm.mock_client import MockLLMClient
from llm.bedrock_client import BedrockDeepSeekClient
from llm.base import LLMClient


def get_llm_client() -> LLMClient:
    provider = os.getenv("LLM_PROVIDER", "mock").strip().lower()
    if provider == "bedrock":
        return BedrockDeepSeekClient()
    return MockLLMClient()
