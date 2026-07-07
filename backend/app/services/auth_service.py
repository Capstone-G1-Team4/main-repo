"""Auth business logic: registration, login, token refresh, and profile updates."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import create_token, decode_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import RegisterRequest, TokenPair, UserUpdate


async def register(db: AsyncSession, data: RegisterRequest) -> User:
    existing = await db.scalar(select(User).where(User.email == data.email))
    if existing is not None:
        raise ConflictError("Email already registered", code="email_taken")
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate(db: AsyncSession, email: str, password: str) -> User:
    user = await db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(password, user.hashed_password):
        raise UnauthorizedError("Invalid email or password", code="invalid_credentials")
    if not user.is_active:
        raise UnauthorizedError("Account is deactivated", code="inactive_user")
    return user


def issue_tokens(user: User) -> TokenPair:
    subject = str(user.id)
    return TokenPair(
        access_token=create_token(subject, "access"),
        refresh_token=create_token(subject, "refresh"),
    )


async def refresh_tokens(db: AsyncSession, refresh_token: str) -> TokenPair:
    subject = decode_token(refresh_token, "refresh")
    user = await db.get(User, UUID(subject))
    if user is None or not user.is_active:
        raise UnauthorizedError("User not found or inactive", code="inactive_user")
    return issue_tokens(user)


async def update_profile(db: AsyncSession, user: User, data: UserUpdate) -> User:
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.phone is not None:
        user.phone = data.phone
    if data.password is not None:
        user.hashed_password = hash_password(data.password)
    await db.commit()
    await db.refresh(user)
    return user
