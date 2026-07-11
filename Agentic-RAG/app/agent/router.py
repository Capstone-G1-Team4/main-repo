"""
Intent router.

Primary: LLM classification (understands natural language, typos,
paraphrases). Fallback: keyword matching if the LLM is unavailable.

Intents:
- search           -> find products ("I need a phone under 40000")
- compare          -> compare products ("compare A13 vs F42")
- order            -> buy a product ("I want to buy the A13")
- product_question -> ask about a product ("does it have a good camera?")
- support          -> general help ("how does delivery work?")
"""

from typing import Literal

Intent = Literal["search", "compare", "order", "product_question", "support"]

VALID_INTENTS = ("search", "compare", "order", "product_question", "support")

_CLASSIFY_PROMPT = """Classify the customer message from an online shopping chat
into exactly ONE of these intents:

- search: the customer wants to find/see products
- compare: the customer wants to compare two or more products
- order: the customer wants to buy/purchase a product now
- product_question: the customer asks a question about a product's
  specs, features, price, warranty, availability, etc.
- support: general help, complaints, or anything else

Message: "{message}"

Answer with only the intent word, nothing else."""


def _classify_with_llm(user_message: str) -> Intent | None:
    from app.llm import classify_text

    answer = classify_text(_CLASSIFY_PROMPT.format(message=user_message))
    # be tolerant of extra tokens like punctuation
    for intent in VALID_INTENTS:
        if intent in answer:
            return intent
    return None


def _classify_with_keywords(user_message: str) -> Intent:
    msg = user_message.lower()

    compare_keywords = ["compare", " vs ", "versus", "difference", "better than"]
    order_keywords = ["buy", "purchase", "order", "take this", "i'll take", "checkout"]
    question_keywords = [
        "does it", "is it", "how much", "what is", "what's", "which one",
        "battery", "camera", "warranty", "ram", "storage", "screen", "?",
    ]
    search_keywords = ["need", "find", "looking for", "show me", "recommend", "suggest"]
    support_keywords = ["help", "issue", "problem", "support", "complaint", "delivery", "return"]

    if any(k in msg for k in compare_keywords):
        return "compare"
    if any(k in msg for k in order_keywords):
        return "order"
    if any(k in msg for k in search_keywords):
        return "search"
    if any(k in msg for k in question_keywords):
        return "product_question"
    if any(k in msg for k in support_keywords):
        return "support"
    return "search"  # default


def classify_intent(user_message: str) -> Intent:
    """Return the user's intent (LLM first, keywords as fallback)."""
    try:
        intent = _classify_with_llm(user_message)
        if intent is not None:
            return intent
    except Exception:
        # LLM unavailable (no API key, network error...) -> fallback
        pass

    return _classify_with_keywords(user_message)
