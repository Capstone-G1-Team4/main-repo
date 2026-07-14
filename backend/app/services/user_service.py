"""Admin-facing user management: listing, search, single-user lookup, activation toggling."""

import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.user import User
from app.schemas.auth import AdminUserQuery


async def admin_list_users(db: AsyncSession, query: AdminUserQuery) -> tuple[list[User], int]:
    base = select(User)
    if query.q:
        pattern = f"%{query.q}%"
        base = base.where(or_(User.email.ilike(pattern), User.full_name.ilike(pattern)))
    if query.role is not None:
        base = base.where(User.role == query.role)
    if query.is_active is not None:
        base = base.where(User.is_active == query.is_active)
    total = await db.scalar(select(func.count()).select_from(base.subquery())) or 0
    stmt = base.order_by(User.created_at.desc()).offset(query.offset).limit(query.size)
    return list((await db.scalars(stmt)).all()), total


async def get_user(db: AsyncSession, user_id: uuid.UUID) -> User:
    user = await db.get(User, user_id)
    if user is None:
        raise NotFoundError("User not found")
    return user


async def set_activation(db: AsyncSession, user_id: uuid.UUID, is_active: bool) -> User:
    user = await get_user(db, user_id)
    user.is_active = is_active
    await db.commit()
    await db.refresh(user)
    return user
