"""
Final end-to-end test: search -> question -> compare -> order -> memory check.
"""

from app.agent.agent import shopping_agent
from app.agent.memory import get_history, get_session

user_id = "test_final"

print("----- SEARCH -----")
print(shopping_agent("I need a Samsung phone under 40000 with good battery", user_id)["response"])

print("\n----- COMPARE -----")
print(shopping_agent("Compare Samsung A13 and Samsung F42", user_id)["response"])

print("\n----- ORDER FLOW (conversational) -----")
for message in ["I want to buy Samsung A13", "yes", "Shahd", "079xxxxxxx", "Amman, Jordan", "yes"]:
    result = shopping_agent(message, user_id=user_id)
    print(f"\nUSER: {message}")
    print(f"AGENT: {result['response']}")

print("\n----- MEMORY CHECK -----")
session = get_session(user_id)
print("Orders placed:", session["orders"])
print("Messages stored:", len(get_history(user_id, limit=1000)))
