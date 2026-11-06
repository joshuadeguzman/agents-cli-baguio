# Release notes writer

Turns the commits since a tag into short release notes for app users, grouped into New, Improved and Fixed.
Refactors, CI changes and dependency bumps are left out.

Tool: `git_log` (commits since a tag). The repo is `REPO_DIR` from `.env`, or the current folder.

## Run it

```bash
cp .env.example .env        # put your Gemini API key in .env (REPO_DIR=sample_repo is already set)
./setup.sh                  # creates sample_repo/ with v1.4.0 and seven commits after it
agents-cli install
agents-cli playground --port 8504
```

Open `http://127.0.0.1:8504/dev-ui/?app=app` and ask:

```text
Write release notes since v1.4.0.
```

**You should see** a `git_log` call, then New (dark mode, delivery ETA) and Fixed (the expired order crash, the
coupon total).

To use your own app, set `REPO_DIR` in `.env` to its path and ask for notes since your last tag.

## Evaluate it

```bash
agents-cli eval run --dataset tests/eval/datasets/release-notes.json
```

The local eval uses `REPO_DIR=sample_repo`, so run `./setup.sh` first.

`user_facing_only` checks that the notes keep the user-facing changes and leave out the refactor, the CI bump and the dependency update. `custom_response_quality` is the template's LLM judge (1 to 5). The run ends with `RESULT: PASS`, or `RESULT: FAIL` with the failing metrics and cases listed above it, and writes an
HTML report to `artifacts/grade_results/`. The cases are in `tests/eval/datasets/release-notes.json`, and the metrics and pass
thresholds are in `tests/eval/eval_config.yaml`.

## Deploy it

Follow [DEPLOY.md](../DEPLOY.md). For this agent:

- No extra `Dockerfile` line: this agent reads nothing from its folder.
- The deployed agent has no checkout of your repo, so send the git output in the message, as below. That is how you would call it from CI.

Call the deployed agent:

```bash
agents-cli run "Write release notes for these commits: $(git -C sample_repo log v1.4.0..HEAD --pretty=%s)" --url SERVICE_URL --mode a2a
```
