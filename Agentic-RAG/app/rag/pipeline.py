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
        # Include metadata (name, brand, price, rating) in context for better grounding
        context_parts = []
        for i, product in enumerate(products, 1):
            meta = product["metadata"] or {}
            context_part = f"Product {i}:\n"
            if meta.get("name"):
                context_part += f"- Name: {meta['name']}\n"
            if meta.get("brand"):
                context_part += f"- Brand: {meta['brand']}\n"
            if meta.get("category"):
                context_part += f"- Category: {meta['category']}\n"
            if meta.get("price"):
                context_part += f"- Price: {meta['price']}\n"
            if meta.get("rating"):
                context_part += f"- Rating: {meta['rating']}\n"
            context_part += f"- Details:\n  {product['content']}"
            context_parts.append(context_part)
        context = "\n\n".join(context_parts)

    prompt = f"""
You are an AI shopping assistant for an online store.

Rules:
- Use ONLY the provided product information.
- Do not invent products, prices, or specifications.
- ALWAYS MENTION THE PRODUCT NAME clearly when recommending or discussing a product.
- When listing several products, format them as a numbered list.
- Explain briefly why each product matches the customer request.
- If the answer is not in the product information, say so honestly.
- If a product feature is not mentioned, say "The product description doesn't specify this."

Product information:

{context}

Customer question:

{question}
"""
    return generate_answer(prompt, history=history)