"""
RAG pipeline: retrieve product context and generate a grounded answer.
"""

from app.llm import generate_answer
from app.rag.retriever import retrieve_products


def rag_answer(question: str, context: str | None = None, history: list | None = None):
    """
    Generate an answer using the LLM with product context.

    - If context is not provided, it is retrieved automatically
      from the vector store.
    - history (optional) gives the model the conversation so far,
      so follow-up questions like "does it have a good camera?" work.
    """
    if context is None:
        products = retrieve_products(question)
        context = "\n\n".join(p["content"] for p in products)

    prompt = f"""
You are an AI shopping assistant for an online store.

Rules:
- Use ONLY the provided product information.
- Do not invent products, prices, or specifications.
- Mention the product name and price when recommending.
- When listing several products, format them as a numbered list.
- Explain briefly why each product matches the customer request.
- If the answer is not in the product information, say so honestly.

Product information:

{context}

Customer question:

{question}
"""
    return generate_answer(prompt, history=history)
