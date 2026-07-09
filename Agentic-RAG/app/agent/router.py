from typing import Literal

def classify_intent(user_message: str) -> Literal["search", "compare", "order", "support"]:
    """
    Returns the user's intent.
    """
    msg = user_message.lower()

    # Keywords for each intent
    search_keywords = ["need", "find", "looking for", "show me"]
    compare_keywords = ["compare", "vs", "difference"]
    order_keywords = ["buy", "purchase", "take this", "get"]
    support_keywords = ["help", "question", "issue", "support"]

    if any(k in msg for k in search_keywords):
        return "search"
    elif any(k in msg for k in compare_keywords):
        return "compare"
    elif any(k in msg for k in order_keywords):
        return "order"
    elif any(k in msg for k in support_keywords):
        return "support"
    else:
        return "search"  # default