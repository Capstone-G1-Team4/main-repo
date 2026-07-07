"""Shared test fixtures: in-memory SQLite database, async test client, and auth helpers."""

import os

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite://")
os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("DEBUG", "false")
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("INTERNAL_API_KEY", "test-internal-key")
os.environ.setdefault("GOOGLE_MAPS_API_KEY", "")
os.environ.setdefault("DELIVERY_ZONE_CITIES", "Amman")

from collections.abc import AsyncGenerator  # noqa: E402

import pytest  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy.ext.asyncio import AsyncSession  # noqa: E402

from app.db import session as db_session  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
async def db() -> AsyncGenerator[AsyncSession, None]:
    async with db_session.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with db_session.async_session_factory() as session:
        yield session
    async with db_session.engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def customer(client: AsyncClient) -> dict:
    """A registered, logged-in customer: {user, headers, password}."""
    payload = {
        "email": "customer@test.com",
        "password": "password123",
        "full_name": "Test Customer",
        "phone": "+962790000001",
    }
    resp = await client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 201, resp.text
    user = resp.json()
    resp = await client.post(
        "/api/v1/auth/login", json={"email": payload["email"], "password": payload["password"]}
    )
    assert resp.status_code == 200, resp.text
    tokens = resp.json()
    return {
        "user": user,
        "tokens": tokens,
        "headers": {"Authorization": f"Bearer {tokens['access_token']}"},
        "password": payload["password"],
    }


@pytest.fixture
async def admin(db: AsyncSession, client: AsyncClient) -> dict:
    """An admin user created directly in the DB, logged in via the API."""
    from app.core.security import hash_password
    from app.models.user import User, UserRole

    user = User(
        email="admin@test.com",
        hashed_password=hash_password("adminpass123"),
        full_name="Test Admin",
        role=UserRole.admin,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    resp = await client.post(
        "/api/v1/auth/login", json={"email": "admin@test.com", "password": "adminpass123"}
    )
    assert resp.status_code == 200, resp.text
    tokens = resp.json()
    return {
        "user_id": str(user.id),
        "tokens": tokens,
        "headers": {"Authorization": f"Bearer {tokens['access_token']}"},
    }


@pytest.fixture
def stub_ai_reply(monkeypatch: pytest.MonkeyPatch) -> None:
    """Replace the AI client with a stub that always replies with fixed text."""
    from app.schemas.chat import AIChatRequest, AIChatResponse
    from app.services import chat_service

    class _Stub:
        async def chat(self, request: AIChatRequest) -> AIChatResponse:
            return AIChatResponse(reply="stub reply")

    monkeypatch.setattr(chat_service, "get_ai_client", lambda: _Stub())


@pytest.fixture
def product_factory(client: AsyncClient, admin: dict):
    """Async factory that creates products through the admin API."""
    import uuid as _uuid

    async def _make(**overrides) -> dict:
        payload = {
            "name": f"Product {_uuid.uuid4().hex[:8]}",
            "price": "10.00",
            "stock_quantity": 5,
        }
        payload.update(overrides)
        resp = await client.post("/api/v1/products", json=payload, headers=admin["headers"])
        assert resp.status_code == 201, resp.text
        return resp.json()

    return _make
