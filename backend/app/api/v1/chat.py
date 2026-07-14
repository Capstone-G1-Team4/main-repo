"""Chat router: conversation lifecycle and the message proxy to the AI service."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Header, status

from app.core.deps import DbSession, OptionalUser
from app.schemas.chat import ChatTurnOut, ConversationOut, MessageIn, MessageOut
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])

SessionToken = Annotated[
    str | None,
    Header(alias="X-Session-Token", description="Guest access token for the conversation"),
]


@router.get("/conversations", response_model=list[ConversationOut])
async def list_conversations(db: DbSession, user: OptionalUser) -> list[ConversationOut]:
    if user is None:
        return []
    conversations = await chat_service.list_user_conversations(db, user)
    return [ConversationOut.model_validate(c) for c in conversations]


@router.post("/conversations", response_model=ConversationOut, status_code=status.HTTP_201_CREATED)
async def start_conversation(db: DbSession, user: OptionalUser) -> ConversationOut:
    conversation = await chat_service.start_conversation(db, user)
    return ConversationOut.model_validate(conversation)


@router.post("/conversations/{conversation_id}/messages", response_model=ChatTurnOut)
async def send_message(
    conversation_id: UUID,
    data: MessageIn,
    db: DbSession,
    user: OptionalUser,
    session_token: SessionToken = None,
) -> ChatTurnOut:
    conversation = await chat_service.get_conversation_authorized(
        db, conversation_id, user, session_token
    )
    messages = await chat_service.send_message(db, conversation, data.content, user)
    return ChatTurnOut(
        conversation_id=conversation_id,
        messages=[MessageOut.model_validate(m) for m in messages],
    )


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageOut])
async def get_messages(
    conversation_id: UUID,
    db: DbSession,
    user: OptionalUser,
    session_token: SessionToken = None,
) -> list[MessageOut]:
    conversation = await chat_service.get_conversation_authorized(
        db, conversation_id, user, session_token
    )
    messages = await chat_service.list_messages(db, conversation)
    return [MessageOut.model_validate(m) for m in messages]


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: UUID,
    db: DbSession,
    user: OptionalUser,
    session_token: SessionToken = None,
) -> None:
    conversation = await chat_service.get_conversation_authorized(
        db, conversation_id, user, session_token
    )
    await chat_service.delete_conversation(db, conversation)
