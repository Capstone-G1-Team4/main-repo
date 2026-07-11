"""Seed script: creates a single admin user and nothing else (no business data).

Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... python scripts/seed.py
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select  # noqa: E402

from app.core.security import hash_password  # noqa: E402
from app.db.session import async_session_factory  # noqa: E402
from app.models.user import User, UserRole  # noqa: E402


async def main() -> None:
    email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    password = os.environ.get("ADMIN_PASSWORD", "admin12345")
    async with async_session_factory() as db:
        existing = await db.scalar(select(User).where(User.email == email))
        if existing is not None:
            print(f"Admin '{email}' already exists — nothing to do.")
            return
        db.add(
            User(
                email=email,
                hashed_password=hash_password(password),
                full_name="Store Admin",
                role=UserRole.admin,
            )
        )
        await db.commit()
        print(f"Created admin user '{email}'.")
        if "ADMIN_PASSWORD" not in os.environ:
            print("WARNING: default password used — set ADMIN_PASSWORD in production.")


if __name__ == "__main__":
    asyncio.run(main())
