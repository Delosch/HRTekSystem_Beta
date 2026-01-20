from core.answer_engine import generate

def run_chatbot(
    message: str,
    page_context: str = "dashboard",
    report_json: dict | None = None,
    session_id: str = "default"
) -> str:
    """
    Callable wrapper for API / frontend.
    """
    resp = generate(
        message=message,
        page_context=page_context,
        report_json=report_json or {},
        session_id=session_id
    )
    return resp["answer"]


def main():
    answer = run_chatbot(
        message="Explain my roadmap",
        page_context="roadmap_report",
        report_json={"dummy": True},
        session_id="s1"
    )
    print(answer)


if __name__ == "__main__":
    main()
