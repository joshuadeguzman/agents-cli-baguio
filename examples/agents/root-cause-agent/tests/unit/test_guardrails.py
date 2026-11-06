"""Offline tests for the guardrails. No API key needed: uv run pytest tests/unit"""

from google.adk.models import LlmRequest
from google.genai import types

from app.guardrails import block_secrets, only_log_files


def request(text: str) -> LlmRequest:
    return LlmRequest(contents=[types.Content(role="user", parts=[types.Part(text=text)])])


def test_blocks_a_pasted_api_key():
    out = block_secrets(None, request("Why does AIza" + "x" * 35 + " fail?"))
    assert out is not None
    assert "secret" in out.content.parts[0].text


def test_blocks_a_password():
    assert block_secrets(None, request("login failed, password=hunter2")) is not None


def test_lets_a_normal_question_through():
    assert block_secrets(None, request("What went wrong in order-api.log?")) is None


def test_tool_guard_allows_log_files():
    assert only_log_files(None, {"file_name": "order-api.log"}, None) is None


def test_tool_guard_blocks_other_files():
    for name in ["../.env", "agent.py", "sub/dir.log"]:
        out = only_log_files(None, {"file_name": name}, None)
        assert out["status"] == "error"
