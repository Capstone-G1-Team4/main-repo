"""Chat orchestration: persist messages, call the AI service, execute tool actions."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.conversation import ChatMessage, Conversation, MessageRole
from app.models.user import User, UserRole
from app.schemas.common import PageParams
from app.services.ai_client import get_ai_client


async def start_conversation(db: AsyncSession, user: User | None) -> Conversation:
    conversation = Conversation(user_id=user.id if user else None)
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation


async def get_conversation_authorized(
    db: AsyncSession, conversation_id: uuid.UUID, user: User | None, session_token: str | None
) -> Conversation:
    conversation = await db.get(Conversation, conversation_id)
    if conversation is None:
        raise NotFoundError("Conversation not found")
    if user is not None and user.role == UserRole.admin:
        return conversation
    if conversation.user_id is not None:
        if user is None or user.id != conversation.user_id:
            raise ForbiddenError("Not your conversation", code="conversation_forbidden")
    elif session_token != conversation.session_token:
        raise ForbiddenError("Invalid session token", code="conversation_forbidden")
    return conversation


async def admin_list_conversations(
    db: AsyncSession, params: PageParams
) -> tuple[list[Conversation], int]:
    total = await db.scalar(select(func.count()).select_from(Conversation)) or 0
    stmt = (
        select(Conversation)
        .order_by(Conversation.created_at.desc())
        .offset(params.offset)
        .limit(params.size)
    )
    return list((await db.scalars(stmt)).all()), total


async def list_user_conversations(
    db: AsyncSession, user: User
) -> list[Conversation]:
    stmt = (
        select(Conversation)
        .where(Conversation.user_id == user.id)
        .order_by(Conversation.updated_at.desc())
    )
    return list((await db.scalars(stmt)).all())


async def delete_conversation(
    db: AsyncSession, conversation: Conversation
) -> None:
    stmt = select(ChatMessage).where(ChatMessage.conversation_id == conversation.id)
    messages = (await db.scalars(stmt)).all()
    for msg in messages:
        await db.delete(msg)
    await db.delete(conversation)
    await db.commit()


async def list_messages(db: AsyncSession, conversation: Conversation) -> list[ChatMessage]:
    stmt = (
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation.id)
        .order_by(ChatMessage.id)
    )
    return list((await db.scalars(stmt)).all())


async def send_message(
    db: AsyncSession, conversation: Conversation, content: str, user: User | None
) -> list[ChatMessage]:
    """Persist the user message, call the AI service, persist the assistant reply."""
    conversation_id = conversation.id

    user_message = ChatMessage(
        conversation_id=conversation_id, role=MessageRole.user, content=content
    )
    db.add(user_message)
    await db.commit()

    ai_response = await get_ai_client().chat(
        session_id=str(conversation_id),
        message=content,
    )

    turn_messages = [user_message]

    if ai_response.order:
        order_msg = ChatMessage(
            conversation_id=conversation_id,
            role=MessageRole.tool,
            content=f"order_created: {ai_response.order}",
            message_metadata=ai_response.order,
        )
        db.add(order_msg)
        turn_messages.append(order_msg)

    if ai_response.response:
        assistant_message = ChatMessage(
            conversation_id=conversation_id,
            role=MessageRole.assistant,
            content=ai_response.response,
            message_metadata={"intent": ai_response.intent} if ai_response.intent else None,
        )
        db.add(assistant_message)
        turn_messages.append(assistant_message)

    await db.commit()
    for message in turn_messages:
        await db.refresh(message)
    return turn_messages
