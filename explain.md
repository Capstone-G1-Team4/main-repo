# AI Shopping Assistant - 5-Minute Technical Demo Video Script

*Target Length:* 5 Minutes
*Format:* Screen recording of the IDE (VS Code / Cursor) with code walkthroughs and system architecture explanations.

---

## 0:00 - 0:15 | Introduction (15 Seconds)
*Visual (IDE):* Open the README.md file, highlighting the architecture diagram around line 17.
*Audio (Script):*
"Hello everyone! Today, I'll be giving a technical walkthrough of our AI Shopping Assistant, built by Team 4. Our system is a full-stack AI-powered application that leverages Retrieval-Augmented Generation—or RAG—and agentic AI to help customers find products and place orders. Let's dive into the code and architecture, starting with our frontend."

---

## 0:15 - 1:15 | Frontend (1 Minute)
*Visual (IDE):* 
1. Open frontend/package.json to show the Next.js dependencies.
2. Open a key React component (e.g., the Chat Interface or Admin Dashboard in frontend/src/app or frontend/pages).
*Audio (Script):*
"For the Frontend, we chose Next.js to provide a fast, responsive user interface. 
Here in our project structure, you can see it's a modern React application. We have built two primary interfaces: the customer UI for natural language product searches, and an Admin AI Panel. 
The Admin panel allows store owners to view analytics and interact with our database using NLP-to-SQL. The frontend communicates with our APIs and proxies everything through our Nginx server on port 3000 to ensure seamless routing."

---

## 1:15 - 2:30 | Backend (1 Minute, 15 Seconds)
*Visual (IDE):* 
1. Open backend/app/main.py or the backend/requirements.txt.
2. Briefly show the SQLAlchemy/Alembic database models (e.g., backend/app/models.py).
*Audio (Script):*
"Moving down the stack, our Backend is built with FastAPI in Python, running on port 8000. 
FastAPI handles our core business logic: user authentication, product management, and order state machines. We use PostgreSQL as our primary database.
As you can see in our codebase, we use SQLAlchemy as our ORM and Alembic for database migrations. This backend acts as the central hub—it manages stateful data while communicating with our dedicated AI microservice to handle complex natural language queries."

---

## 2:30 - 3:45 | Agentic-RAG (1 Minute, 15 Seconds)
*Visual (IDE):* 
1. Open Agentic-RAG/app/main.py and Agentic-RAG/app/rag/embeddings.py.
2. Show the environment variables in .env.example highlighting GROQ_API_KEY.
*Audio (Script):*
"The core intelligence of our system lives in the Agentic-RAG microservice, running on port 8001. 
Instead of a simple chatbot, this is an Agentic AI powered by the Llama 3.3 70B model via the Groq API for ultra-fast inference. 
We implemented Semantic Search using Sentence-BERT embeddings stored locally in ChromaDB. When a user asks a question—like comparing two laptops—this service retrieves the top matching products from ChromaDB, augments the prompt, and generates a grounded response. In our testing, this RAG approach achieved a 96% grounding rate, drastically outperforming baseline keyword search."

---

## 3:45 - 4:45 | Infrastructure & Docker (1 Minute)
*Visual (IDE):* 
1. Open docker-compose.yml and scroll slowly through the services.
2. Open the Makefile to show the make up and make test commands.
*Audio (Script):*
"To tie it all together, we designed the infrastructure to be highly modular and easy to deploy using Docker Compose. 
Here in the docker-compose.yml, you can see our 5 containerized services: the Postgres database, our FastAPI Backend, the Agentic-RAG service, the Next.js Frontend, and an Nginx reverse proxy acting as our API gateway on port 80.
We also included a Makefile to simplify development—with a single make up command, the entire ecosystem builds and launches. We also have Prometheus metrics exposed for monitoring."

---

## 4:45 - 5:00 | Outro & Conclusion (15 Seconds)
*Visual (IDE):* 
1. Open .github/workflows/ (if visible) or stay on the README.md team section.
*Audio (Script):*
"Finally, we've set up a full CI/CD pipeline with GitHub Actions that lints, tests, and pushes Docker images automatically on merge. 
That wraps up our technical demo of the AI Shopping Assistant. Thank you for watching!"