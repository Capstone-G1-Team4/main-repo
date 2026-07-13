"""Application entrypoint: wires routers, middleware, and exception handlers. No business logic."""

import logging
from pathlib import Path
from pythonjsonlogger import jsonlogger

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from prometheus_fastapi_instrumentator import Instrumentator, metrics
from prometheus_client import Counter, Gauge

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

# Set up JSON-line logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
json_formatter = jsonlogger.JsonFormatter(
    "%(asctime)s %(levelname)s %(name)s %(message)s %(module)s %(funcName)s %(lineno)d"
)
handler.setFormatter(json_formatter)
logger.addHandler(handler)

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

# Prometheus integration
Instrumentator().add(
    metrics.request_size()
).add(
    metrics.response_size()
).add(
    metrics.latency()
).add(
    metrics.requests()
).instrument(app).expose(app)

# Custom metrics
product_query_counter = Counter(
    "product_query_total",
    "Total number of product queries made",
    ["category"]
)
active_users_gauge = Gauge(
    "active_users",
    "Number of currently active users"
)

register_exception_handlers(app)

app.include_router(health.router)
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(products.router, prefix=settings.api_v1_prefix)
app.include_router(categories.router, prefix=settings.api_v1_prefix)
app.include_router(internal.router, prefix=settings.api_v1_prefix)
app.include_router(locations.router, prefix=settings.api_v1_prefix)
app.include_router(orders.router, prefix=settings.api_v1_prefix)
app.include_router(orders.admin_router, prefix=settings.api_v1_prefix)
app.include_router(chat.router, prefix=settings.api_v1_prefix)
app.include_router(admin.router, prefix=settings.api_v1_prefix)

# Lightweight built-in admin panel (internal tool, not the customer frontend):
# a self-contained HTML page for adding products by signing in as an admin.
app.mount(
    "/admin-ui",
    StaticFiles(directory=Path(__file__).parent / "static", html=True),
    name="admin-ui",
)

# Expose custom metric functions for other modules to use
def increment_product_query(category: str):
    product_query_counter.labels(category=category).inc()

def update_active_users(count: int):
    active_users_gauge.set(count)

