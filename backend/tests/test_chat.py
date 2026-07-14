"""Chat proxy tests with a stubbed AI service: replies, tool actions, failures, access."""

import pytest
from httpx import AsyncClient

from app.core.exceptions import AIServiceUnavailableError
from app.schemas.chat import AIChatRequest, AIChatResponse, AIToolAction
from app.services import chat_service

CONVERSATIONS = "/api/v1/chat/conversations"


class StubAIClient:
    def __init__(self, response: AIChatResponse | Exception) -> None:
        self.response = response
        self.requests: list[AIChatRequest] = []

    async def chat(self, request: AIChatRequest) -> AIChatResponse:
        self.requests.append(request)
        if isinstance(self.response, Exception):
            raise self.response
        return self.response


@pytest.fixture
def stub_ai(monkeypatch: pytest.MonkeyPatch):
    def _install(response: AIChatResponse | Exception) -> StubAIClient:
        stub = StubAIClient(response)
        monkeypatch.setattr(chat_service, "get_ai_client", lambda: stub)
        return stub

    return _install


async def test_guest_conversation_flow_with_reply(client: AsyncClient, stub_ai) -> None:
    stub = stub_ai(
        AIChatResponse(reply="Hello! How can I help?", metadata={"recommended_product_ids": []})
    )
    conv = (await client.post(CONVERSATIONS)).json()
    assert conv["user_id"] is None
    token = conv["session_token"]

    resp = await client.post(
        f"{CONVERSATIONS}/{conv['id']}/messages",
        json={"content": "hi"},
        headers={"X-Session-Token": token},
    )
    assert resp.status_code == 200, resp.text
    messages = resp.json()["messages"]
    assert [m["role"] for m in messages] == ["user", "assistant"]
    assert messages[1]["content"] == "Hello! How can I help?"

    # AI request carried the history and a guest context
    assert stub.requests[0].user_context.authenticated is False
    assert stub.requests[0].messages[-1].content == "hi"

    history = await client.get(
        f"{CONVERSATIONS}/{conv['id']}/messages", headers={"X-Session-Token": token}
    )
    assert len(history.json()) == 2


async def test_guest_needs_valid_session_token(client: AsyncClient, stub_ai) -> None:
    stub_ai(AIChatResponse(reply="x"))
    conv = (await client.post(CONVERSATIONS)).json()
    resp = await client.post(
        f"{CONVERSATIONS}/{conv['id']}/messages",
        json={"content": "hi"},
        headers={"X-Session-Token": "wrong"},
    )
    assert resp.status_code == 403


async def test_user_cannot_access_other_users_conversation(
    client: AsyncClient, customer: dict, stub_ai
) -> None:
    stub_ai(AIChatResponse(reply="x"))
    conv = (await client.post(CONVERSATIONS, headers=customer["headers"])).json()
    assert conv["user_id"] is not None

    resp = await client.get(f"{CONVERSATIONS}/{conv['id']}/messages")
    assert resp.status_code == 403

    resp = await client.get(f"{CONVERSATIONS}/{conv['id']}/messages", headers=customer["headers"])
    assert resp.status_code == 200


async def test_create_order_tool_action_executes(
    client: AsyncClient, customer: dict, product_factory, stub_ai
) -> None:
    product = await product_factory(price="10.00", stock_quantity=5)
    stub_ai(
        AIChatResponse(
            reply="Order placed!",
            actions=[
                AIToolAction(
                    action="create_order",
                    payload={"items": [{"product_id": product["id"], "quantity": 2}]},
                )
            ],
        )
    )
    conv = (await client.post(CONVERSATIONS, headers=customer["headers"])).json()
    resp = await client.post(
        f"{CONVERSATIONS}/{conv['id']}/messages",
        json={"content": "buy 2 please"},
        headers=customer["headers"],
    )
    assert resp.status_code == 200, resp.text
    messages = resp.json()["messages"]
    assert [m["role"] for m in messages] == ["user", "tool", "assistant"]
    tool_result = messages[1]["metadata"]
    assert tool_result["ok"] is True and tool_result["action"] == "create_order"

    # order really exists and stock was decremented
    order = await client.get(
        f"/api/v1/orders/{tool_result['order_id']}", headers=customer["headers"]
    )
    assert order.status_code == 200
    assert order.json()["conversation_id"] == conv["id"]
    stock = (await client.get(f"/api/v1/products/{product['id']}")).json()["stock_quantity"]
    assert stock == 3


async def test_failed_tool_action_becomes_structured_result(
    client: AsyncClient, customer: dict, product_factory, stub_ai
) -> None:
    product = await product_factory(stock_quantity=1)
    stub_ai(
        AIChatResponse(
            reply="Trying...",
            actions=[
                AIToolAction(
                    action="create_order",
                    payload={"items": [{"product_id": product["id"], "quantity": 99}]},
                )
            ],
        )
    )
    conv = (await client.post(CONVERSATIONS, headers=customer["headers"])).json()
    resp = await client.post(
        f"{CONVERSATIONS}/{conv['id']}/messages",
        json={"content": "buy 99"},
        headers=customer["headers"],
    )
    assert resp.status_code == 200
    tool_result = resp.json()["messages"][1]["metadata"]
    assert tool_result["ok"] is False
    assert tool_result["code"] == "out_of_stock"


async def test_resolve_location_tool_action(client: AsyncClient, stub_ai) -> None:
    stub_ai(
        AIChatResponse(
            actions=[
                AIToolAction(
                    action="resolve_location",
                    payload={"maps_url": "https://www.google.com/maps/@31.95,35.91,15z"},
                )
            ]
        )
    )
    conv = (await client.post(CONVERSATIONS)).json()
    resp = await client.post(
        f"{CONVERSATIONS}/{conv['id']}/messages",
        json={"content": "here is my location"},
        headers={"X-Session-Token": conv["session_token"]},
    )
    assert resp.status_code == 200
    tool_result = resp.json()["messages"][1]["metadata"]
    assert tool_result["ok"] is True
    assert tool_result["location"]["is_within_delivery_area"] is True


async def test_ai_service_down_returns_502_and_keeps_user_message(
    client: AsyncClient, stub_ai
) -> None:
    stub_ai(AIServiceUnavailableError("AI service is unreachable, please try again later"))
    conv = (await client.post(CONVERSATIONS)).json()
    token = conv["session_token"]
    resp = await client.post(
        f"{CONVERSATIONS}/{conv['id']}/messages",
        json={"content": "hello?"},
        headers={"X-Session-Token": token},
    )
    assert resp.status_code == 502
    assert resp.json()["code"] == "ai_service_unavailable"

    history = (
        await client.get(
            f"{CONVERSATIONS}/{conv['id']}/messages", headers={"X-Session-Token": token}
        )
    ).json()
    assert len(history) == 1 and history[0]["role"] == "user"
