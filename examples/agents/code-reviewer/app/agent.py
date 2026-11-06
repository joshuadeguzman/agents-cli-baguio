import os
import subprocess
from pathlib import Path

from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types


def _repo() -> Path:
    """The git repo to review: REPO_DIR from .env, or the current folder."""
    return Path(os.getenv("REPO_DIR", ".")).resolve()


def get_diff(base: str = "main") -> dict:
    """Get the changes on this branch compared with a base branch.

    Call this first. It returns a unified diff with file names and line
    numbers, which is what you review.

    Args:
        base: The branch to compare against, for example "main".

    Returns:
        A dict with "status" and either "diff" or "error_message".
    """
    result = subprocess.run(
        ["git", "diff", f"{base}...HEAD", "--unified=3"],
        cwd=_repo(), capture_output=True, text=True, timeout=30,
    )
    if result.returncode != 0:
        return {"status": "error", "error_message": result.stderr.strip()}
    return {"status": "success", "diff": result.stdout[:200_000]}


def read_file(path: str) -> dict:
    """Read a whole file from the repository, for context around a change.

    Args:
        path: A path relative to the repository root, for example "lib/main.dart".

    Returns:
        A dict with "status" and either "content" or "error_message".
    """
    repo = _repo()
    file = (repo / path).resolve()
    if repo not in file.parents or not file.is_file():
        return {"status": "error", "error_message": f"No file {path!r} in the repo."}
    return {"status": "success", "content": file.read_text(errors="replace")}


root_agent = Agent(
    name="code_reviewer",
    model=Gemini(model="gemini-3.8-flash", retry_options=types.HttpRetryOptions(attempts=3)),
    instruction=(
        "You review code changes. If the message contains a diff, review it. "
        "Otherwise call get_diff, and read_file when you need context. "
        "Report bugs, security problems and missing tests. For "
        "each finding give the file, the line, a severity (high, medium, low) "
        "and a one-line fix. If there is nothing worth fixing, say so."
    ),
    tools=[get_diff, read_file],
)

app = App(root_agent=root_agent, name="app")
