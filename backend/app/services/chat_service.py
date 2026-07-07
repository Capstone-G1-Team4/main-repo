"""Chat orchestration: persist messages, call the AI service, execute tool actions."""

import uuid

from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError, ForbiddenError, NotFoundError
from app.models.conversation import ChatMessage, Conversation, MessageRole
from app.models.user import User, UserRole
from app.schemas.chat import AIChatMessage, AIChatRequest, AIToolAction, AIUserContext
from app.schemas.common import PageParams
from app.schemas.location import LocationOut
from app.schemas.order import OrderCreate
from app.services import maps_service, order_service
from app.services.ai_client import get_ai_client

_HISTORY_LIMIT = 20


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


async def list_messages(db: AsyncSession, conversation: Conversation) -> list[ChatMessage]:
    stmt = (
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation.id)
        .order_by(ChatMessage.id)
    )
    return list((await db.scalars(stmt)).all())


def _user_context(user: User | None) -> AIUserContext:
    if user is None:
        return AIUserContext()
    return AIUserContext(
        user_id=str(user.id), full_name=user.full_name, phone=user.phone, authenticated=True
    )


async def _execute_action(
    db: AsyncSession, conversation_id: uuid.UUID, action: AIToolAction, user: User | None
) -> dict:
    """Run one tool action; failures become structured results, not request failures."""
    try:
        if action.action == "create_order":
            data = OrderCreate.model_validate(action.payload)
            order = await order_service.create_order(
                db, data, user, conversation_id=conversation_id
            )
            return {
                "action": "create_order",
                "ok": True,
                "order_id": str(order.id),
                "status": order.status,
                "subtotal": str(order.subtotal),
                "delivery_fee": str(order.delivery_fee),
                "total": str(order.total),
            }
        # resolve_location
        raw_input = action.payload.get("maps_url") or action.payload.get("input")
        if not raw_input:
            raise AppError("resolve_location requires 'maps_url' or 'input'")
        location, fee = await maps_service.resolve_location(
            db, str(raw_input), user.id if user else None
        )
        return {
            "action": "resolve_location",
            "ok": True,
            "location": LocationOut.model_validate(location).model_dump(mode="json"),
            "delivery_fee": str(fee) if fee is not None else None,
        }
    except ValidationError as exc:
        await _recover_session(db, user)
        return {"action": action.action, "ok": False, "error": str(exc), "code": "invalid_payload"}
    except AppError as exc:
        await _recover_session(db, user)
        return {"action": action.action, "ok": False, "error": exc.detail, "code": exc.code}


async def _recover_session(db: AsyncSession, user: User | None) -> None:
    """Roll back a failed action and un-expire the user for any follow-up actions."""
    await db.rollback()
    if user is not None:
        await db.refresh(user)


async def send_message(
    db: AsyncSession, conversation: Conversation, content: str, user: User | None
) -> list[ChatMessage]:
    """Persist the user message, call the AI, execute tool actions, persist the results."""
    # snapshot ids: a rollback inside a failed tool action expires ORM objects,
    # and touching their attributes afterwards would trigger sync IO in async code
    conversation_id = conversation.id
    user_context = _user_context(user)

    user_message = ChatMessage(
        conversation_id=conversation_id, role=MessageRole.user, content=content
    )
    db.add(user_message)
    await db.commit()  # user message survives even if the AI call fails

    history = await list_messages(db, conversation)
    request = AIChatRequest(
        conversation_id=conversation_id,
        messages=[
            AIChatMessage(role=m.role, content=m.content, metadata=m.message_metadata)
            for m in history[-_HISTORY_LIMIT:]
        ],
        user_context=user_context,
    )
    response = await get_ai_client().chat(request)

    turn_messages = [user_message]
    for action in response.actions:
        result = await _execute_action(db, conversation_id, action, user)
        tool_message = ChatMessage(
            conversation_id=conversation_id,
            role=MessageRole.tool,
            content=f"{action.action}: {'ok' if result.get('ok') else 'failed'}",
            message_metadata=result,
        )
        db.add(tool_message)
        turn_messages.append(tool_message)

    if response.reply:
        assistant_message = ChatMessage(
            conversation_id=conversation_id,
            role=MessageRole.assistant,
            content=response.reply,
            message_metadata=response.metadata or None,
        )
        db.add(assistant_message)
        turn_messages.append(assistant_message)

    await db.commit()
    for message in turn_messages:
        await db.refresh(message)
    return turn_messages
