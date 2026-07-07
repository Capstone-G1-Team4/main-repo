# AI Shopping Assistant — Backend

Backend API for the capstone project **AI Shopping Assistant using RAG and Agentic AI**.
Owned by Member 2 (Backend). It exposes REST APIs for the frontend (Member 1) and
brokers chat with the external AI microservice (Member 4).

## Stack

Python 3.11+ · FastAPI · SQLAlchemy 2.0 (async) · Alembic · PostgreSQL · Pydantic v2 · JWT · httpx · pytest · Docker

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

Migrations run automatically on startup. Then:

- Interactive docs: http://localhost:8000/docs
- Liveness: `GET /health` — Readiness (DB + AI service): `GET /health/ready`
- Postgres is exposed on host port **5433** (to avoid clashing with a local install)

Create the admin account (the only seeded data — no sample products/orders):

```bash
docker compose exec api env ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=change-me \
  python scripts/seed.py
```

## Quick start (local, no Docker)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env          # DATABASE_URL points at the dockerized Postgres on :5433
alembic upgrade head
python scripts/seed.py        # one admin user
uvicorn app.main:app --reload
```

## Smoke test

```bash
curl http://localhost:8000/health
# register + login
curl -X POST http://localhost:8000/api/v1/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"c@example.com","password":"password123","full_name":"Customer"}'
curl -X POST http://localhost:8000/api/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"c@example.com","password":"password123"}'
# browse products (empty until an admin adds some)
curl 'http://localhost:8000/api/v1/products?page=1&size=10'
```

## Project layout

```
app/
├── main.py        # app wiring only (routers, middleware, handlers)
├── core/          # settings, security (JWT), deps, exception handlers
├── db/            # engine, session, declarative base
├── models/        # SQLAlchemy models (one file per domain)
├── schemas/       # Pydantic schemas (one file per domain)
├── api/v1/        # routers (one file per domain)
├── services/      # business logic (one file per domain)
└── utils/         # small pure helpers (slugs, maps URL parsing)
alembic/           # migrations (append-only — never edit a committed one)
scripts/seed.py    # creates ONE admin user, nothing else
tests/             # pytest suites (fixtures create all their own data)
docs/              # api-overview, erd, ai-service-contract, frontend-integration
```

## Documentation for teammates

- [docs/api-overview.md](docs/api-overview.md) — endpoint map + conventions
- [docs/frontend-integration.md](docs/frontend-integration.md) — for Member 1
- [docs/ai-service-contract.md](docs/ai-service-contract.md) — for Member 4
- [docs/erd.md](docs/erd.md) — database schema (mermaid)

## Configuration

All secrets/config via environment variables — see [.env.example](.env.example):
`DATABASE_URL`, `JWT_SECRET`, `AI_SERVICE_URL`, `INTERNAL_API_KEY`,
`GOOGLE_MAPS_API_KEY` (empty → offline mock geocoder), `DELIVERY_ZONE_CITIES`,
`DEFAULT_DELIVERY_FEE`, `CORS_ORIGINS`.

## Migrations

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

## Tests & lint

```bash
pytest        # runs against in-memory SQLite, no services needed
ruff check .
```
