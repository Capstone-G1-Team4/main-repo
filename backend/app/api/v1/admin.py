"""Admin router: analytics summary, user management, and conversation logs."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.core.deps import AdminUser, DbSession
from app.schemas.auth import AdminUserQuery, UserOut
from app.schemas.chat import ConversationOut, MessageOut
from app.schemas.common import Page, PageParams
from app.services import analytics_service, chat_service, user_service

router = APIRouter(prefix="/admin", tags=["admin"])


class UserActivationUpdate(BaseModel):
    is_active: bool


@router.get("/analytics/summary")
async def analytics_summary(db: DbSession, _admin: AdminUser) -> dict:
    return await analytics_service.summary(db)


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
