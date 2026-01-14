from __future__ import annotations


import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv
ENV_PATH = ROOT.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

print("AWS_ACCESS_KEY_ID loaded?", bool(os.getenv("AWS_ACCESS_KEY_ID")))
print("AWS_SECRET_ACCESS_KEY loaded?", bool(os.getenv("AWS_SECRET_ACCESS_KEY")))
print("AWS_REGION:", os.getenv("AWS_REGION"))

import os
print("BEDROCK_MODEL_ID:", os.getenv("BEDROCK_MODEL_ID"))


from llm.client_factory import get_llm_client


def main():
    os.environ["LLM_PROVIDER"] = "bedrock"
    client = get_llm_client()

    prompt = "Answer in one line: What is the purpose of a hello world program?"
    out = client.generate(prompt)
    print(out)


if __name__ == "__main__":
    main()
