"""Admin analytics: store-wide summary numbers computed from orders, users, and chats."""

from decimal import Decimal

from sqlalchemy import func, select, case, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.conversation import Conversation
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.user import User

_TOP_PRODUCTS_LIMIT = 10


async def summary(db: AsyncSession) -> dict:
    # --- counts ---
    orders_total = await db.scalar(select(func.count()).select_from(Order)) or 0
    users_total = await db.scalar(select(func.count()).select_from(User)) or 0
    conversations_total = await db.scalar(select(func.count()).select_from(Conversation)) or 0
    products_total = await db.scalar(select(func.count()).select_from(Product)) or 0
    categories_total = await db.scalar(select(func.count()).select_from(Category)) or 0

    # --- financials ---
    revenue = await db.scalar(
        select(func.coalesce(func.sum(Order.total), 0)).where(
            Order.status != OrderStatus.cancelled
        )
    )
    avg_order_value = await db.scalar(
        select(func.coalesce(func.avg(Order.total), 0)).where(
            Order.status != OrderStatus.cancelled
        )
    )

    # --- orders by status ---
    status_rows = (
        await db.execute(select(Order.status, func.count()).group_by(Order.status))
    ).all()
    orders_by_status = {status.value: count for status, count in status_rows}

    # --- orders by payment method ---
    payment_rows = (
        await db.execute(
            select(Order.payment_method, func.count()).group_by(Order.payment_method)
        )
    ).all()
    orders_by_payment = {method.value: count for method, count in payment_rows}

    # --- products by category ---
    category_rows = (
        await db.execute(
            select(Category.name, func.count(Product.id))
            .outerjoin(Product, Product.category_id == Category.id)
            .group_by(Category.name)
        )
    ).all()
    products_by_category = {name: count for name, count in category_rows}

    # --- top selling products ---
    top_rows = (
        await db.execute(
            select(
                OrderItem.product_id,
                Product.name,
                func.sum(OrderItem.quantity).label("quantity_sold"),
                func.sum(OrderItem.line_total).label("revenue"),
            )
            .join(Product, OrderItem.product_id == Product.id)
            .join(Order, OrderItem.order_id == Order.id)
            .where(Order.status != OrderStatus.cancelled)
            .group_by(OrderItem.product_id, Product.name)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(_TOP_PRODUCTS_LIMIT)
        )
    ).all()

    top_products = [
        {
            "product_id": str(product_id),
            "name": name,
            "quantity_sold": int(quantity),
            "revenue": str(Decimal(revenue_val or 0)),
        }
        for product_id, name, quantity, revenue_val in top_rows
    ]

    # --- revenue over time (last 30 days) ---
    revenue_rows = (
        await db.execute(
            select(
                func.date(Order.created_at).label("day"),
                func.coalesce(func.sum(Order.total), 0).label("revenue"),
                func.count(Order.id).label("order_count"),
            )
            .where(Order.status != OrderStatus.cancelled)
            .where(Order.created_at >= func.now() - text("interval '30 days'"))
            .group_by(func.date(Order.created_at))
            .order_by(func.date(Order.created_at))
        )
    ).all()
    revenue_over_time = [
        {"date": str(day), "revenue": str(Decimal(rev or 0)), "orders": count}
        for day, rev, count in revenue_rows
    ]

    # --- active vs inactive users ---
    active_users = await db.scalar(
        select(func.count()).select_from(User).where(User.is_active == True)
    ) or 0
    inactive_users = users_total - active_users

    # --- recent orders ---
    recent_orders_rows = (
        await db.execute(
            select(Order)
            .order_by(Order.created_at.desc())
            .limit(5)
        )
    ).scalars().all()

    recent_orders = [
        {
            "id": str(o.id),
            "customer_name": o.customer_name,
            "total": str(Decimal(o.total)),
            "status": o.status.value,
            "created_at": o.created_at.isoformat() if o.created_at else None,
        }
        for o in recent_orders_rows
    ]

    return {
        "orders_total": orders_total,
        "revenue": str(Decimal(revenue or 0)),
        "avg_order_value": str(Decimal(avg_order_value or 0)),
        "users_total": users_total,
        "active_users": active_users,
        "inactive_users": inactive_users,
        "conversations_total": conversations_total,
        "products_total": products_total,
        "categories_total": categories_total,
        "orders_by_status": orders_by_status,
        "orders_by_payment": orders_by_payment,
        "products_by_category": products_by_category,
        "top_products": top_products,
        "revenue_over_time": revenue_over_time,
        "recent_orders": recent_orders,
    }


# --- Database schema for NLP-to-SQL ---

DB_SCHEMA = """
Table "users":
  id UUID (PK), email VARCHAR(255), full_name VARCHAR(255), phone VARCHAR(32),
  role VARCHAR (admin/customer), is_active BOOLEAN, created_at TIMESTAMPTZ

Table "products":
  id UUID (PK), name VARCHAR(255), slug VARCHAR(280), description TEXT,
  price NUMERIC(10,2), currency VARCHAR(3), stock_quantity INT, is_available BOOLEAN,
  category_id INT (FK->categories.id), brand VARCHAR(120), sku VARCHAR(64),
  created_at TIMESTAMPTZ

Table "categories":
  id INT (PK), name VARCHAR(100), slug VARCHAR(120), description TEXT

Table "orders":
  id UUID (PK), user_id UUID (FK->users.id), status VARCHAR (pending/confirmed/preparing/out_for_delivery/delivered/cancelled),
  customer_name VARCHAR(255), customer_phone VARCHAR(32),
  payment_method VARCHAR (cash_on_delivery/card/wallet),
  subtotal NUMERIC(10,2), delivery_fee NUMERIC(10,2), total NUMERIC(10,2),
  notes TEXT, created_at TIMESTAMPTZ

Table "order_items":
  id INT (PK), order_id UUID (FK->orders.id), product_id UUID (FK->products.id),
  quantity INT, unit_price NUMERIC(10,2), line_total NUMERIC(10,2)

Table "conversations":
  id UUID (PK), user_id UUID (FK->users.id), status VARCHAR (active/closed),
  session_token VARCHAR, created_at TIMESTAMPTZ

Table "chat_messages":
  id INT (PK), conversation_id UUID (FK->conversations.id),
  role VARCHAR (user/assistant/tool), content TEXT, metadata JSONB,
  created_at TIMESTAMPTZ
"""


# ---------------------------------------------------------------------------
# In-memory conversation history for NLP-to-SQL (keyed by admin user id)
# ---------------------------------------------------------------------------

_nlp_history: dict[str, list[dict]] = {}  # user_id -> [{question, sql, answer}]
MAX_HISTORY = 10  # keep last N exchanges for context


def get_nlp_history(user_id: str) -> list[dict]:
    return _nlp_history.get(user_id, [])


def append_nlp_history(user_id: str, question: str, sql: str, answer: str) -> None:
    if user_id not in _nlp_history:
        _nlp_history[user_id] = []
    _nlp_history[user_id].append({"question": question, "sql": sql, "answer": answer})
    # trim to keep context window manageable
    _nlp_history[user_id] = _nlp_history[user_id][-MAX_HISTORY:]


def clear_nlp_history(user_id: str) -> None:
    _nlp_history.pop(user_id, None)


# ---------------------------------------------------------------------------


async def execute_nlp_query(db: AsyncSession, question: str, llm_fn, user_id: str = "default") -> dict:
    """
    NLP-to-SQL with conversation memory: take a natural language question,
    generate SQL via the LLM (considering prior Q&A context), execute it,
    and return a natural-language answer along with the result.
    """
    history = get_nlp_history(user_id)
    history_block = ""
    if history:
        turns = "\n".join(
            f"- Q: {h['question']}\n  SQL: {h['sql']}\n  A: {h['answer']}"
            for h in history
        )
        history_block = f"\n\nPrevious conversation (for context — the user may be referring back to these):\n{turns}\n"

    sql_system_prompt = f"""You are a PostgreSQL SQL expert. Given the database schema below,
write a safe SELECT-only SQL query to answer the user's question.
Return ONLY the SQL query, nothing else. No explanations, no markdown.

Rules:
- Use only SELECT statements (no INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE)
- Use proper PostgreSQL syntax
- Use JOINs when needed
- Use aggregate functions (COUNT, SUM, AVG, MAX, MIN) when appropriate
- Use ILIKE for case-insensitive text matching
- Always use table aliases for clarity
- For dates, use PostgreSQL date functions
- If the question is a follow-up (e.g. "what about laptops?", "and for phones?"),
  resolve the implied context from the conversation history above.

Database Schema:
{DB_SCHEMA}
{history_block}
"""
    sql_query = ""
    try:
        sql_query = llm_fn(question, sql_system_prompt)
        sql_query = sql_query.strip().strip("```sql").strip("```").strip()

        # safety check
        upper = sql_query.upper().strip()
        if not upper.startswith("SELECT"):
            return {
                "success": False,
                "question": question,
                "sql": sql_query,
                "answer": "Only SELECT queries are allowed.",
                "error": "Only SELECT queries are allowed.",
                "result": None,
                "columns": None,
            }

        result = await db.execute(text(sql_query))
        rows = result.all()
        columns = list(result.keys()) if rows else []

        data = []
        for row in rows[:100]:  # limit to 100 rows
            data.append({col: str(val) if val is not None else None for col, val in zip(columns, row)})

        # --- Generate a natural-language answer from the result ---
        answer = ""
        history_summary = ""
        if history:
            last = history[-1]
            history_summary = f"\nPrevious question was: \"{last['question']}\" → {last['answer']}\n"

        answer_prompt = f"""You are a helpful data analyst. The user asked a question about their store database.
Below is the SQL query that was run and its results. Write a clear, concise answer in natural English.
Do NOT show SQL. Do NOT use technical jargon. Be friendly and direct.
If the result is a single number, state it plainly. If it's a list, summarize the key points.
If there are no results, say so politely.
If this is a follow-up question, reference the previous context naturally.
{history_summary}
User question: {question}

SQL executed:
{sql_query}

Query results (columns: {columns}):
{data[:20]}
"""
        try:
            answer = llm_fn(answer_prompt, "You are a friendly data analyst. Answer in plain English. Be concise — 1-3 sentences max.")
            answer = answer.strip().strip('"').strip("'")
        except Exception:
            # If the second LLM call fails, fall back to a simple summary
            if len(data) == 1 and len(columns) == 1:
                val = list(data[0].values())[0]
                answer = f"The answer is **{val}**."
            elif len(data) == 0:
                answer = "No results found for your question."
            else:
                answer = f"Found {len(data)} result(s). See the table below for details."

        # Store in conversation history
        append_nlp_history(user_id, question, sql_query, answer)

        return {
            "success": True,
            "question": question,
            "sql": sql_query,
            "answer": answer,
            "columns": columns,
            "result": data,
            "row_count": len(data),
        }

    except Exception as e:
        return {
            "success": False,
            "question": question,
            "sql": sql_query,
            "answer": "",
            "error": str(e),
            "result": None,
            "columns": None,
        }
