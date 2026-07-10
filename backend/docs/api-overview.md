# API Overview

Base prefix for business endpoints: `/api/v1`. Health endpoints live at the root.
Full request/response examples: [frontend-integration.md](frontend-integration.md) and
[ai-service-contract.md](ai-service-contract.md). Schema: [erd.md](erd.md).

| Area | Endpoints | Auth |
|------|-----------|------|
| Health | `GET /health`, `GET /health/ready` | none |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET/PATCH /auth/me` | mixed |
| Products | `GET /products` (filters+pagination), `GET /products/{id_or_slug}` | none |
| Products (admin) | `POST/PATCH/DELETE /products`, `PATCH /products/{id}/stock` | admin |
| Categories | `GET /categories` (tree), `GET /categories/{slug}/products` | none |
| Categories (admin) | `POST/PATCH/DELETE /categories` | admin |
| Orders | `POST /orders` (guest-capable), `GET /orders`, `GET /orders/{id}`, `POST /orders/{id}/cancel` | mixed |
| Orders (admin) | `GET /admin/orders`, `PATCH /admin/orders/{id}/status` | admin |
| Locations | `POST /locations/resolve`, `GET/POST/DELETE /locations/addresses`, `PATCH /locations/addresses/{id}/default` | mixed |
| Chat | `POST /chat/conversations`, `POST/GET /chat/conversations/{id}/messages` | mixed (guests via `X-Session-Token`) |
| Admin | `GET /admin/analytics/summary`, `GET /admin/users` (search/filter), `GET /admin/users/{id}`, `PATCH /admin/users/{id}`, `GET /admin/orders` (filter by status/phone/user), `GET /admin/conversations`, `GET /admin/conversations/{id}/messages` | admin |
| Internal | `GET /internal/products/export` | `X-Internal-API-Key` |

## Conventions

- **Errors**: every error returns `{"detail": ..., "code": ...}` with an appropriate HTTP status
  (401/403 auth, 404 not found, 409 conflict e.g. out-of-stock, 422 validation, 502 AI service down).
- **Pagination**: list endpoints accept `?page=&size=` and return
  `{"items": [...], "total": n, "page": p, "size": s, "pages": k}`.
- **Auth**: `Authorization: Bearer <access_token>` (JWT, 30 min) + refresh token (7 days).
- **Money**: decimal strings (`"23.00"`).
- **Cart decision**: there is no server-side cart — the frontend keeps the cart locally and
  submits it as the `POST /orders` payload. This keeps the API stateless and matches how the
  AI agent builds orders from conversation context.
