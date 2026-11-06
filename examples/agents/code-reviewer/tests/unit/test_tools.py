"""Offline tests for the git tools. No API key needed: uv run pytest tests/unit"""

import subprocess
from pathlib import Path

import pytest

from app.agent import get_diff, read_file

SAMPLE = Path(__file__).resolve().parents[2] / "samples" / "login_service.dart"


def git(repo: Path, *args: str) -> None:
    subprocess.run(["git", *args], cwd=repo, check=True, capture_output=True)


@pytest.fixture
def repo(tmp_path, monkeypatch):
    """The same repo setup.sh makes: main, plus feature/login with the planted file."""
    git(tmp_path, "init", "-q", "-b", "main")
    git(tmp_path, "config", "user.name", "Test")
    git(tmp_path, "config", "user.email", "test@example.com")
    (tmp_path / "README.md").write_text("# Sample app\n")
    git(tmp_path, "add", "README.md")
    git(tmp_path, "commit", "-qm", "Initial project")
    git(tmp_path, "checkout", "-qb", "feature/login")
    (tmp_path / "flutter_app").mkdir()
    (tmp_path / "flutter_app" / "login_service.dart").write_text(SAMPLE.read_text())
    git(tmp_path, "add", "flutter_app")
    git(tmp_path, "commit", "-qm", "Add login service")
    monkeypatch.setenv("REPO_DIR", str(tmp_path))
    return tmp_path


def test_diff_shows_the_planted_problems(repo):
    out = get_diff("main")
    assert out["status"] == "success"
    assert "flutter_app/login_service.dart" in out["diff"]
    assert "demo-key-not-real-0000" in out["diff"]
    assert "password=$password" in out["diff"]


def test_diff_against_missing_branch_is_an_error(repo):
    assert get_diff("does-not-exist")["status"] == "error"


def test_read_file_in_repo(repo):
    assert read_file("README.md") == {"status": "success", "content": "# Sample app\n"}


def test_read_file_outside_repo_is_refused(repo):
    assert read_file("../../etc/passwd")["status"] == "error"
    assert read_file("missing.dart")["status"] == "error"
