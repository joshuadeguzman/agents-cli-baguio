import os
import subprocess
from pathlib import Path

from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types


def git_log(since: str) -> dict:
    """List the commits since a tag or commit, one per line.

    Call this first to see what changed in the release.

    Args:
        since: A tag or commit, for example "v1.4.0".

    Returns:
        A dict with "status" and either "commits" or "error_message".
    """
    result = subprocess.run(
        ["git", "log", f"{since}..HEAD", "--no-merges", "--pretty=format:%h %s"],
        cwd=Path(os.getenv("REPO_DIR", ".")).resolve(),
        capture_output=True, text=True, timeout=30,
    )
    if result.returncode != 0:
        return {"status": "error", "error_message": result.stderr.strip()}
    return {"status": "success", "commits": result.stdout.splitlines()}


root_agent = Agent(
    name="release_notes_writer",
    model=Gemini(model="gemini-3.8-flash", retry_options=types.HttpRetryOptions(attempts=3)),
    instruction=(
        "You write release notes for app users, not developers. If the message "
        "lists commits, use them. Otherwise call git_log with the tag the user "
        "gives. Group changes into New, Improved and Fixed, one short line each, "
        "most important first. Skip refactors, tests, docs, CI, lint and "
        "dependency bumps. Skip a change and its revert when both are listed. "
        "Describe security fixes without technical detail. If a change drops "
        "support for a device or OS version, end with a 'Heads up' line. "
        "Plain words, no commit hashes or PR numbers, under 1,200 characters."
    ),
    tools=[git_log],
)

app = App(root_agent=root_agent, name="app")
