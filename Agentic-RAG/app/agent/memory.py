# Simple in-memory storage for user sessions
# Keyed by user_id (يمكن استخدام session_id أو اسم المستخدم)

memory_store = {}

def init_session(user_id: str):
    if user_id not in memory_store:
        memory_store[user_id] = {
            "step": 0,
            "selected_product": None,
            "customer_info": {},
            "conversation_history": []
        }

def get_session(user_id: str):
    return memory_store.get(user_id)

def update_session(user_id: str, key: str, value):
    if user_id not in memory_store:
        init_session(user_id)
    memory_store[user_id][key] = value

def append_history(user_id: str, message: str):
    if user_id not in memory_store:
        init_session(user_id)
    memory_store[user_id]["conversation_history"].append(message)