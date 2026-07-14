"""Order tests: transactional creation, stock handling, lifecycle, and admin APIs."""

from decimal import Decimal

from httpx import AsyncClient

ORDERS = "/api/v1/orders"
ADMIN_ORDERS = "/api/v1/admin/orders"
PRODUCTS = "/api/v1/products"


async def _order_payload(product: dict, quantity: int = 2, **overrides) -> dict:
    payload = {"items": [{"product_id": product["id"], "quantity": quantity}]}
    payload.update(overrides)
    return payload


async def test_create_order_happy_path_decrements_stock(
    client: AsyncClient, customer: dict, product_factory
) -> None:
    product = await product_factory(price="10.00", stock_quantity=5)
    resp = await client.post(
        ORDERS, json=await _order_payload(product, 2), headers=customer["headers"]
    )
    assert resp.status_code == 201, resp.text
    order = resp.json()
    assert order["status"] == "pending"
    assert Decimal(order["subtotal"]) == Decimal("20")
    assert Decimal(order["total"]) == Decimal("20") + Decimal(order["delivery_fee"])
    assert order["customer_name"] == "Test Customer"  # snapshot from profile
    assert order["items"][0]["quantity"] == 2

    stock = (await client.get(f"{PRODUCTS}/{product['id']}")).json()["stock_quantity"]
    assert stock == 3


async def test_create_order_out_of_stock_conflict(
    client: AsyncClient, customer: dict, product_factory
) -> None:
    product = await product_factory(stock_quantity=1)
    resp = await client.post(
        ORDERS, json=await _order_payload(product, 3), headers=customer["headers"]
    )
    assert resp.status_code == 409
    assert resp.json()["code"] == "out_of_stock"

    stock = (await client.get(f"{PRODUCTS}/{product['id']}")).json()["stock_quantity"]
    assert stock == 1  # nothing was decremented


async def test_guest_order_requires_contact_info(client: AsyncClient, product_factory) -> None:
    product = await product_factory()
    resp = await client.post(ORDERS, json=await _order_payload(product))
    assert resp.status_code == 400
    assert resp.json()["code"] == "missing_customer_info"

    resp = await client.post(
        ORDERS,
        json=await _order_payload(
            product, customer_name="Guest", customer_phone="+962791111111"
        ),
    )
    assert resp.status_code == 201
    assert resp.json()["user_id"] is None


async def test_duplicate_items_are_merged(
    client: AsyncClient, customer: dict, product_factory
) -> None:
    product = await product_factory(stock_quantity=5)
    payload = {
        "items": [
            {"product_id": product["id"], "quantity": 1},
            {"product_id": product["id"], "quantity": 2},
        ]
    }
    resp = await client.post(ORDERS, json=payload, headers=customer["headers"])
    assert resp.status_code == 201
    assert resp.json()["items"][0]["quantity"] == 3


async def test_order_with_out_of_zone_location_conflicts(
    client: AsyncClient, customer: dict, product_factory, db
) -> None:
    from app.models.location import DeliveryLocation

    location = DeliveryLocation(raw_input="far away", is_within_delivery_area=False)
    db.add(location)
    await db.commit()

    product = await product_factory()
    resp = await client.post(
        ORDERS,
        json=await _order_payload(product, 1, delivery_location_id=str(location.id)),
        headers=customer["headers"],
    )
    assert resp.status_code == 409
    assert resp.json()["code"] == "outside_delivery_area"


async def test_list_and_get_own_orders_only(
    client: AsyncClient, customer: dict, product_factory
) -> None:
    product = await product_factory()
    created = (
        await client.post(
            ORDERS, json=await _order_payload(product, 1), headers=customer["headers"]
        )
    ).json()

    listing = (await client.get(ORDERS, headers=customer["headers"])).json()
    assert listing["total"] == 1
    assert listing["items"][0]["id"] == created["id"]

    other = await client.post(
        "/api/v1/auth/register",
        json={"email": "other@test.com", "password": "password123", "full_name": "Other"},
    )
    assert other.status_code == 201
    login = await client.post(
        "/api/v1/auth/login", json={"email": "other@test.com", "password": "password123"}
    )
    other_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    resp = await client.get(f"{ORDERS}/{created['id']}", headers=other_headers)
    assert resp.status_code == 404


async def test_cancel_order_restocks(
    client: AsyncClient, customer: dict, product_factory
) -> None:
    product = await product_factory(stock_quantity=5)
    order = (
        await client.post(
            ORDERS, json=await _order_payload(product, 4), headers=customer["headers"]
        )
    ).json()

    resp = await client.post(f"{ORDERS}/{order['id']}/cancel", headers=customer["headers"])
    assert resp.status_code == 200
    assert resp.json()["status"] == "cancelled"

    stock = (await client.get(f"{PRODUCTS}/{product['id']}")).json()["stock_quantity"]
    assert stock == 5

    resp = await client.post(f"{ORDERS}/{order['id']}/cancel", headers=customer["headers"])
    assert resp.status_code == 409  # already cancelled


async def test_admin_order_listing_and_status_flow(
    client: AsyncClient, customer: dict, admin: dict, product_factory
) -> None:
    product = await product_factory()
    order = (
        await client.post(
            ORDERS, json=await _order_payload(product, 1), headers=customer["headers"]
        )
    ).json()

    assert (await client.get(ADMIN_ORDERS, headers=customer["headers"])).status_code == 403

    listing = (
        await client.get(ADMIN_ORDERS, params={"status": "pending"}, headers=admin["headers"])
    ).json()
    assert listing["total"] == 1

    for step in ("confirmed", "preparing", "out_for_delivery", "delivered"):
        resp = await client.patch(
            f"{ADMIN_ORDERS}/{order['id']}/status",
            json={"status": step},
            headers=admin["headers"],
        )
        assert resp.status_code == 200, resp.text
        assert resp.json()["status"] == step

    resp = await client.patch(
        f"{ADMIN_ORDERS}/{order['id']}/status",
        json={"status": "pending"},
        headers=admin["headers"],
    )
    assert resp.status_code == 409  # delivered is final
