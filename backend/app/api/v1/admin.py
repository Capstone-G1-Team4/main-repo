"""Admin router: analytics summary, user management, conversation logs, NLP-to-SQL, and voice input."""

import io
import tempfile
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, File, Query, UploadFile
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.core.deps import AdminUser, DbSession
from app.schemas.auth import AdminUserQuery, UserOut
from app.schemas.chat import ConversationOut, MessageOut
from app.schemas.common import Page, PageParams
from app.services import analytics_service, chat_service, user_service

router = APIRouter(prefix="/admin", tags=["admin"])


class UserActivationUpdate(BaseModel):
    is_active: bool


class NLPQueryRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=500)


class NLPQueryResponse(BaseModel):
    success: bool
    question: str
    sql: str
    answer: str = ""
    columns: list[str] | None = None
    result: list[dict] | None = None
    row_count: int | None = None
    error: str | None = None


class SpeechToTextResponse(BaseModel):
    text: str


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------


@router.get("/analytics/summary")
async def analytics_summary(db: DbSession, _admin: AdminUser) -> dict:
    return await analytics_service.summary(db)


# ---------------------------------------------------------------------------
# User management
# ---------------------------------------------------------------------------


@router.get("/users", response_model=Page[UserOut])
async def list_users(
    db: DbSession, _admin: AdminUser, query: Annotated[AdminUserQuery, Query()]
) -> Page[UserOut]:
    items, total = await user_service.admin_list_users(db, query)
    return Page.build([UserOut.model_validate(u) for u in items], total, query)


@router.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: UUID, db: DbSession, _admin: AdminUser) -> UserOut:
    user = await user_service.get_user(db, user_id)
    return UserOut.model_validate(user)


@router.patch("/users/{user_id}", response_model=UserOut)
async def set_user_activation(
    user_id: UUID, data: UserActivationUpdate, db: DbSession, _admin: AdminUser
) -> UserOut:
    user = await user_service.set_activation(db, user_id, data.is_active)
    return UserOut.model_validate(user)


# ---------------------------------------------------------------------------
# Conversations
# ---------------------------------------------------------------------------


@router.get("/conversations", response_model=Page[ConversationOut])
async def list_conversations(
    db: DbSession, _admin: AdminUser, params: Annotated[PageParams, Query()]
) -> Page[ConversationOut]:
    items, total = await chat_service.admin_list_conversations(db, params)
    return Page.build([ConversationOut.model_validate(c) for c in items], total, params)


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageOut])
async def conversation_messages(
    conversation_id: UUID, db: DbSession, admin: AdminUser
) -> list[MessageOut]:
    conversation = await chat_service.get_conversation_authorized(
        db, conversation_id, admin, None
    )
    messages = await chat_service.list_messages(db, conversation)
    return [MessageOut.model_validate(m) for m in messages]


# ---------------------------------------------------------------------------
# LLM helpers — OpenAI with Groq fallback
# ---------------------------------------------------------------------------


def _llm_call_with_fallback(question: str, system_prompt: str) -> str:
    """Try OpenAI GPT-4o-mini first; fall back to Groq Llama on failure."""
    import os
    from openai import OpenAI, OpenAIError, AuthenticationError, RateLimitError, APIConnectionError

    # --- Try OpenAI first ---
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        try:
            client = OpenAI(api_key=openai_key)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question},
                ],
                temperature=0.0,
                max_tokens=500,
            )
            return response.choices[0].message.content
        except (AuthenticationError, RateLimitError, APIConnectionError, OpenAIError) as exc:
            # Log and fall through to Groq
            import logging
            logging.warning("OpenAI unavailable (%s), falling back to Groq", exc)

    # --- Fallback: Groq ---
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise RuntimeError("Neither OPENAI_API_KEY nor GROQ_API_KEY is configured")

    client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=groq_key)
    model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
        temperature=0.0,
        max_tokens=500,
    )
    return response.choices[0].message.content


# ---------------------------------------------------------------------------
# NLP-to-SQL
# ---------------------------------------------------------------------------


@router.post("/nlp-query", response_model=NLPQueryResponse)
async def nlp_query(
    data: NLPQueryRequest, db: DbSession, admin: AdminUser
) -> NLPQueryResponse:
    """Natural-language to SQL with conversation memory."""
    user_id = str(admin.id)
    result = await analytics_service.execute_nlp_query(db, data.question, _llm_call_with_fallback, user_id=user_id)
    return NLPQueryResponse(**result)


@router.delete("/nlp-query/history")
async def clear_nlp_history(admin: AdminUser) -> dict:
    """Clear NLP-to-SQL conversation history for this admin."""
    analytics_service.clear_nlp_history(str(admin.id))
    return {"success": True, "message": "Conversation history cleared"}


@router.get("/nlp-query/history")
async def get_nlp_history(admin: AdminUser) -> dict:
    """Get NLP-to-SQL conversation history for this admin."""
    history = analytics_service.get_nlp_history(str(admin.id))
    return {"history": history, "count": len(history)}


# ---------------------------------------------------------------------------
# Speech-to-Text (Whisper)
# ---------------------------------------------------------------------------


@router.post("/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(
    file: UploadFile = File(...),
    _admin: AdminUser = None,
) -> SpeechToTextResponse:
    """Transcribe audio using OpenAI Whisper (no Groq fallback available)."""
    import os
    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required for voice input (no Groq fallback for Whisper)")

    client = OpenAI(api_key=api_key)

    # Read the uploaded audio into a bytes buffer
    audio_bytes = await file.read()

    # Whisper needs a file-like object with a name
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = file.filename or "audio.webm"

    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        language="en",
    )

    return SpeechToTextResponse(text=transcript.text)
