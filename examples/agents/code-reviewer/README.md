# Code reviewer

Reads the changes on a branch and reports bugs, security problems and missing tests, each with file, line,
severity and a one-line fix.

Tools: `get_diff` (git diff against a base branch) and `read_file` (one file inside the repo).
The repo is `REPO_DIR` from `.env`, or the current folder if it isn't set.

## Run it

```bash
cp .env.example .env        # put your Gemini API key in .env (REPO_DIR=sample_repo is already set)
./setup.sh                  # creates sample_repo/ with a feature branch to review
agents-cli install
agents-cli playground --port 8502
```

Open `http://127.0.0.1:8502/dev-ui/?app=app` and ask:

```text
Review this branch against main.
```

**You should see** a `get_diff` call, then findings for the planted problems in `flutter_app/login_service.dart`:
a hardcoded key, a password sent in an `http://` URL, and a forced unwrap (`name!`). Wording varies.

The key in `samples/login_service.dart` is fake. It is there so the reviewer has something to catch.

To review your own project instead, set `REPO_DIR` in `.env` to its path.

## Unit test it

```bash
uv run pytest tests/unit     # 4 passed, no API key needed
```

The tests in `tests/unit/test_tools.py` check `get_diff` and `read_file` on a throwaway git repo built like `setup.sh` does, including that `read_file` refuses paths outside the repo. They call the Python tools directly, with no model, so run them after every change.

## Evaluate it

```bash
agents-cli eval run --dataset tests/eval/datasets/code-review.json
```

The local eval uses `REPO_DIR=sample_repo`, so run `./setup.sh` first.

`finds_planted_issues` checks that the review of the sample branch names at least two of the three planted problems. `custom_response_quality` is the template's LLM judge (1 to 5). The run ends with `RESULT: PASS`, or `RESULT: FAIL` with the failing metrics and cases listed above it, and writes an
HTML report to `artifacts/grade_results/`. The cases are in `tests/eval/datasets/code-review.json`, and the metrics and pass
thresholds are in `tests/eval/eval_config.yaml`.

## Deploy it

Follow [DEPLOY.md](../DEPLOY.md). For this agent:

- No extra `Dockerfile` line: this agent reads nothing from its folder.
- The deployed agent has no checkout of your repo, so send the git output in the message, as below. That is how you would call it from CI.

Call the deployed agent:

```bash
agents-cli run "Review this diff: $(git -C sample_repo diff main...feature/login)" --url SERVICE_URL --mode a2a
```
