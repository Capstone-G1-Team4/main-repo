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


async def test_admin_get_single_user(client: AsyncClient, customer: dict, admin: dict) -> None:
    customer_id = customer["user"]["id"]
    resp = await client.get(f"{USERS}/{customer_id}", headers=admin["headers"])
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == "customer@test.com"
    assert body["role"] == "customer"
    assert "hashed_password" not in body  # password never exposed

    missing = "00000000-0000-0000-0000-000000000000"
    resp = await client.get(f"{USERS}/{missing}", headers=admin["headers"])
    assert resp.status_code == 404


async def test_admin_user_search_and_role_filter(
    client: AsyncClient, customer: dict, admin: dict
) -> None:
    # search by email fragment
    resp = await client.get(USERS, params={"q": "customer@"}, headers=admin["headers"])
    body = resp.json()
    assert body["total"] == 1 and body["items"][0]["email"] == "customer@test.com"

    # search by name fragment
    resp = await client.get(USERS, params={"q": "Admin"}, headers=admin["headers"])
    assert resp.json()["total"] == 1

    # filter by role
    resp = await client.get(USERS, params={"role": "admin"}, headers=admin["headers"])
    body = resp.json()
    assert body["total"] == 1 and body["items"][0]["role"] == "admin"

    resp = await client.get(USERS, params={"role": "customer"}, headers=admin["headers"])
    assert resp.json()["total"] == 1


async def test_admin_orders_filtered_by_user(
    client: AsyncClient, customer: dict, admin: dict, product_factory
) -> None:
    product = await product_factory(stock_quantity=5)
    await client.post(
        "/api/v1/orders",
        json={"items": [{"product_id": product["id"], "quantity": 1}]},
        headers=customer["headers"],
    )
    customer_id = customer["user"]["id"]

    resp = await client.get(
        "/api/v1/admin/orders", params={"user_id": customer_id}, headers=admin["headers"]
    )
    body = resp.json()
    assert body["total"] == 1
    assert body["items"][0]["user_id"] == customer_id

    # a different (random) user id yields nothing
    other = "00000000-0000-0000-0000-000000000000"
    resp = await client.get(
        "/api/v1/admin/orders", params={"user_id": other}, headers=admin["headers"]
    )
    assert resp.json()["total"] == 0
