"""
Demo of the conversational agent: search, Q&A, compare, and a full
step-by-step order — all through one session with persistent memory.

Requires: vector store built + GROQ_API_KEY in .env
"""

import uuid

from app.agent.agent import shopping_agent

session_id = f"demo_{uuid.uuid4().hex[:6]}"


def say(message: str):
    print(f"\nUSER: {message}")
    result = shopping_agent(message, user_id=session_id)
    print(f"AGENT [{result['intent']}]: {result['response']}")
    return result


# 1) search
say("I need a Samsung phone under 40000 with good battery")

# 2) free-form product question (new feature)
say("Which of these has the best camera?")

# 3) compare
say("Compare Samsung A13 and Samsung F42")

# 4) full order conversation (step by step, no input() needed)
say("I want to buy Samsung A13")
say("yes")
say("Shahd")
say("079xxxxxxx")
result = say("Amman, Jordan")
result = say("yes")

if result["order"]:
    print("\nCompleted order:", result["order"])
