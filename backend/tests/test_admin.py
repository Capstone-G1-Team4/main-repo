"""Admin tests: analytics summary, user management, and conversation logs."""

from decimal import Decimal

from httpx import AsyncClient

SUMMARY = "/api/v1/admin/analytics/summary"
USERS = "/api/v1/admin/users"
CONVERSATIONS = "/api/v1/admin/conversations"


async def test_admin_endpoints_require_admin(client: AsyncClient, customer: dict) -> None:
    for url in (SUMMARY, USERS, CONVERSATIONS):
        assert (await client.get(url, headers=customer["headers"])).status_code == 403
        assert (await client.get(url)).status_code == 401


async def test_analytics_summary_counts(
    client: AsyncClient, customer: dict, admin: dict, product_factory
) -> None:
    product = await product_factory(price="10.00", stock_quantity=10)
    order_payload = {"items": [{"product_id": product["id"], "quantity": 2}]}
    created = await client.post("/api/v1/orders", json=order_payload, headers=customer["headers"])
    assert created.status_code == 201
    order = created.json()

    cancelled = await client.post(
        "/api/v1/orders", json=order_payload, headers=customer["headers"]
    )
    await client.post(
        f"/api/v1/orders/{cancelled.json()['id']}/cancel", headers=customer["headers"]
    )

    body = (await client.get(SUMMARY, headers=admin["headers"])).json()
    assert body["orders_total"] == 2
    assert body["users_total"] == 2  # customer + admin
    assert Decimal(body["revenue"]) == Decimal(order["total"])  # cancelled order excluded
    assert body["orders_by_status"]["pending"] == 1
    assert body["orders_by_status"]["cancelled"] == 1
    assert body["top_products"][0]["product_id"] == product["id"]
    assert body["top_products"][0]["quantity_sold"] == 2


async def test_admin_user_listing_and_deactivation(
    client: AsyncClient, customer: dict, admin: dict
) -> None:
    listing = (await client.get(USERS, headers=admin["headers"])).json()
    assert listing["total"] == 2

    customer_id = customer["user"]["id"]
    resp = await client.patch(
        f"{USERS}/{customer_id}", json={"is_active": False}, headers=admin["headers"]
    )
    assert resp.status_code == 200 and resp.json()["is_active"] is False

    # deactivated user's token no longer works
    resp = await client.get("/api/v1/auth/me", headers=customer["headers"])
    assert resp.status_code == 401

    resp = await client.patch(
        f"{USERS}/{customer_id}", json={"is_active": True}, headers=admin["headers"]
    )
    assert resp.json()["is_active"] is True


async def test_admin_conversation_logs(
    client: AsyncClient, admin: dict, stub_ai_reply
) -> None:
    conv = (await client.post("/api/v1/chat/conversations")).json()
    await client.post(
        f"/api/v1/chat/conversations/{conv['id']}/messages",
        json={"content": "hello"},
        headers={"X-Session-Token": conv["session_token"]},
    )

    listing = (await client.get(CONVERSATIONS, headers=admin["headers"])).json()
    assert listing["total"] == 1

    messages = (
        await client.get(f"{CONVERSATIONS}/{conv['id']}/messages", headers=admin["headers"])
    ).json()
    assert [m["role"] for m in messages] == ["user", "assistant"]
