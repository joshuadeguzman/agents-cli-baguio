"""Offline test: setup.sh builds sample_repo from sample_data/history.txt. No API key needed."""

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_setup_builds_the_sample_repo(monkeypatch):
    subprocess.run(["bash", "setup.sh"], cwd=ROOT, check=True, capture_output=True)
    monkeypatch.setenv("REPO_DIR", str(ROOT / "sample_repo"))
    from app.agent import git_log

    out = git_log("v1.4.0")
    assert out["status"] == "success"
    assert len(out["commits"]) == 30
    subjects = " ".join(out["commits"])
    for must in ("GCash", "Revert", "minSdk", "fix(security)", "chore(deps)"):
        assert must in subjects
    assert git_log("v1.3.0")["status"] == "success"
