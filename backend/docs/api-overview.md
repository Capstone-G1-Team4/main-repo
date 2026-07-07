# API Overview

Base prefix for business endpoints: `/api/v1`. Health endpoints live at the root.

| Area | Prefix | Status |
|------|--------|--------|
| Health | `/health`, `/health/ready` | ✅ Phase 1 |
| Auth | `/api/v1/auth` | Phase 2 |
| Catalog | `/api/v1/products`, `/api/v1/categories` | Phase 3 |
| Cart & Orders | `/api/v1/cart`, `/api/v1/orders` | Phase 4 |
| Locations | `/api/v1/locations` | Phase 5 |
| Chat / AI proxy | `/api/v1/chat` | Phase 6 |
| Admin & Analytics | `/api/v1/admin` | Phase 7 |

## Conventions

- **Errors**: every error returns `{"detail": ..., "code": ...}` with an appropriate HTTP status
  (401/403 auth, 404 not found, 409 conflict e.g. out-of-stock, 422 validation, 502 AI service down).
- **Pagination**: list endpoints accept `?page=&size=` and return
  `{"items": [...], "total": n, "page": p, "size": s, "pages": k}`.
- **Auth**: `Authorization: Bearer <access_token>` (JWT). Refresh via `POST /api/v1/auth/refresh`.
- **Internal endpoints** (AI indexer sync) require the `X-Internal-API-Key` header.

This file is updated at the end of every phase.
