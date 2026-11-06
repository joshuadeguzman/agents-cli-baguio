"""Offline tests for git_log. No API key needed: uv run pytest tests/unit"""

import subprocess

import pytest

from app.agent import git_log

COMMITS = ["Add dark mode to settings", "Refactor order repository", "Fix wrong total when a coupon is removed"]


def git(repo, *args):
    subprocess.run(["git", *args], cwd=repo, check=True, capture_output=True)


@pytest.fixture
def repo(tmp_path, monkeypatch):
    git(tmp_path, "init", "-q", "-b", "main")
    git(tmp_path, "config", "user.name", "Test")
    git(tmp_path, "config", "user.email", "test@example.com")
    git(tmp_path, "commit", "-q", "--allow-empty", "-m", "Release 1.4.0")
    git(tmp_path, "tag", "v1.4.0")
    for message in COMMITS:
        git(tmp_path, "commit", "-q", "--allow-empty", "-m", message)
    monkeypatch.setenv("REPO_DIR", str(tmp_path))
    return tmp_path


def test_lists_only_commits_after_the_tag(repo):
    out = git_log("v1.4.0")
    assert out["status"] == "success"
    assert [line.split(" ", 1)[1] for line in out["commits"]] == list(reversed(COMMITS))


def test_each_line_starts_with_a_short_hash(repo):
    sha = git_log("v1.4.0")["commits"][0].split(" ")[0]
    assert 7 <= len(sha) <= 12 and all(c in "0123456789abcdef" for c in sha)


def test_unknown_tag_is_an_error(repo):
    out = git_log("v9.9.9")
    assert out["status"] == "error"
    assert out["error_message"]
