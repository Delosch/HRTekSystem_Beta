class MockLLMClient:
    def generate(self, prompt: str) -> str:
        return (
            "## Summary\n"
            "- Mock response (AWS isnot connected yet)\n\n"
            "## Explanation\n"
            "This is a placeholder.\n\n"
            "## Next steps\n"
            "1. Connect Bedrock\n\n"
            "## What I used\n"
            "- MockLLMClient\n\n"
            "## Disclaimer\n"
            "Advisory only.\n"
        )
