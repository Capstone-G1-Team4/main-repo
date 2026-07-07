"""SQLAlchemy models package: one module per domain. Import models here for Alembic discovery."""

from app.models.user import User, UserRole

__all__ = ["User", "UserRole"]
