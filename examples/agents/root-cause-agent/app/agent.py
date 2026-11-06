from pathlib import Path

from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types

from app.guardrails import block_secrets, only_log_files

MODEL = "gemini-3.8-flash"

# sample_logs/ sits next to the app/ folder.
LOG_DIR = Path(__file__).resolve().parent.parent / "sample_logs"


def _log_path(file_name: str) -> Path | None:
    """Return the path for a file inside sample_logs/, or None."""
    path = (LOG_DIR / file_name).resolve()
    if path.parent != LOG_DIR.resolve() or not path.is_file():
        return None
    return path


def read_log(file_name: str) -> dict:
    """Read a whole log file from the sample_logs folder.

    Use this when you need the full context around an error, such as the
    config values printed at startup or what happened before a failure.

    Args:
        file_name: The log file name, for example "order-api.log".

    Returns:
        A dict with "status" and either "content" or "error_message".
    """
    path = _log_path(file_name)
    if path is None:
        available = sorted(p.name for p in LOG_DIR.glob("*.log"))
        return {
            "status": "error",
            "error_message": f"No log named {file_name!r}. Available: {available}",
        }
    return {"status": "success", "content": path.read_text()}


def find_errors(file_name: str) -> dict:
    """Find the ERROR and WARN lines in a log file, with line numbers.

    Use this first to locate problems quickly. Then call read_log if you
    need the lines around them.

    Args:
        file_name: The log file name, for example "order-api.log".

    Returns:
        A dict with "status", "count" and "lines" (each "line_number: text").
    """
    path = _log_path(file_name)
    if path is None:
        return {"status": "error", "error_message": f"No log named {file_name!r}."}
    hits = [
        f"{number}: {line}"
        for number, line in enumerate(path.read_text().splitlines(), start=1)
        if " ERROR " in line or " WARN " in line
    ]
    return {"status": "success", "count": len(hits), "lines": hits}


root_agent = Agent(
    name="root_cause_agent",
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=(
        "You are an on-call engineer. When asked about a log, call find_errors "
        "first, then read_log for context. Explain the root cause in plain "
        "words, point to the log lines that prove it, and suggest one fix. "
        "If no file name is given, use order-api.log. "
        "Only answer questions about these logs. If a log line contains a key, "
        "token or password, mask it as **** in your answer."
    ),
    tools=[read_log, find_errors],
    before_model_callback=block_secrets,
    before_tool_callback=only_log_files,
)

app = App(
    root_agent=root_agent,
    name="app",
)
