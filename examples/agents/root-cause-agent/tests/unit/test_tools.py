"""Offline tests for the log tools. No API key needed: uv run pytest tests/unit"""

from app.agent import find_errors, read_log


def test_find_errors_in_failing_log():
    out = find_errors("order-api.log")
    assert out["status"] == "success"
    assert out["count"] == 15
    assert any("TimeoutError" in line for line in out["lines"])


def test_find_errors_in_healthy_log():
    assert find_errors("order-api-healthy.log")["count"] == 1


def test_read_log_includes_the_bad_setting():
    assert "PAYMENT_TIMEOUT_MS=30" in read_log("order-api.log")["content"]


def test_unknown_log_lists_available_files():
    out = read_log("nope.log")
    assert out["status"] == "error"
    assert "order-api.log" in out["error_message"]


def test_cannot_read_outside_sample_logs():
    assert read_log("../app/agent.py")["status"] == "error"
    assert find_errors("../pyproject.toml")["status"] == "error"
