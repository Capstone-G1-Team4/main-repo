# AI Shopping Assistant

Capstone Project — G1 Team4

An AI-powered shopping assistant that uses RAG (Retrieval-Augmented Generation) and agentic AI to help customers find products, answer questions, compare items, and place orders through natural conversation.

## Architecture

```
                    ┌─────────┐
                    │  Nginx  │ :80
                    │  (Proxy)│
                    └────┬────┘
            ┌────────────┼────────────┐
            ▼            ▼            ▼
     ┌────────────┐ ┌─────────┐ ┌──────────┐
     │  Frontend  │ │ Backend │ │ AI       │
     │  Next.js   │ │ FastAPI │ │ Service  │
     │  :3000     │ │ :8000   │ │ :8001    │
     └────────────┘ └────┬────┘ └────┬─────┘
                         │           │
                         ▼           ▼
                   ┌──────────┐ ┌──────────┐
                   │PostgreSQL│ │ChromaDB  │
                   │  :5432   │ │(Vectors) │
                   └──────────┘ └──────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| **nginx** | 80 | Reverse proxy, routes all traffic |
| **frontend** | 3000 | Next.js customer UI + admin dashboard |
| **backend** | 8000 | FastAPI REST API (auth, products, orders) |
| **ai-service** | 8001 | Agentic RAG microservice (chat, recommendations) |
| **db** | 5433 (host) | PostgreSQL 16 database |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- A [Groq API key](https://console.groq.com/) (for the LLM)

### Setup

```bash
# Clone the repo
git clone https://github.com/Capstone-G1-Team4/main-repo.git
cd main-repo

# Create your environment file
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Build and start everything
make setup
make up
```

Or without Make:

```bash
cp .env.example .env
# Edit .env
docker compose up --build
```

### Access

- **Customer UI**: http://localhost:80 (via Nginx) or http://localhost:3000
- **Backend API docs**: http://localhost:8000/docs
- **AI Service docs**: http://localhost:8001/docs
- **Admin Panel**: http://localhost:8000/admin-ui/

## Development

### Without Docker

Each service can run independently:

**Backend:**
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate  # Windows
pip install -e .
uvicorn app.main:app --reload
```

**AI Service:**
```bash
cd Agentic-RAG
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
python app/rag/data_loader.py && python app/rag/embeddings.py
uvicorn app.main:app --reload --port 8001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Make Commands

```bash
make help           # Show all available commands
make up             # Start all services
make down           # Stop all services
make logs           # Tail all logs
make test           # Run all tests
make lint           # Lint all services
make rebuild        # Rebuild from scratch
make db-shell       # Open psql shell
make health         # Check all service health
```

## Project Structure

```
main-repo/
├── backend/              FastAPI REST API
│   ├── app/              Application code (routes, models, services)
│   ├── alembic/          Database migrations
│   ├── scripts/          Seed & import scripts
│   └── tests/            Pytest test suite
├── Agentic-RAG/          AI microservice
│   ├── app/              Agent, RAG pipeline, tools
│   └── data/             Product CSVs + processed JSON
├── frontend/             Next.js customer UI
│   ├── app/              Pages (App Router)
│   └── src/              Shared components, context, utils
├── nginx/                Nginx reverse proxy config
├── scripts/              Infrastructure scripts
├── .github/workflows/    CI/CD pipelines
├── docker-compose.yml    Full-stack orchestration
├── Makefile              Developer commands
└── .env.example          Environment template
```

## CI/CD

- **On every push/PR to `main`**: Lint + test + Docker build verification
- **On merge to `main`**: Build & push Docker images to GitHub Container Registry

See `.github/workflows/` for pipeline details.

## Team

| Member | Role | Focus |
|--------|------|-------|
| Shahd Ala' Ghunimah | AI Lead | RAG pipeline, prompt engineering, evaluation |
| Naseem Saleh Migdadi | Infrastructure | CI/CD, Docker, deployment, monitoring |
| Dania Jarbooh | Frontend | UI/UX, React, chat interface |
| Mousa Al-Rashdan | Backend | API design, DB, order/location logic |

## License

MIT
