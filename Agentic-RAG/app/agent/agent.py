"""
Main agent controller: RAG + agentic behavior for the shopping assistant.

Design (API-friendly, no input() calls):
- Every call to shopping_agent() handles ONE user message and returns
  a response. Multi-step flows (like placing an order) are driven by
  a step state machine persisted in SQLite (app.agent.memory), so the
  conversation survives page reloads and server restarts.
- Chat history is persisted per session_id and passed to the LLM,
  so the customer can ask free-form follow-up questions about products
  ("does it have a good camera?") — not just the static order process.
"""

from app.agent.memory import (
    append_history,
    get_history_for_llm,
    get_session,
    init_session,
    reset_order_state,
    update_session,
)
from app.agent.router import classify_intent
from app.agent.tools import (
    compare_products,
    create_order,
    search_products,
    search_products_detailed,
)
from app.rag.pipeline import rag_answer

# Steps of the order flow state machine
ORDER_STEPS = ("confirm_product", "ask_name", "ask_phone", "ask_address", "confirm_order")

YES_WORDS = ("yes", "y", "yeah", "yep", "sure", "ok", "okay", "confirm", "correct", "نعم", "اه", "ايوه")
CANCEL_WORDS = ("cancel", "stop", "quit", "never mind", "nevermind", "الغاء", "إلغاء")


def shopping_agent(user_message: str, user_id: str = "default_user") -> dict:
    """
    Handle one user message for the given session.

    Returns: {"response": str, "intent": str, "order": dict | None}
    (order is filled only when an order was just completed.)
    """
    init_session(user_id)
    session = get_session(user_id)

    result_order = None

    try:
        if session["step"] in ORDER_STEPS:
            response, result_order = _handle_order_step(user_message, user_id, session)
            intent = "order"
        else:
            intent = classify_intent(user_message)
            response = _handle_intent(intent, user_message, user_id, session)
    except RuntimeError as e:
        # friendly setup errors (missing vector store, missing API key...)
        intent = "error"
        response = f"Sorry, I ran into a setup problem: {e}"
    except Exception as e:
        intent = "error"
        response = f"Sorry, something went wrong while processing your request. ({e})"

    # persist the exchange AFTER handling, so the LLM history passed
    # during handling contains only previous turns.
    append_history(user_id, "user", user_message)
    append_history(user_id, "assistant", response)

    return {"response": response, "intent": intent, "order": result_order}


# ---------------------------------------------------------------------------
# Intent handling (normal browsing mode)
# ---------------------------------------------------------------------------

def _handle_intent(intent: str, user_message: str, user_id: str, session: dict) -> str:
    history = get_history_for_llm(user_id)

    if intent == "search":
        result = search_products_detailed(user_message)
        products = result["products"]
        if not products:
            return "I couldn't find any matching products. Could you describe what you're looking for differently?"
        update_session(user_id, "last_products", products)
        context = "\n\n".join(p["description"] for p in products)

        if result["specific"]:
            # the customer asked for ONE exact product -> present it alone
            question = (
                "The customer asked about this specific product. Present ONLY "
                "this product: its price, rating and key specs. If several "
                "variants (color/storage) are in the context, list them with "
                "their prices. Do NOT suggest other products.\n\n"
                f"Customer message: {user_message}"
            )
            return rag_answer(question, context=context, history=history)

        return rag_answer(user_message, context=context, history=history)

    if intent == "compare":
        products = search_products(user_message)
        update_session(user_id, "last_products", products)
        return compare_products(products)

    if intent == "product_question":
        return _answer_product_question(user_message, user_id, session, history)

    if intent == "order":
        return _start_order(user_message, user_id, session)

    # support / anything else
    prompt = f"""The customer needs general help (not a product search).
Answer politely and briefly. If it is about orders, explain they can say
"I want to buy <product>" to start an order, ask product questions, or
ask to compare products. If you don't know something, say so.

Customer message: {user_message}"""
    return rag_answer(prompt, context="(no product context needed)", history=history)


def _answer_product_question(user_message: str, user_id: str, session: dict, history: list) -> str:
    """
    Free-form Q&A about products.

    If the question names a specific product ("does the iphone 12 mini
    have 5G?"), the context contains ONLY that product — this prevents
    wrong answers caused by mixing in unrelated products. Otherwise the
    context combines the selected product, the last search results, and
    a fresh retrieval.
    """
    focused = (
        "Answer the customer's question using ONLY the product information "
        "provided. If the context contains several products, answer about "
        "the one the customer is asking about. If the information needed "
        "is not in the context, say so honestly.\n\n"
        f"Customer question: {user_message}"
    )

    # 1) question about one specific, named product -> focused context
    try:
        result = search_products_detailed(user_message, limit=4)
        if result["specific"]:
            update_session(user_id, "last_products", result["products"])
            context = "\n\n".join(p["description"] for p in result["products"])
            return rag_answer(focused, context=context, history=history)
        fresh = result["products"][:3]
    except RuntimeError:
        fresh = []  # vector store missing but we may still have session products

    # 2) otherwise: selected product + last shown products + fresh retrieval
    context_products = []

    if session.get("selected_product"):
        context_products.append(session["selected_product"])

    for p in (session.get("last_products") or []):
        if p not in context_products:
            context_products.append(p)

    for p in fresh:
        if p["name"] not in [c.get("name") for c in context_products]:
            context_products.append(p)

    if not context_products:
        return (
            "I don't have a product in mind yet — tell me what you're "
            "looking for first (e.g. 'I need a Samsung phone under 40000')."
        )

    context = "\n\n".join(p.get("description", "") for p in context_products[:6])
    return rag_answer(focused, context=context, history=history)


# ---------------------------------------------------------------------------
# Order flow state machine
# ---------------------------------------------------------------------------

def _start_order(user_message: str, user_id: str, session: dict) -> str:
    """Pick the product to order and ask for confirmation."""
    products = search_products(user_message)

    # Prefer a product from the last search if the message matches one
    last = session.get("last_products") or []
    msg = user_message.lower()
    selected = next((p for p in last if p.get("name", "").lower() in msg), None)

    if selected is None:
        if not products:
            return "I couldn't find that product. Could you tell me exactly which product you'd like to buy?"
        selected = products[0]

    update_session(user_id, "selected_product", selected)
    update_session(user_id, "customer_info", {})
    update_session(user_id, "step", "confirm_product")

    return (
        f"You'd like to order **{selected['name']}** "
        f"(price: {selected.get('price', 'N/A')}, rating: {selected.get('rating', 'N/A')}). "
        "Shall I proceed with this order? (yes / no)\n\n"
        "You can also ask me anything about this product first."
    )


def _handle_order_step(user_message: str, user_id: str, session: dict):
    """
    Advance the order flow by one step.
    Returns (response, completed_order_or_None).
    """
    msg = user_message.strip().lower()
    step = session["step"]

    # 1) cancellation works at any step
    if any(w in msg for w in CANCEL_WORDS):
        reset_order_state(user_id)
        return ("No problem, I've cancelled the order. How else can I help you?", None)

    # 2) mid-flow product questions are allowed ("does it have 5G?")
    if "?" in user_message and step in ("confirm_product", "confirm_order"):
        history = get_history_for_llm(user_id)
        answer = _answer_product_question(user_message, user_id, session, history)
        return (f"{answer}\n\n{_step_prompt(step, session)}", None)

    if step == "confirm_product":
        if _is_yes(msg):
            update_session(user_id, "step", "ask_name")
            return ("Great! Let's complete your order. What's your full name?", None)
        reset_order_state(user_id)
        return ("Okay, I won't order that. Tell me what you'd like instead, or ask me to search again.", None)

    if step == "ask_name":
        info = {**session["customer_info"], "name": user_message.strip()}
        update_session(user_id, "customer_info", info)
        update_session(user_id, "step", "ask_phone")
        return (f"Thanks, {user_message.strip()}! What's your phone number?", None)

    if step == "ask_phone":
        info = {**session["customer_info"], "phone": user_message.strip()}
        update_session(user_id, "customer_info", info)
        update_session(user_id, "step", "ask_address")
        return ("Got it. What's your delivery address or city? (You can also paste a Google Maps link.)", None)

    if step == "ask_address":
        info = {**session["customer_info"], **_resolve_address(user_message.strip())}
        update_session(user_id, "customer_info", info)
        update_session(user_id, "step", "confirm_order")

        product = session["selected_product"] or {}
        summary = (
            "Here's your order summary:\n"
            f"- Product: {product.get('name')}\n"
            f"- Price: {product.get('price')}\n"
            f"- Name: {info.get('name')}\n"
            f"- Phone: {info.get('phone')}\n"
            f"- Address: {info.get('customer_address')}\n\n"
            "Confirm the order? (yes / no)"
        )
        return (summary, None)

    if step == "confirm_order":
        if _is_yes(msg):
            order = create_order(session["selected_product"], session["customer_info"])

            orders = session.get("orders") or []
            orders.append(order)
            update_session(user_id, "orders", orders)
            reset_order_state(user_id)

            return (
                f"Your order is confirmed! 🎉\n"
                f"- Order ID: {order['order_id']}\n"
                f"- Product: {order['product']}\n"
                f"- Price: {order['price']}\n"
                f"- Delivery to: {order['customer_address']}\n\n"
                "Is there anything else I can help you with?",
                order,
            )
        reset_order_state(user_id)
        return ("Order cancelled. Let me know if you'd like anything else!", None)

    # unknown step -> reset defensively
    reset_order_state(user_id)
    return ("Let's start over — what would you like to do?", None)


def _step_prompt(step: str, session: dict) -> str:
    """Re-ask the current step's question (after a mid-flow Q&A detour)."""
    product = (session.get("selected_product") or {}).get("name", "the product")
    prompts = {
        "confirm_product": f"So, shall I proceed with ordering {product}? (yes / no)",
        "ask_name": "What's your full name?",
        "ask_phone": "What's your phone number?",
        "ask_address": "What's your delivery address or city?",
        "confirm_order": "Do you confirm the order? (yes / no)",
    }
    return prompts.get(step, "What would you like to do?")


def _is_yes(msg: str) -> bool:
    return any(msg.startswith(w) or msg == w for w in YES_WORDS)


def _resolve_address(address_input: str) -> dict:
    """
    Turn the customer's address text (or Google Maps link) into a
    structured address using the Maps tool. Falls back to the raw
    text if the API key is missing or geocoding fails.
    """
    result = {"customer_address": address_input}

    try:
        from app.agent.maps_tool import extract_place_id, geocode_address

        query = address_input
        if "google" in address_input and "maps" in address_input:
            place = extract_place_id(address_input)
            if place:
                query = place

        geo = geocode_address(query)
        if geo and "error" not in geo:
            result["customer_address"] = geo["formatted_address"]
            result["lat"] = geo["lat"]
            result["lng"] = geo["lng"]
    except Exception:
        pass  # keep the raw address

    return result
