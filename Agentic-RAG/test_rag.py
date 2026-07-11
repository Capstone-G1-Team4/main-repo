from app.rag.pipeline import rag_answer

question = "I need a Samsung phone under 40000 with good battery."

# context is now optional: it is retrieved automatically from the vector store
answer = rag_answer(question)

print(answer)
