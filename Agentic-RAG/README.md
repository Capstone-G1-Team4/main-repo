# Agentic RAG Shopping Assistant

Capstone Project — G1 Team 4

AI service for an online shopping assistant: semantic product search (RAG over a ChromaDB vector store), product comparison, free-form product Q&A, and a conversational order flow — all with **persistent chat memory** (SQLite), so conversations survive page reloads and server restarts.

## Architecture (AI service)

```
app/
├── main.py              # FastAPI service (chat + history + sessions endpoints)
├── llm.py               # LLM client (Groq, llama-3.3-70b-versatile)
├── config.py            # env config
├── rag/
│   ├── data_loader.py   # raw Flipkart CSVs -> data/processed/products.json
│   ├── embeddings.py    # products.json -> ChromaDB vector_store/
│   ├── retriever.py     # semantic search (lazy-loaded)
│   └── pipeline.py      # rag_answer(): retrieval + grounded LLM answer
└── agent/
    ├── agent.py         # shopping_agent(): intent routing + order state machine
    ├── router.py        # LLM intent classification (keyword fallback)
    ├── tools.py         # search_products / compare_products / create_order
    ├── memory.py        # persistent sessions + chat history (SQLite)
    └── maps_tool.py     # Google Maps geocoding for delivery addresses
```

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create a `.env` file:

```
GROQ_API_KEY=your_key_here
GOOGLE_MAPS_API_KEY=optional_for_address_geocoding
```

Build the vector store (needs the raw CSVs in `data/raw/`):

```bash
python app/rag/data_loader.py
python app/rag/embeddings.py
```

Run the API:

```bash
uvicorn app.main:app --reload
```

Interactive docs: http://localhost:8000/docs

## API (for frontend/backend integration)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/chat` | Send a message: `{"session_id": "...", "message": "..."}` → `{response, intent, order}` |
| GET | `/chat/{session_id}/history` | Restore the full chat on page load |
| GET | `/chat/{session_id}/orders` | Orders placed in this session (backend consumes these) |
| DELETE | `/chat/{session_id}` | Clear a chat/session |
| GET | `/sessions` | List sessions (debug/admin) |

**Frontend integration for persistent chat:** generate a `session_id` once (e.g. `crypto.randomUUID()`), store it in `localStorage`, send it with every `/chat` call, and call `GET /chat/{session_id}/history` on page load to re-render the conversation. All history is stored server-side in SQLite (`data/agent_memory.db`).

## What the agent can do

- **Search** — "I need a Samsung phone under 40000 with good battery"
- **Product Q&A** — "Does it have a good camera?", "What's the warranty?" (free-form questions, with conversation context)
- **Compare** — "Compare Samsung A13 and Samsung F42"
- **Order** — "I want to buy Samsung A13" → the agent confirms the product, then asks for name → phone → address (Google Maps geocoding when available) → final confirmation. The flow is a state machine persisted per session; the customer can ask product questions mid-order or say "cancel" at any point.
- **Support** — general help questions.

Intent detection is LLM-based with a keyword fallback if the LLM is unavailable.

## Tests

Ad-hoc test scripts (need vector store + GROQ_API_KEY):

```bash
python test_agent.py         # full demo: search, Q&A, compare, order
python test_final_agent.py   # end-to-end + memory check
python test_order_memory.py  # persistence check
```
