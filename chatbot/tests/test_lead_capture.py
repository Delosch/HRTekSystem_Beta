import json
from pathlib import Path

from core.lead_capture import load_intake_questions, start_state, handle_turn

def test_lead_capture_start_shows_first_question(tmp_path: Path):
    kb = tmp_path / "kb"
    kb.mkdir()
    (kb / "intake_questions.json").write_text(json.dumps([
        {"id":"intake_001","section_id":"S1","section_title":"Org","question_number":1,"question":"Size?","answer_type":"single_choice","options":["A","B"]}
    ]), encoding="utf-8")

    qs = load_intake_questions(kb)
    state = start_state(qs)
    r = handle_turn(state, qs, user_text="")
    assert r.done is False
    assert "Q1" in r.message
    assert "1)" in r.message

def test_lead_capture_single_choice_numeric_advances(tmp_path: Path):
    kb = tmp_path / "kb"
    kb.mkdir()
    (kb / "intake_questions.json").write_text(json.dumps([
        {"id":"intake_001","section_id":"S1","section_title":"Org","question_number":1,"question":"Size?","answer_type":"single_choice","options":["A","B"]},
        {"id":"intake_002","section_id":"S1","section_title":"Org","question_number":2,"question":"Industry?","answer_type":"single_choice","options":["X","Y"]}
    ]), encoding="utf-8")

    qs = load_intake_questions(kb)
    state = start_state(qs)

    _ = handle_turn(state, qs, user_text="")
    r2 = handle_turn(state, qs, user_text="2")
    assert r2.state["answers"]["intake_001"] == "B"
    assert "Q2" in r2.message

def test_lead_capture_invalid_answer_repeats(tmp_path: Path):
    kb = tmp_path / "kb"
    kb.mkdir()
    (kb / "intake_questions.json").write_text(json.dumps([
        {"id":"intake_001","section_id":"S1","section_title":"Org","question_number":1,"question":"Size?","answer_type":"single_choice","options":["A","B"]}
    ]), encoding="utf-8")

    qs = load_intake_questions(kb)
    state = start_state(qs)

    _ = handle_turn(state, qs, user_text="")
    r2 = handle_turn(state, qs, user_text="99")
    assert "Please reply with a valid option number" in r2.message
    assert "Q1" in r2.message

def test_lead_capture_multi_choice(tmp_path: Path):
    kb = tmp_path / "kb"
    kb.mkdir()
    (kb / "intake_questions.json").write_text(json.dumps([
        {"id":"intake_019","section_id":"S6","section_title":"Vendor","question_number":19,"question":"Priorities","answer_type":"multi_choice","max_selections":3,"options":["A","B","C","D"]}
    ]), encoding="utf-8")

    qs = load_intake_questions(kb)
    state = start_state(qs)

    _ = handle_turn(state, qs, user_text="")
    r2 = handle_turn(state, qs, user_text="1,3")
    assert r2.done is True
    assert r2.payload["answers"]["intake_019"] == ["A", "C"]
