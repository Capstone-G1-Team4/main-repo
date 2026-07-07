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

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Liveness: `GET /health` — Readiness (DB + AI service): `GET /health/ready`

## Quick start (local, no Docker)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env          # point DATABASE_URL at your Postgres
alembic upgrade head
uvicorn app.main:app --reload
```

## Project layout

```
app/
├── main.py        # app wiring only (routers, middleware, handlers)
├── core/          # settings, security, exceptions, deps
├── db/            # engine, session, declarative base
├── models/        # SQLAlchemy models (one file per domain)
├── schemas/       # Pydantic schemas (one file per domain)
├── api/v1/        # routers (one file per domain)
├── services/      # business logic (one file per domain)
└── utils/
alembic/           # migrations (append-only)
tests/             # pytest suites
docs/              # integration docs for Members 1 & 4
```

## Migrations

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

Never edit a committed migration — always add a new one.

## Tests & lint

```bash
pytest
ruff check .
```
