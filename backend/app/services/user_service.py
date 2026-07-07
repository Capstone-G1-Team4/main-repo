"""Admin-facing user management: listing and activation toggling."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.user import User
from app.schemas.common import PageParams


async def admin_list_users(db: AsyncSession, params: PageParams) -> tuple[list[User], int]:
    total = await db.scalar(select(func.count()).select_from(User)) or 0
    stmt = select(User).order_by(User.created_at.desc()).offset(params.offset).limit(params.size)
    return list((await db.scalars(stmt)).all()), total


async def set_activation(db: AsyncSession, user_id: uuid.UUID, is_active: bool) -> User:
    user = await db.get(User, user_id)
    if user is None:
        raise NotFoundError("User not found")
    user.is_active = is_active
    await db.commit()
    await db.refresh(user)
    return user
