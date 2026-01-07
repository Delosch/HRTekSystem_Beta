from core.answer_engine import generate

def test_generate_returns_dict():
    resp = generate("hi", "landing")
    assert isinstance(resp, dict)
    assert "answer" in resp
    assert "module" in resp
