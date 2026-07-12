# Frontend Integration Guide

Audience: **Member 1** (React/Next.js). Everything the UI needs to talk to the backend.

- Base URL (local): `http://localhost:8000`
- All business endpoints are under `/api/v1`
- Interactive playground: `http://localhost:8000/docs`
- CORS: `http://localhost:3000` is allowed by default (`CORS_ORIGINS` env var)

## Conventions

- **Errors** always look like `{"detail": "...", "code": "..."}`. Match on `code`:
  `invalid_credentials`, `email_taken`, `out_of_stock`, `outside_delivery_area`,
  `ai_service_unavailable`, `not_cancellable`, `validation_error`, ...
- **Pagination**: `?page=1&size=20` returns `{items, total, page, size, pages}`.
- **Money** values (`price`, `subtotal`, `total`, `delivery_fee`) are **decimal strings**
  (e.g. `"23.00"`) — parse with a decimal-safe library, not `parseFloat`, when doing math.
- Dates are ISO 8601 with timezone.

## Auth flow

1. `POST /api/v1/auth/register` `{email, password, full_name, phone?}` → 201 user
2. `POST /api/v1/auth/login` `{email, password}` →
   `{access_token, refresh_token, token_type: "bearer"}`
3. Send `Authorization: Bearer <access_token>` on every authenticated call.
4. Access tokens expire after 30 min → on 401 with code `invalid_token`,
   call `POST /api/v1/auth/refresh` `{refresh_token}` for a fresh pair, then retry.
5. Profile: `GET /api/v1/auth/me`, `PATCH /api/v1/auth/me` `{full_name?, phone?, password?}`.

```js
const login = async (email, password) => {
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await res.json(); // {detail, code}
  return res.json(); // {access_token, refresh_token}
};
```

## Catalog

- `GET /api/v1/products?q=laptop&category=laptops&brand=asus&min_price=100&max_price=1000&in_stock=true&sort=price_asc&page=1&size=20`
  - `sort`: `newest` (default) | `price_asc` | `price_desc` | `name`
- `GET /api/v1/products/{id_or_slug}` — accepts UUID or slug
- `GET /api/v1/categories` — nested tree `[{id, name, slug, children: [...]}]`
- `GET /api/v1/categories/{slug}/products?page=&size=`

Admin (requires an admin token): `POST/PATCH/DELETE /api/v1/products`,
`PATCH /api/v1/products/{id}/stock` `{"adjustment": -2}`, same CRUD for `/categories`.

## Checkout (no server-side cart)

Keep the cart client-side; send it once at checkout:

```
POST /api/v1/orders
{
  "items": [{"product_id": "uuid", "quantity": 2}],
  "payment_method": "cash_on_delivery",        // cash_on_delivery | card | wallet
  "delivery_location_id": "uuid",              // from POST /locations/resolve
  "notes": "optional",
  "customer_name": "...", "customer_phone": "..." // required only for guests
}
```

- 201 → full order with `status: "pending"`, price snapshots, and totals
- 409 `out_of_stock` → show the message; stock was NOT decremented
- 409 `outside_delivery_area` → location not deliverable

Then: `GET /api/v1/orders` (own orders, paginated), `GET /api/v1/orders/{id}`,
`POST /api/v1/orders/{id}/cancel` (only `pending`/`confirmed`; restocks automatically).

Order statuses: `pending → confirmed → preparing → out_for_delivery → delivered`, plus `cancelled`.

## Locations

- `POST /api/v1/locations/resolve` `{"input": "<google maps link or address>"}` →
  `{location: {...}, delivery_fee: "3.00" | null, currency}`.
  `delivery_fee: null` means outside the delivery area.
- Saved addresses (auth required): `GET/POST /api/v1/locations/addresses`,
  `PATCH /api/v1/locations/addresses/{id}/default`, `DELETE /api/v1/locations/addresses/{id}`.

## Chat (AI assistant)

1. `POST /api/v1/chat/conversations` (works with or without auth) →
   `{id, session_token, ...}`. **Guests**: store `session_token` and send it as the
   `X-Session-Token` header on every chat call. Authenticated users just use their JWT.
2. `POST /api/v1/chat/conversations/{id}/messages` `{"content": "..."}` →
   `{conversation_id, messages: [...]}` — the messages persisted this turn, in order:
   your `user` message, zero or more `tool` messages (order created, location resolved —
   results in `metadata`), and the `assistant` reply.
3. `GET /api/v1/chat/conversations/{id}/messages` — full history for rendering.
4. If the AI is down you get 502 `ai_service_unavailable` — show a retry option;
   the user message was saved.

Tool message metadata worth rendering:
- `{"action": "create_order", "ok": true, "order_id": ..., "total": "23.00"}` → link to the order
- `{"action": "resolve_location", "ok": true, "location": {...}, "delivery_fee": "3.00"}`
- `{"ok": false, "error": "...", "code": "out_of_stock"}` → the assistant usually explains it

Assistant messages may carry `metadata.recommended_product_ids` — fetch those products
to render product cards.

## Admin dashboard

- `GET /api/v1/admin/analytics/summary` →
  `{orders_total, revenue, users_total, conversations_total, orders_by_status, top_products}`
- **Orders**:
  - `GET /api/v1/admin/orders?status=pending&customer_phone=079&user_id=<uuid>&page=&size=`
    — all orders, filterable by status, phone, or a specific user
  - `PATCH /api/v1/admin/orders/{id}/status` `{"status": "confirmed"}`
- **Users**:
  - `GET /api/v1/admin/users?q=<email or name>&role=customer&is_active=true&page=&size=`
    — paginated user list with search and filters
  - `GET /api/v1/admin/users/{id}` — one user's full profile
  - `PATCH /api/v1/admin/users/{id}` `{"is_active": false}` — deactivate/reactivate an account
    (deactivating immediately invalidates that user's tokens)
- **Conversations**: `GET /api/v1/admin/conversations`, `GET /api/v1/admin/conversations/{id}/messages`

> Passwords are never returned by any endpoint — the `users` table stores only a bcrypt
> hash (`hashed_password`), so the admin sees profile fields (email, name, phone, role,
> status, dates) but never a password.
