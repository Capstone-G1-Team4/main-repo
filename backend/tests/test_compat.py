"""Frontend-compatibility shim tests: root-mounted paths and chat 'sessions' aliases."""

from httpx import AsyncClient


async def test_api_available_without_v1_prefix(client: AsyncClient, customer: dict) -> None:
    # same endpoint, canonical and root-mounted, both work
    canonical = await client.get("/api/v1/auth/me", headers=customer["headers"])
    rooted = await client.get("/auth/me", headers=customer["headers"])
    assert canonical.status_code == 200
    assert rooted.status_code == 200
    assert rooted.json()["email"] == canonical.json()["email"]


async def test_products_available_at_root(client: AsyncClient, product_factory) -> None:
    await product_factory(name="Rooted Product")
    resp = await client.get("/products")
    assert resp.status_code == 200
    assert resp.json()["total"] == 1


async def test_chat_sessions_alias_full_flow(client: AsyncClient, customer: dict) -> None:
    # create a session (frontend shape: {id, title, updated_at})
    created = await client.post("/chat/sessions", headers=customer["headers"])
    assert created.status_code == 200
    session = created.json()
    assert set(session) == {"id", "title", "updated_at"}

    # persist a couple of messages the way the frontend posts them
    for msg in [
        {"sender": "user", "type": "text", "content": "show me laptops"},
        {"sender": "ai", "type": "text", "content": "Here are some laptops"},
    ]:
        resp = await client.post(
            f"/chat/sessions/{session['id']}/messages", json=msg, headers=customer["headers"]
        )
        assert resp.status_code == 200

    # list sessions -> title derived from first user message
    listing = await client.get("/chat/sessions", headers=customer["headers"])
    assert listing.status_code == 200
    assert listing.json()[0]["title"] == "show me laptops"

    # read messages back in frontend shape (sender/type/content/timestamp)
    messages = await client.get(
        f"/chat/sessions/{session['id']}/messages", headers=customer["headers"]
    )
    body = messages.json()
    assert [m["sender"] for m in body] == ["user", "ai"]
    assert body[0]["type"] == "text" and body[0]["content"] == "show me laptops"
    assert "timestamp" in body[0]


async def test_chat_sessions_requires_auth(client: AsyncClient) -> None:
    assert (await client.get("/chat/sessions")).status_code == 401
