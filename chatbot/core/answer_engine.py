from llm.mock_client import MockLLMClient

def generate(message: str, page_context: str, report_json: dict | None = None, session_id: str | None = None) -> dict:
    client = MockLLMClient()
    prompt = f"Context: {page_context}\nUser: {message}\n"
    text = client.generate(prompt)
    return {
        "answer": text,
        "module": "MOCK",
        "prompt_version": "v1",
        "sources_used": []
    }
