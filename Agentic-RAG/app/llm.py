from dotenv import load_dotenv
import os
from openai import OpenAI


load_dotenv()


client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY")
)


def generate_answer(prompt: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": """
You are an AI shopping assistant.
Answer customers using only the provided product information.
Do not invent products or specifications.
"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1
    )

    return response.choices[0].message.content
