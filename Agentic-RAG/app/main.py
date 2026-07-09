from fastapi import FastAPI

app = FastAPI(
    title="Agentic RAG Shopping Assistant"
)


@app.get("/")
def home():
    return {
        "message": "AI Service is running"
    }
