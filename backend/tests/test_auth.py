"""Auth flow tests: register, login, refresh, profile, and guards."""

from httpx import AsyncClient

REGISTER = "/api/v1/auth/register"
LOGIN = "/api/v1/auth/login"
REFRESH = "/api/v1/auth/refresh"
ME = "/api/v1/auth/me"


async def test_register_creates_customer(client: AsyncClient) -> None:
    resp = await client.post(
        REGISTER,
        json={"email": "new@test.com", "password": "password123", "full_name": "New User"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "new@test.com"
    assert body["role"] == "customer"
    assert "hashed_password" not in body


async def test_register_duplicate_email_conflicts(client: AsyncClient, customer: dict) -> None:
    resp = await client.post(
        REGISTER,
        json={"email": "customer@test.com", "password": "password123", "full_name": "Dup"},
    )
    assert resp.status_code == 409
    assert resp.json()["code"] == "email_taken"


async def test_register_rejects_short_password(client: AsyncClient) -> None:
    resp = await client.post(
        REGISTER, json={"email": "x@test.com", "password": "short", "full_name": "X"}
    )
    assert resp.status_code == 422


async def test_login_wrong_password(client: AsyncClient, customer: dict) -> None:
    resp = await client.post(LOGIN, json={"email": "customer@test.com", "password": "wrongpass1"})
    assert resp.status_code == 401
    assert resp.json()["code"] == "invalid_credentials"


async def test_me_requires_token(client: AsyncClient) -> None:
    resp = await client.get(ME)
    assert resp.status_code == 401


async def test_me_returns_profile(client: AsyncClient, customer: dict) -> None:
    resp = await client.get(ME, headers=customer["headers"])
    assert resp.status_code == 200
    assert resp.json()["email"] == "customer@test.com"


async def test_patch_me_updates_profile(client: AsyncClient, customer: dict) -> None:
    resp = await client.patch(
        ME, headers=customer["headers"], json={"full_name": "Renamed", "phone": "+962790000009"}
    )
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "Renamed"
    assert resp.json()["phone"] == "+962790000009"


async def test_refresh_returns_new_pair(client: AsyncClient, customer: dict) -> None:
    resp = await client.post(REFRESH, json={"refresh_token": customer["tokens"]["refresh_token"]})
    assert resp.status_code == 200
    body = resp.json()
    assert body["access_token"] and body["refresh_token"]
    check = await client.get(ME, headers={"Authorization": f"Bearer {body['access_token']}"})
    assert check.status_code == 200


async def test_refresh_rejects_access_token(client: AsyncClient, customer: dict) -> None:
    resp = await client.post(REFRESH, json={"refresh_token": customer["tokens"]["access_token"]})
    assert resp.status_code == 401


async def test_access_token_rejected_as_garbage(client: AsyncClient) -> None:
    resp = await client.get(ME, headers={"Authorization": "Bearer not-a-jwt"})
    assert resp.status_code == 401
    assert resp.json()["code"] == "invalid_token"
