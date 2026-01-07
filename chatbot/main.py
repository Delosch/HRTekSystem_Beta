from core.answer_engine import generate

def main():
    resp = generate(
        message="Explain my roadmap",
        page_context="roadmap_report",
        report_json={"dummy": True},
        session_id="s1"
    )
    print(resp["answer"])

if __name__ == "__main__":
    main()
