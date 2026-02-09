# llm/client_factory.py
from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv
from llm.base import LLMClient
from llm.bedrock_client import BedrockDeepSeekClient

# Load ONLY the chatbot env file (never repo root .env)
# Priority:
#  1) CHATBOT_ENV_FILE (explicit)
#  2) chatbot/.env.test
#  3) chatbot/.env
BASE = Path(__file__).resolve().parents[1]  # .../chatbot
ENV_FILE = os.getenv("CHATBOT_ENV_FILE") or str(BASE / ".env.test")
if Path(ENV_FILE).exists():
    load_dotenv(dotenv_path=ENV_FILE, override=True)

def get_llm_client() -> LLMClient:
    """
    Bedrock-only client. No mock path. Never returns None.
    Uses BEDROCK_REGION (preferred) or AWS_REGION as fallback.
    """
    # Fail fast on missing critical config
    model_id = os.getenv("BEDROCK_MODEL_ID")
    if not model_id:
        raise RuntimeError("Missing BEDROCK_MODEL_ID in chatbot env file.")

    # Optional: you can keep LLM_PROVIDER for compatibility, but enforce it
    provider = os.getenv("LLM_PROVIDER", "bedrock").strip().lower()
    if provider != "bedrock":
        raise RuntimeError(f"Unsupported LLM_PROVIDER={provider}. Only 'bedrock' is allowed.")

    # Construct Bedrock client (it should read env internally)
    return BedrockDeepSeekClient()
