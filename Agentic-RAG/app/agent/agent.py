from app.agent.router import classify_intent
from app.agent.tools import search_products, compare_products, create_order
from app.rag.pipeline import rag_answer

def shopping_agent(user_message: str, customer_info: dict = None):
    """
    Main Agent controller for RAG + Agentic behavior
    Works for all categories in the dataset.
    """
    intent = classify_intent(user_message)

    if intent == "search":
        products = search_products(user_message)
        product_texts = "\n\n".join([p["description"] for p in products])
        return rag_answer(user_message, context=product_texts)

    elif intent == "compare":
        products = search_products(user_message)
        return compare_products(products)

    elif intent == "order":
        products = search_products(user_message)
        if customer_info is None:
            # استخدمي order_flow مباشرة لجمع البيانات خطوة بخطوة
            return order_flow(products[0])
        else:
            return create_order(products[0], customer_info)

    else:
        return "Sorry, I cannot help with that request yet."


from app.agent.memory import init_session, update_session, append_history, get_session

def order_flow(selected_product: dict, user_id: str = "default_user"):
    """
    Multi-step order flow with memory
    """
    init_session(user_id)
    session = get_session(user_id)

    print("Let's complete your order:")

    # حفظ المنتج المختار في memory
    update_session(user_id, "selected_product", selected_product)

    # خطوة 1: الاسم
    name = input("Enter your name: ")
    update_session(user_id, "customer_info", {**session["customer_info"], "name": name})
    append_history(user_id, f"User entered name: {name}")

    # خطوة 2: الهاتف
    phone = input("Enter your phone number: ")
    update_session(user_id, "customer_info", {**get_session(user_id)["customer_info"], "phone": phone})
    append_history(user_id, f"User entered phone: {phone}")

    # خطوة 3: العنوان
    address_input = input("Enter your address or city: ")
    update_session(user_id, "customer_info", {**get_session(user_id)["customer_info"], "customer_address": address_input})
    append_history(user_id, f"User entered address: {address_input}")

    # إنشاء الطلب النهائي
    from app.agent.tools import create_order
    order = create_order(get_session(user_id)["selected_product"], get_session(user_id)["customer_info"])
    append_history(user_id, f"Order created: {order}")

    print("\nOrder Summary:")
    print(order)
    return order