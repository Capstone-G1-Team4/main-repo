"""Application entrypoint: wires routers, middleware, and exception handlers. No business logic."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import compat
from app.api.v1 import (
    admin,
    auth,
    categories,
    chat,
    health,
    internal,
    locations,
    orders,
    products,
)
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(health.router)

# Canonical API — documented at /docs, the source of truth for teammates.
_api_routers = (
    auth.router,
    products.router,
    categories.router,
    internal.router,
    locations.router,
    orders.router,
    orders.admin_router,
    chat.router,
    admin.router,
)
for _router in _api_routers:
    app.include_router(_router, prefix=settings.api_v1_prefix)

# Frontend-compatibility shim (temporary): the current frontend calls the API
# without the /api/v1 prefix and names chat resources "sessions". Re-mount the
# same routers at the root and add the chat "sessions" aliases so those calls
# resolve instead of 404ing. Hidden from /docs (the canonical API above is the
# documented one). Remove once the frontend adopts /api/v1 + "conversations".
for _router in _api_routers:
    app.include_router(_router, include_in_schema=False)
app.include_router(compat.router, include_in_schema=False)

# Lightweight built-in admin panel (internal tool, not the customer frontend):
# a self-contained HTML page for adding products by signing in as an admin.
app.mount(
    "/admin-ui",
    StaticFiles(directory=Path(__file__).parent / "static", html=True),
    name="admin-ui",
)
