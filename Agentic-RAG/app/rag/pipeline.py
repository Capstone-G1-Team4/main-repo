from app.rag.retriever import retrieve_products
from app.llm import generate_answer

def rag_answer(question: str, context: str):
    """
    RAG pipeline: توليد إجابة باستخدام LLM مع سياق المنتج
    """
    prompt = f"""
You are an AI shopping assistant for an online store.

Rules:
- Use ONLY the provided product information.
- Do not invent products or specifications.
- Mention product name and price.
- Format as a numbered list.
- Explain why each product matches the customer request.

Product information:

{context}

Customer question:

{question}
"""
    return generate_answer(prompt)