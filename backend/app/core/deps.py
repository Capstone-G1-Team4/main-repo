"""Shared FastAPI dependencies: DB session, current-user resolution, admin/internal guards."""

from typing import Annotated
from uuid import UUID

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User, UserRole

_bearer = HTTPBearer(auto_error=False)

DbSession = Annotated[AsyncSession, Depends(get_db)]
_Credentials = Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)]


async def _resolve_user(
    db: AsyncSession, creds: HTTPAuthorizationCredentials | None
) -> User | None:
    if creds is None:
        return None
    subject = decode_token(creds.credentials, "access")
    try:
        user_id = UUID(subject)
    except ValueError as exc:
        raise UnauthorizedError("Invalid token subject", code="invalid_token") from exc
    user = await db.get(User, user_id)
    if user is None or not user.is_active:
        raise UnauthorizedError("User not found or inactive", code="inactive_user")
    return user


async def get_current_user(db: DbSession, creds: _Credentials) -> User:
    user = await _resolve_user(db, creds)
    if user is None:
        raise UnauthorizedError("Not authenticated", code="not_authenticated")
    return user


async def get_current_user_optional(db: DbSession, creds: _Credentials) -> User | None:
    return await _resolve_user(db, creds)


async def require_admin(user: Annotated[User, Depends(get_current_user)]) -> User:
    if user.role != UserRole.admin:
        raise ForbiddenError("Admin privileges required", code="admin_required")
    return user


async def require_internal_key(
    x_internal_api_key: Annotated[str | None, Header()] = None,
) -> None:
    if x_internal_api_key != get_settings().internal_api_key:
        raise UnauthorizedError("Invalid internal API key", code="invalid_internal_key")


CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalUser = Annotated[User | None, Depends(get_current_user_optional)]
AdminUser = Annotated[User, Depends(require_admin)]
