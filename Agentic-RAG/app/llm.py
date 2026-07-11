"""
LLM client (Groq, OpenAI-compatible API).

- Lazy client creation with a clear error if GROQ_API_KEY is missing.
- generate_answer() accepts optional conversation history so the
  agent can answer follow-up questions in context.
"""

import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

MODEL = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")

DEFAULT_SYSTEM_PROMPT = """
You are an AI shopping assistant for an online store.
Answer customers using only the provided product information.
Do not invent products, prices, or specifications.
Be friendly, concise, and helpful.
"""

_client = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. Add it to your .env file "
                "(GROQ_API_KEY=...) and restart the server."
            )
        _client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=api_key,
        )
    return _client


def generate_answer(
    prompt: str,
    system_prompt: str = DEFAULT_SYSTEM_PROMPT,
    history: list | None = None,
    temperature: float = 0.1,
) -> str:
    """
    Generate an answer from the LLM.

    history: optional list of {"role": "user"/"assistant", "content": ...}
             messages (oldest first) to give the model conversation context.
    """
    messages = [{"role": "system", "content": system_prompt}]

    if history:
        # keep only the most recent turns to stay within context limits
        messages.extend(history[-10:])

    messages.append({"role": "user", "content": prompt})

    response = _get_client().chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=temperature,
    )
    return response.choices[0].message.content


def classify_text(prompt: str) -> str:
    """Small helper for classification calls (single short answer)."""
    response = _get_client().chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,
        max_tokens=10,
    )
    return response.choices[0].message.content.strip().lower()
