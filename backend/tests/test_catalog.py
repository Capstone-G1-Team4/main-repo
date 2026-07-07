"""Catalog tests: product browsing/filtering, admin CRUD, categories, internal export."""

from decimal import Decimal

from httpx import AsyncClient

PRODUCTS = "/api/v1/products"
CATEGORIES = "/api/v1/categories"
EXPORT = "/api/v1/internal/products/export"


async def test_create_product_requires_admin(client: AsyncClient, customer: dict) -> None:
    resp = await client.post(
        PRODUCTS, json={"name": "X", "price": "1.00"}, headers=customer["headers"]
    )
    assert resp.status_code == 403


async def test_create_and_fetch_product_by_slug_and_id(
    client: AsyncClient, product_factory
) -> None:
    product = await product_factory(name="Gaming Laptop Pro", price="999.99", brand="Asus")
    assert product["slug"] == "gaming-laptop-pro"

    by_slug = await client.get(f"{PRODUCTS}/gaming-laptop-pro")
    by_id = await client.get(f"{PRODUCTS}/{product['id']}")
    assert by_slug.status_code == by_id.status_code == 200
    assert by_slug.json()["id"] == by_id.json()["id"]


async def test_product_filters_and_pagination(client: AsyncClient, product_factory) -> None:
    await product_factory(name="Cheap Mouse", price="5.00", brand="Logitech")
    await product_factory(name="Pricey Keyboard", price="80.00", brand="Logitech")
    await product_factory(name="Out of stock cam", price="50.00", stock_quantity=0)

    resp = await client.get(PRODUCTS, params={"min_price": 10, "max_price": 100})
    names = [p["name"] for p in resp.json()["items"]]
    assert names == ["Pricey Keyboard"] or "Pricey Keyboard" in names and "Cheap Mouse" not in names

    resp = await client.get(PRODUCTS, params={"in_stock": True})
    assert all(p["stock_quantity"] > 0 for p in resp.json()["items"])

    resp = await client.get(PRODUCTS, params={"q": "keyboard"})
    assert resp.json()["total"] == 1

    resp = await client.get(PRODUCTS, params={"brand": "logitech"})
    assert resp.json()["total"] == 2

    resp = await client.get(PRODUCTS, params={"sort": "price_asc", "size": 2, "page": 1})
    body = resp.json()
    assert body["pages"] == 2 and len(body["items"]) == 2
    prices = [Decimal(p["price"]) for p in body["items"]]
    assert prices == sorted(prices)


async def test_update_and_delete_product(client: AsyncClient, admin: dict, product_factory) -> None:
    product = await product_factory()
    resp = await client.patch(
        f"{PRODUCTS}/{product['id']}", json={"price": "12.50"}, headers=admin["headers"]
    )
    assert resp.status_code == 200
    assert Decimal(resp.json()["price"]) == Decimal("12.50")

    resp = await client.delete(f"{PRODUCTS}/{product['id']}", headers=admin["headers"])
    assert resp.status_code == 204
    assert (await client.get(f"{PRODUCTS}/{product['id']}")).status_code == 404


async def test_stock_adjustment_and_conflict(
    client: AsyncClient, admin: dict, product_factory
) -> None:
    product = await product_factory(stock_quantity=3)
    resp = await client.patch(
        f"{PRODUCTS}/{product['id']}/stock", json={"adjustment": 2}, headers=admin["headers"]
    )
    assert resp.json()["stock_quantity"] == 5

    resp = await client.patch(
        f"{PRODUCTS}/{product['id']}/stock", json={"adjustment": -10}, headers=admin["headers"]
    )
    assert resp.status_code == 409
    assert resp.json()["code"] == "stock_conflict"


async def test_category_tree_and_products(
    client: AsyncClient, admin: dict, product_factory
) -> None:
    parent = await client.post(
        CATEGORIES, json={"name": "Electronics"}, headers=admin["headers"]
    )
    assert parent.status_code == 201
    child = await client.post(
        CATEGORIES,
        json={"name": "Laptops", "parent_id": parent.json()["id"]},
        headers=admin["headers"],
    )
    assert child.status_code == 201

    await product_factory(name="Ultrabook", category_id=child.json()["id"])

    tree = (await client.get(CATEGORIES)).json()
    electronics = next(c for c in tree if c["slug"] == "electronics")
    assert electronics["children"][0]["slug"] == "laptops"

    resp = await client.get(f"{CATEGORIES}/laptops/products")
    assert resp.json()["total"] == 1

    resp = await client.get(f"{CATEGORIES}/missing/products")
    assert resp.status_code == 404


async def test_category_delete_conflict_when_in_use(
    client: AsyncClient, admin: dict, product_factory
) -> None:
    cat = (
        await client.post(CATEGORIES, json={"name": "Phones"}, headers=admin["headers"])
    ).json()
    await product_factory(category_id=cat["id"])
    resp = await client.delete(f"{CATEGORIES}/{cat['id']}", headers=admin["headers"])
    assert resp.status_code == 409


async def test_internal_export_requires_key(client: AsyncClient, product_factory) -> None:
    product = await product_factory(name="Exported Item")

    resp = await client.get(EXPORT)
    assert resp.status_code == 401

    resp = await client.get(EXPORT, headers={"X-Internal-API-Key": "test-internal-key"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["count"] == 1
    assert body["products"][0]["id"] == product["id"]
