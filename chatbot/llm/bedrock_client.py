# llm/bedrock_client.py
from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Optional
import re
from dotenv import load_dotenv
from pathlib import Path

# load repo root .env (assuming llm/ is inside chatbot/)
BASE = Path(__file__).resolve().parents[1]   # .../chatbot
load_dotenv(dotenv_path=BASE.parent / ".env")


import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

from llm.base import LLMClient


@dataclass(frozen=True)
class BedrockConfig:
    region: str
    model_id: str
    max_tokens: int
    temperature: float
    top_p: float
    connect_timeout: int
    read_timeout: int
    retries: int


def load_bedrock_config() -> BedrockConfig:
    region = os.getenv("AWS_REGION", "us-west-2")
    model_id = os.getenv("BEDROCK_MODEL_ID", "us.deepseek.r1-v1:0")

    max_tokens = int(os.getenv("BEDROCK_MAX_TOKENS", "1024"))
    temperature = float(os.getenv("BEDROCK_TEMPERATURE", "0.1"))
    top_p = float(os.getenv("BEDROCK_TOP_P", "0.9"))

    connect_timeout = int(os.getenv("BEDROCK_CONNECT_TIMEOUT", "30"))
    read_timeout = int(os.getenv("BEDROCK_READ_TIMEOUT", "300"))
    retries = int(os.getenv("BEDROCK_RETRIES", "3"))

    return BedrockConfig(
        region=region,
        model_id=model_id,
        max_tokens=max_tokens,
        temperature=temperature,
        top_p=top_p,
        connect_timeout=connect_timeout,
        read_timeout=read_timeout,
        retries=retries,
    )


def _format_deepseek_prompt(user_prompt: str) -> str:
    """
    DeepSeek-R1 on Bedrock InvokeModel expects prompt in DeepSeek's instruction format.
    AWS docs show using: <｜begin▁of▁sentence｜><｜User｜>...<｜Assistant｜><think>
    We wrap the entire constructed prompt as the 'user' content.
    """
    # Keep it minimal and deterministic.
    return (
        "<｜begin▁of▁sentence｜><｜User｜>\n"
        f"{user_prompt}\n"
        "<｜Assistant｜><think>\n"
    )


def _strip_think(text: str) -> str:
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


import re

def _clean_model_text(text: str) -> str:
    if not text:
        return ""

    # 1) Remove <think>...</think>
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)

    # 2) If the model repeats sections, keep only the last "### Summary" block (most stable)
    marker = "### Summary"
    if marker in text:
        text = text[text.rfind(marker):]

    # 3) Normalize whitespace
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


class BedrockDeepSeekClient(LLMClient):
    def __init__(self, cfg: Optional[BedrockConfig] = None):
        self.cfg = cfg or load_bedrock_config()

        # Boto3 retries + timeouts:
        # - botocore Config supports retries and timeouts.
        # - Bedrock inference can be slow; increase read_timeout if needed.
        client_config = Config(
            connect_timeout=self.cfg.connect_timeout,
            read_timeout=self.cfg.read_timeout,
            retries={"max_attempts": self.cfg.retries, "mode": "standard"},
        )

        self.client = boto3.client("bedrock-runtime",  region_name=self.cfg.region, config=client_config)

    def generate(self, prompt: str) -> str:
        formatted_prompt = _format_deepseek_prompt(prompt)

        body = json.dumps(
            {
                "prompt": formatted_prompt,
                "max_tokens": self.cfg.max_tokens,
                "temperature": self.cfg.temperature,
                "top_p": self.cfg.top_p,
                # stop optional; omit for now for MVP
            }
        )

        try:
            resp = self.client.invoke_model(
                modelId=self.cfg.model_id,
                body=body,
            )
            payload = json.loads(resp["body"].read())

            # DeepSeek Invoke response: {"choices":[{"text": "...", "stop_reason": "..."}]}
            choices = payload.get("choices", [])
            if not choices:
                return ""

            text = choices[0].get("text", "")
            return _clean_model_text(text.strip())


        except ClientError as e:
            # Keep errors clean (don’t dump giant traces in UI)
            msg = e.response.get("Error", {}).get("Message", str(e))
            raise RuntimeError(f"Bedrock invoke_model failed: {msg}") from e
        except Exception as e:
            raise RuntimeError(f"Bedrock invoke_model failed: {e}") from e
