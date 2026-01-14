# scripts/demo_cli.py
from __future__ import annotations

import sys
from pathlib import Path
import uuid

# Ensure project root (chatbot/) is on sys.path even if run from scripts/
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.answer_engine import generate  # noqa: E402


def main() -> None:
    print("HR-Tek Chatbot — Phase 1 Demo CLI")
    print("Type /help for commands.\n")

    session_id = str(uuid.uuid4())[:8]
    page_context = "landing"

    while True:
        user = input(f"[ctx={page_context} sid={session_id}] You> ").strip()

        if not user:
            # Allow empty input for LEAD_CAPTURE start
            pass

        if user.lower() in {"/quit", "/exit"}:
            print("Bye.")
            return

        if user.lower() == "/help":
            print(
                "\nCommands:\n"
                "  /ctx <value>      Set page_context (pricing_page, roadmap_page, assessment_page, intake, landing)\n"
                "  /sid <value>      Set session_id (useful for LEAD_CAPTURE)\n"
                "  /newsid           Generate a new session_id\n"
                "  /show             Show current context/session\n"
                "  /exit             Quit\n"
            )
            continue

        if user.lower().startswith("/ctx "):
            page_context = user.split(" ", 1)[1].strip()
            page_context= page_context.split()[0] #keep onlt the first token
            print(f"✓ page_context set to: {page_context}\n")
            continue

        if user.lower().startswith("/sid "):
            session_id = user.split(" ", 1)[1].strip()
            print(f"✓ session_id set to: {session_id}\n")
            continue

        if user.lower() == "/newsid":
            session_id = str(uuid.uuid4())[:8]
            print(f"✓ new session_id: {session_id}\n")
            continue

        if user.lower() == "/show":
            print(f"page_context={page_context}\nsession_id={session_id}\n")
            continue

        resp = generate(
            message=user,
            page_context=page_context,
            report_json=None,
            session_id=session_id
        )

        print("\nBot>")
        print(resp.get("answer", ""))
        print(f"\n[module={resp.get('module')} prompt={resp.get('prompt_version')}]")

        sources = resp.get("sources_used", [])
        if sources:
            print("sources_used:", sources)

        if "lead_payload" in resp:
            print("\n--- lead_payload (summary) ---")
            payload = resp["lead_payload"]
            print(f"answered_count: {payload.get('answered_count')} / {payload.get('total_questions')}")
            print("(Full payload available in resp['lead_payload'])")

        print("\n" + "-" * 80 + "\n")


if __name__ == "__main__":
    main()
