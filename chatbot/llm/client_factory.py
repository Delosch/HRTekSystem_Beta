# llm/client_factory.py
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

from llm.base import LLMClient
from llm.bedrock_client import BedrockDeepSeekClient
from llm.mock_client import MockLLMClient


# Load repo root .env (so web backend also picks it up)
BASE = Path(__file__).resolve().parents[1]      # .../chatbot
load_dotenv(dotenv_path=BASE.parent / ".env")  # repo root .env


def get_llm_client() -> LLMClient:
    provider = os.getenv("LLM_PROVIDER", "mock").strip().lower()
    if provider == "bedrock":
        return BedrockDeepSeekClient()
    return MockLLMClient()
