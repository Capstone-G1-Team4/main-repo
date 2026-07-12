"""
FastAPI service exposing the Agentic RAG shopping assistant.

Integration notes for the frontend/backend team:
- The frontend should generate a session_id once (e.g. uuid stored in
  localStorage) and send it with every /chat request.
- On page load, call GET /chat/{session_id}/history to restore the
  conversation — chat history is persisted server-side in SQLite,
  so nothing is lost when the user leaves the page.

Run:  uvicorn app.main:app --reload
Docs: http://localhost:8000/docs
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.agent.agent import shopping_agent
from app.agent.memory import (
    clear_session,
    get_history,
    get_session,
    list_sessions,
)

app = FastAPI(
    title="Agentic RAG Shopping Assistant",
    description="AI service: product search, comparison, Q&A, and conversational ordering.",
    version="1.0.0",
)

# Allow the frontend (any origin during development) to call this API.
# TODO before production: restrict allow_origins to the deployed frontend URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    session_id: str = Field(..., min_length=1, description="Stable id per user/browser session")
    message: str = Field(..., min_length=1, description="The user's message")


class ChatResponse(BaseModel):
    session_id: str
    response: str
    intent: str
    order: dict | None = None


@app.get("/")
def home():
    return {"message": "AI Service is running", "docs": "/docs"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """Send one user message to the agent and get its reply."""
    result = shopping_agent(request.message, user_id=request.session_id)
    return ChatResponse(
        session_id=request.session_id,
        response=result["response"],
        intent=result["intent"],
        order=result["order"],
    )


@app.get("/chat/{session_id}/history")
def chat_history(session_id: str, limit: int = 100):
    """Full chat history for a session (use on page load to restore the chat)."""
    return {"session_id": session_id, "messages": get_history(session_id, limit=limit)}


@app.get("/chat/{session_id}/orders")
def session_orders(session_id: str):
    """Orders placed in this session (for the backend to consume)."""
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"session_id": session_id, "orders": session.get("orders") or []}


@app.delete("/chat/{session_id}")
def delete_chat(session_id: str):
    """Delete a session and its whole history (e.g. 'clear chat' button)."""
    clear_session(session_id)
    return {"session_id": session_id, "deleted": True}


@app.get("/sessions")
def sessions():
    """List all sessions (debugging / admin)."""
    return {"sessions": list_sessions()}
