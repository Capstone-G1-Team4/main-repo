"""
Test that the order flow state and chat history persist in SQLite.
"""

from app.agent.agent import shopping_agent
from app.agent.memory import get_history, get_session

user_id = "test_user_memory"

# simulate an order conversation, one message at a time
for message in ["I want to buy a Samsung phone", "yes", "Shahd", "079xxxxxxx", "Amman, Jordan", "yes"]:
    result = shopping_agent(message, user_id=user_id)
    print(f"\nUSER: {message}")
    print(f"AGENT: {result['response']}")

# verify persistence
print("\n----- SESSION (from SQLite) -----")
print(get_session(user_id))

print("\n----- HISTORY (from SQLite) -----")
for m in get_history(user_id):
    print(f"[{m['role']}] {m['content'][:80]}")
