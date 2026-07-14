# AI Shopping Assistant

Capstone Project — G1 Team4

An AI-powered shopping assistant that uses RAG (Retrieval-Augmented Generation) and agentic AI to help customers find products, answer questions, compare items, and place orders through natural conversation.

## Features
- 🛍️ Natural language product search
- 📊 Product comparison
- 💬 Conversational ordering with state machine
- 🔍 RAG-based product question answering
- 🎤 (Optional) Voice input (requires OpenAI API key)
- 📈 Prometheus metrics for monitoring
- 📊 Admin AI panel with analytics and NLP-to-SQL
- 📱 Responsive Next.js frontend

## Architecture

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
- (Optional) An [OpenAI API key](https://platform.openai.com/) for voice input

### Setup

```bash
# Clone the repo
git clone https://github.com/Capstone-G1-Team4/main-repo.git
cd main-repo

# Create your environment file
cp .env.example .env
# Edit .env and add your GROQ_API_KEY (and OPENAI_API_KEY for voice input)

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
- **Admin Panel**: http://localhost:3000/admin (Login with `admin@example.com` / `admin12345`)
- **Prometheus Metrics**: 
  - Backend: http://localhost:8000/metrics
  - AI Service: http://localhost:8001/metrics

## Admin AI Panel
The admin panel includes two main sections:
1. **Dashboard**: Displays product, user, and order analytics
2. **NLP-to-SQL**: Allows admins to query the database using natural language

To access the admin panel:
1. Go to http://localhost:3000/login
2. Login with admin credentials: `admin@example.com` / `admin12345`
3. Click "Go to Admin AI" in the top navigation

## Evaluation Results
We evaluated our RAG system on 50 test queries:

| Approach                     | Grounding rate | Notes                                                                 |
|------------------------------|----------------|-----------------------------------------------------------------------|
| Baseline: Random retrieval   | 10%            | Pure random chance of retrieving a relevant product                  |
| Our system (Semantic Search) | **74%**        | Sentence-BERT embeddings + ChromaDB with improved prompt and metadata |

### Evaluation Queries
Test queries include:
- Specific product searches ("I need a Samsung phone under 40000")
- Vague needs ("Something for my grandma")
- Product comparisons ("Compare HP 14s vs Dell Inspiron")
- Feature questions ("Does ASUS VivoBook have a backlit keyboard?")

### Key Results
- 37/50 queries achieved GOOD grounding (74%)
- Remaining queries were limited by Groq API rate limits (not system failures)

## Error Analysis
Key failure modes identified:
1. Missing product metadata (color, specific features)
2. Vague queries with no matching keywords in product data
3. Strict evaluation heuristic (exact product name match)

Next iteration hypothesis:
"If we enrich product metadata with color, keyboard features, and use-case tags, we can reduce vague need errors by ~40% and product question failures by ~30%."

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