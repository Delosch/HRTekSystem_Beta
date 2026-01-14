# eval/run_eval.py
from __future__ import annotations

import json
import sys
from pathlib import Path
import uuid

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.answer_engine import generate  # noqa: E402


def load_cases(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("golden_questions.json must be a JSON list")
    return data


def run() -> int:
    cases_path = ROOT / "eval" / "golden_questions.json"
    cases = load_cases(cases_path)

    failures = []
    session_id = str(uuid.uuid4())[:8]  # shared session for intake progression

    for c in cases:
        cid = c["id"]
        page_context = c["page_context"]
        msg = c["message"]
        expected = c["expected_module"]
        expect_sources = bool(c.get("expect_sources", False))

        resp = generate(
            message=msg,
            page_context=page_context,
            report_json=None,
            session_id=session_id
        )

        got = resp.get("module")
        sources = resp.get("sources_used", []) or []

        ok = True
        reasons = []

        if got != expected:
            ok = False
            reasons.append(f"module expected={expected} got={got}")

        if expect_sources and len(sources) == 0:
            ok = False
            reasons.append("expected sources_used but got empty")

        if (not expect_sources) and expected == "SAFE_FALLBACK" and len(sources) != 0:
            ok = False
            reasons.append("SAFE_FALLBACK must not cite sources_used")

        if not ok:
            failures.append(
                {
                    "id": cid,
                    "page_context": page_context,
                    "message": msg,
                    "expected_module": expected,
                    "got_module": got,
                    "sources_used": sources,
                    "reasons": reasons,
                    "answer_preview": (resp.get("answer", "")[:160] + "…") if resp.get("answer") else ""
                }
            )

    # Print summary
    total = len(cases)
    passed = total - len(failures)

    print("=" * 80)
    print(f"Eval results: {passed}/{total} passed")
    print("=" * 80)

    if failures:
        print("\nFailures:")
        for f in failures:
            print("-" * 80)
            print(f"[{f['id']}] ctx={f['page_context']}")
            print("msg:", f["message"])
            print("expected:", f["expected_module"], "| got:", f["got_module"])
            print("sources_used:", f["sources_used"])
            print("reasons:", "; ".join(f["reasons"]))
            print("answer_preview:", f["answer_preview"])

        print("\n❌ Eval failed.")
        return 1

    print("\n✅ Eval passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(run())
