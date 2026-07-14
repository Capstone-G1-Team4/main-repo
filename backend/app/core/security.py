"""Password hashing and JWT access/refresh token helpers."""

from datetime import UTC, datetime, timedelta
from typing import Literal

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedError

TokenType = Literal["access", "refresh"]

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)


def create_token(subject: str, token_type: TokenType) -> str:
    settings = get_settings()
    if token_type == "access":
        expires = timedelta(minutes=settings.access_token_expire_minutes)
    else:
        expires = timedelta(days=settings.refresh_token_expire_days)
    payload = {
        "sub": subject,
        "type": token_type,
        "exp": datetime.now(UTC) + expires,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str, expected_type: TokenType) -> str:
    """Validate a JWT and return its subject (user id). Raises UnauthorizedError."""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise UnauthorizedError("Invalid or expired token", code="invalid_token") from exc
    if payload.get("type") != expected_type:
        raise UnauthorizedError("Invalid token type", code="invalid_token")
    subject = payload.get("sub")
    if not subject:
        raise UnauthorizedError("Invalid token payload", code="invalid_token")
    return subject
