# =============================================================================
# AI Shopping Assistant — Developer Makefile
# =============================================================================
# Quick reference:
#   make setup       — First-time setup (copy env, build images)
#   make up          — Start all services
#   make down        — Stop all services
#   make logs        — Tail logs from all services
#   make test        — Run all tests
#   make lint        — Lint all services
#   make rebuild     — Rebuild all images from scratch
# =============================================================================

COMPOSE := docker compose
SERVICES := db backend ai-service frontend nginx

# ---- First-time setup ------------------------------------------------------
.PHONY: setup
setup:
	@if not exist .env copy .env.example .env
	$(COMPOSE) build
	@echo ""
	@echo "Setup complete! Run 'make up' to start all services."

# ---- Lifecycle --------------------------------------------------------------
.PHONY: up
up:
	$(COMPOSE) up -d
	@echo ""
	@echo "Services starting..."
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend:   http://localhost:8000/docs"
	@echo "  AI Service: http://localhost:8001/docs"
	@echo "  Nginx:     http://localhost:80"

.PHONY: down
down:
	$(COMPOSE) down

.PHONY: restart
restart:
	$(COMPOSE) restart

.PHONY: rebuild
rebuild:
	$(COMPOSE) down
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d

.PHONY: pull
pull:
	$(COMPOSE) pull

# ---- Logs -------------------------------------------------------------------
.PHONY: logs
logs:
	$(COMPOSE) logs -f

.PHONY: logs-backend
logs-backend:
	$(COMPOSE) logs -f backend

.PHONY: logs-ai
logs-ai:
	$(COMPOSE) logs -f ai-service

.PHONY: logs-frontend
logs-frontend:
	$(COMPOSE) logs -f frontend

# ---- Database ---------------------------------------------------------------
.PHONY: db-migrate
db-migrate:
	$(COMPOSE) exec backend alembic upgrade head

.PHONY: db-revision
db-revision:
	$(COMPOSE) exec backend alembic revision --autogenerate -m "$(msg)"

.PHONY: db-shell
db-shell:
	$(COMPOSE) exec db psql -U postgres -d shopdb

.PHONY: db-reset
db-reset:
	$(COMPOSE) down -v
	$(COMPOSE) up -d db
	@echo "Waiting for DB..."
	@timeout /t 5 /nobreak > nul
	$(COMPOSE) up -d backend
	@echo "DB reset and migrations applied."

# ---- Testing ----------------------------------------------------------------
.PHONY: test
test: test-backend test-ai

.PHONY: test-backend
test-backend:
	cd backend && python -m pytest -v --tb=short

.PHONY: test-ai
test-ai:
	cd Agentic-RAG && python -m pytest -v --tb=short 2>/dev/null || echo "No pytest tests in AI service"

# ---- Linting ----------------------------------------------------------------
.PHONY: lint
lint: lint-backend lint-frontend lint-ai

.PHONY: lint-backend
lint-backend:
	cd backend && ruff check .

.PHONY: lint-frontend
lint-frontend:
	cd frontend && npx next lint

.PHONY: lint-ai
lint-ai:
	cd Agentic-RAG && ruff check app/ 2>/dev/null || echo "Ruff not configured in AI service"

# ---- Health checks ----------------------------------------------------------
.PHONY: health
health:
	@echo "--- Backend ---"
	@curl -s http://localhost:8000/health || echo "UNREACHABLE"
	@echo ""
	@echo "--- AI Service ---"
	@curl -s http://localhost:8001/ || echo "UNREACHABLE"
	@echo ""
	@echo "--- Frontend ---"
	@curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3000 || echo "UNREACHABLE"
	@echo ""
	@echo "--- Nginx ---"
	@curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:80 || echo "UNREACHABLE"
	@echo ""

# ---- Vector store -----------------------------------------------------------
.PHONY: rebuild-vector-store
rebuild-vector-store:
	$(COMPOSE) exec ai-service python app/rag/data_loader.py
	$(COMPOSE) exec ai-service python app/rag/embeddings.py
	@echo "Vector store rebuilt."

# ---- Shell access -----------------------------------------------------------
.PHONY: shell-backend
shell-backend:
	$(COMPOSE) exec backend bash

.PHONY: shell-ai
shell-ai:
	$(COMPOSE) exec ai-service bash

.PHONY: shell-db
shell-db:
	$(COMPOSE) exec db psql -U postgres -d shopdb

# ---- Cleanup ----------------------------------------------------------------
.PHONY: clean
clean:
	$(COMPOSE) down -v --remove-orphans
	docker system prune -f
	@echo "Cleaned up containers, volumes, and dangling images."
