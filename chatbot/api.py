from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.answer_engine import generate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    page_context: str | None = "dashboard"
    report_json: dict | None = {}
    session_id: str | None = "default"



@app.post("/chat")
def chat(req: ChatRequest):
    """
    Frontend → FastAPI → AI engine
    """

    result = generate(
        message=req.message,
        page_context=req.page_context,
        report_json=req.report_json,
        session_id=req.session_id,
    )

    reply = result.get("answer") if isinstance(result, dict) else str(result)

    return {
        "reply": reply
    }
