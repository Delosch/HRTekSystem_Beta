from core.prompt_loader import load_prompt

def test_load_prompt_faq_v1():
    txt = load_prompt("faq_navigator", version="v1", prompts_dir="prompts")
    assert isinstance(txt, str)
    assert "Hard Grounding Rule" in txt
