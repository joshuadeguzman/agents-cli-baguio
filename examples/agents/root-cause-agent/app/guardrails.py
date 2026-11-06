"""Guardrails: checks that run before the model and before each tool, in plain Python."""

import re

from google.adk.models import LlmResponse
from google.genai import types

# Shapes of common secrets: Google API keys, private key blocks, password=... pairs.
SECRET = re.compile(r"AIza[0-9A-Za-z_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY|password\s*[=:]\s*\S+", re.I)


def block_secrets(callback_context, llm_request):
    """Before the model: if the user's message contains a secret, answer without calling Gemini."""
    last = llm_request.contents[-1] if llm_request.contents else None
    if last is None or last.role != "user":
        return None
    text = " ".join(part.text or "" for part in last.parts or [])
    if SECRET.search(text):
        return LlmResponse(content=types.Content(role="model", parts=[types.Part(
            text="Your message looks like it contains a secret, so I didn't send it to the model. "
                 "Remove the key or password and ask again.")]))
    return None


def only_log_files(tool, args, tool_context):
    """Before each tool: allow only .log file names. Returning a dict skips the tool."""
    name = str(args.get("file_name", ""))
    if not name.endswith(".log") or "/" in name or "\\" in name:
        return {"status": "error", "error_message": f"{name!r} is not a log file name. Use a name like order-api.log."}
    return None
