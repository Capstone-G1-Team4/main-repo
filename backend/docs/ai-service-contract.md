# AI Service Contract (Backend ⇄ AI Microservice)

Audience: **Member 4** (AI/RAG service). This is the single source of truth for how the
backend talks to your FastAPI microservice. The backend is the only caller; the frontend
never talks to you directly.

## Overview

```
Frontend ──► Backend POST /api/v1/chat/conversations/{id}/messages
                 │ 1. persists the user message
                 │ 2. calls YOU:  POST {AI_SERVICE_URL}/agent/chat
                 │ 3. executes any tool actions you returned (orders, locations)
                 │ 4. persists tool results + your reply, returns all to the frontend
                 ▼
             PostgreSQL
```

The backend reads `AI_SERVICE_URL` from its environment (default `http://localhost:8001`).
Timeout: `AI_SERVICE_TIMEOUT_SECONDS` (default 30s), with one retry on connection errors.
If your service is down or replies with non-200 / invalid JSON, the backend returns
`502 {"detail": ..., "code": "ai_service_unavailable"}` to the frontend — the user
message is already persisted, so the turn can be retried.

## Endpoint you must implement

### `POST /agent/chat`

Request body (JSON):

```json
{
  "conversation_id": "6f1e...uuid",
  "messages": [
    {"role": "user", "content": "I need a gaming laptop under 1000 JOD", "metadata": null},
    {"role": "assistant", "content": "Here are two options ...", "metadata": {"recommended_product_ids": ["..."]}},
    {"role": "tool", "content": "resolve_location: ok", "metadata": {"action": "resolve_location", "ok": true, "location": {...}}}
  ],
  "user_context": {
    "user_id": "uuid-or-null",
    "full_name": "Mousa T.",
    "phone": "+9627...",
    "authenticated": true
  }
}
```

- `messages` is the last **20** messages of the conversation, oldest first, including
  `tool` results from actions you previously requested. Roles: `user`, `assistant`,
  `system`, `tool`.
- For guests, `user_context` is `{"user_id": null, "full_name": null, "phone": null, "authenticated": false}` —
  your agent must collect name/phone conversationally before ordering.

Response body (JSON) — all fields optional except that a response must parse:

```json
{
  "reply": "I placed your order! Total is 25.00 JOD.",
  "actions": [
    {"action": "create_order", "payload": { ... }},
    {"action": "resolve_location", "payload": {"maps_url": "https://maps.app.goo.gl/..."}}
  ],
  "metadata": {"recommended_product_ids": ["uuid1", "uuid2"]}
}
```

- `reply` — assistant text shown to the user (persisted as an `assistant` message with
  your `metadata` attached). May be `null` if you only want to run actions.
- `actions` — tool calls the backend executes **in order**, each producing a `tool`
  message whose `metadata` holds the structured result. You see those results in the
  `messages` array of the *next* turn.
- Any other HTTP status than 200 is treated as failure.

## Supported actions

### `create_order`

Payload = the backend's checkout schema:

```json
{
  "items": [{"product_id": "uuid", "quantity": 2}],
  "customer_name": "Guest Name",          // optional for authenticated users
  "customer_phone": "+962790000000",      // optional for authenticated users
  "payment_method": "cash_on_delivery",   // cash_on_delivery | card | wallet
  "delivery_location_id": "uuid-or-null", // from a previous resolve_location result
  "notes": "call on arrival"
}
```

Result metadata on the `tool` message:

```json
{"action": "create_order", "ok": true, "order_id": "uuid", "status": "pending",
 "subtotal": "20.00", "delivery_fee": "3.00", "total": "23.00"}
```

Failures (out of stock, missing contact info, outside delivery area, unknown product)
come back as `{"ok": false, "error": "...", "code": "out_of_stock" | ...}` — relay the
problem conversationally, don't crash.

### `resolve_location`

Payload: `{"maps_url": "<google maps link>"}` or `{"input": "<typed address>"}`.

Result metadata:

```json
{"action": "resolve_location", "ok": true,
 "location": {"id": "uuid", "latitude": 31.95, "longitude": 35.91,
               "formatted_address": "...", "city": "Amman",
               "is_within_delivery_area": true, ...},
 "delivery_fee": "3.00"}
```

Use `location.id` as `delivery_location_id` in a later `create_order`.

## Catalog sync (for your RAG index)

Pull the full catalog from the backend:

```
GET {BACKEND_URL}/api/v1/internal/products/export
X-Internal-API-Key: <INTERNAL_API_KEY from the shared env>
```

Response: `{"generated_at": "...", "count": n, "products": [{id, name, slug, description,
specifications, price, currency, stock_quantity, is_available, brand, category}]}`.
Prices are decimal strings. Re-sync on a schedule or on demand — there is no push.

## Health

The backend's `GET /health/ready` pings `GET {AI_SERVICE_URL}/health`; expose a
cheap 200 there.
