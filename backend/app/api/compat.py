"""Frontend-compatibility shim (TEMPORARY — remove once the frontend aligns).

The current frontend calls the API without the ``/api/v1`` prefix and names chat
resources ``sessions`` (with a different message shape) instead of the canonical
``conversations``. To unblock integration without changing the frontend, the app
also mounts every router at the root (see main.py) and adds the chat ``sessions``
aliases below, mapped onto the same chat service and reshaped to the field names
the frontend expects (``sender``/``timestamp``/``title``).

This does NOT change the canonical ``/api/v1`` API, which stays the source of
truth in docs/frontend-integration.md.
"""

from uuid import UUID

from fastapi import APIRouter
from sqlalchemy import select

from app.core.deps import CurrentUser, DbSession
from app.models.conversation import ChatMessage, Conversation, MessageRole
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["frontend-compat"])

_ROLE_TO_SENDER = {
    MessageRole.assistant: "ai",
    MessageRole.user: "user",
    MessageRole.system: "system",
    MessageRole.tool: "system",
}
_SENDER_TO_ROLE = {
    "ai": MessageRole.assistant,
    "assistant": MessageRole.assistant,
    "user": MessageRole.user,
    "system": MessageRole.system,
}


def _session_shape(conv: Conversation, title: str) -> dict:
    return {
        "id": str(conv.id),
        "title": title,
        "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
    }


def _message_shape(message: ChatMessage) -> dict:
    meta = message.message_metadata if isinstance(message.message_metadata, dict) else {}
    shaped = {
        "id": str(message.id),
        "sender": _ROLE_TO_SENDER.get(message.role, "system"),
        "type": meta.get("type", "text"),
        "content": message.content,
        "timestamp": message.created_at.isoformat() if message.created_at else None,
    }
    if "products" in meta:
        shaped["products"] = meta["products"]
    return shaped


async def _title_for(db: DbSession, conv: Conversation) -> str:
    messages = await chat_service.list_messages(db, conv)
    for message in messages:
        if message.role == MessageRole.user:
            return message.content[:60]
    return "New Conversation"


@router.get("/sessions")
async def list_sessions(db: DbSession, user: CurrentUser) -> list[dict]:
    stmt = (
        select(Conversation)
        .where(Conversation.user_id == user.id)
        .order_by(Conversation.updated_at.desc())
    )
    conversations = (await db.scalars(stmt)).all()
    return [_session_shape(c, await _title_for(db, c)) for c in conversations]


@router.post("/sessions")
async def create_session(db: DbSession, user: CurrentUser) -> dict:
    conversation = await chat_service.start_conversation(db, user)
    return _session_shape(conversation, "New Conversation")


@router.get("/sessions/{session_id}/messages")
async def get_session_messages(session_id: UUID, db: DbSession, user: CurrentUser) -> list[dict]:
    conversation = await chat_service.get_conversation_authorized(db, session_id, user, None)
    messages = await chat_service.list_messages(db, conversation)
    return [_message_shape(m) for m in messages]


@router.post("/sessions/{session_id}/messages")
async def add_session_message(
    session_id: UUID, body: dict, db: DbSession, user: CurrentUser
) -> dict:
    """Persist one message as sent by the frontend (fire-and-forget shape).

    The frontend generates its messages locally and posts each one to be stored;
    this endpoint just records it (it does not call the AI service — that's the
    canonical POST /api/v1/chat/conversations/{id}/messages).
    """
    conversation = await chat_service.get_conversation_authorized(db, session_id, user, None)
    role = _SENDER_TO_ROLE.get(str(body.get("sender", "user")), MessageRole.user)
    meta = {k: body[k] for k in ("type", "products") if k in body} or None
    message = ChatMessage(
        conversation_id=conversation.id,
        role=role,
        content=str(body.get("content", "")),
        message_metadata=meta,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return _message_shape(message)
