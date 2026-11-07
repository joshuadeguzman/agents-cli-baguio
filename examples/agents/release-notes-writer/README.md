# Release notes writer

Turns the commits since a tag into short release notes for app users, grouped into New, Improved and Fixed.
Refactors, CI changes and dependency bumps are left out.

Tool: `git_log` (commits since a tag). The repo is `REPO_DIR` from `.env`, or the current folder.

## Run it

```bash
cp .env.example .env        # put your Gemini API key in .env (REPO_DIR=sample_repo is already set)
./setup.sh                  # creates sample_repo/ from sample_data/history.txt
agents-cli install
agents-cli playground --port 8504
```

Open `http://127.0.0.1:8504/dev-ui/?app=app` and ask:

```text
Write release notes since v1.4.0.
```

**You should see** a `git_log` call that returns 30 commits, then about 20 short lines:

- **New:** GCash at checkout, dark mode, delivery ETA, open-now filter, Filipino, one-tap reorder
- **Improved:** faster restaurant list, live rider location, grouped notifications, checkout accessibility
- **Fixed:** the double charge, the expired order crash, the Android 15 login loop, the coupon total, and more,
  including a security fix described without technical detail
- **Heads up:** the app now needs Android 7.0 or later

Refactors, tests, docs, CI, lint, dependency bumps and the reverted holiday banner are left out.

## The sample data

`sample_data/history.txt` is the git history of Kain, a made-up food delivery app built with Flutter. It has tags
`v1.3.0` and `v1.4.0`, then 30 commits with authors, dates and PR numbers: features, fixes, performance and
accessibility work, a security fix, a `minSdk` bump that drops old Android phones, a feature that was reverted, and
the noise a real repo has (refactors, tests, docs, lint, CI and dependency bumps). `setup.sh` turns it into a real
git repo in `sample_repo/`. Edit the file and rerun `./setup.sh` to try your own history.

To use your own app, set `REPO_DIR` in `.env` to its path and ask for notes since your last tag.

## Unit test it

```bash
uv run pytest tests/unit     # 4 passed, no API key needed
```

The tests in `tests/unit/test_tools.py` check `git_log` on a throwaway repo with a tag: only commits after the tag, and an error for an unknown tag. They call the Python tools directly, with no model, so run them after every change.

## Evaluate it

```bash
agents-cli eval run --dataset tests/eval/datasets/release-notes.json
```

The local eval uses `REPO_DIR=sample_repo`, so run `./setup.sh` first.

`user_facing_only` checks that the notes keep the key changes (GCash, dark mode, delivery ETA, the coupon and double charge fixes, the expired order crash, and the Android 7.0 heads up) and leave out refactors, CI, tests, lint, dependency bumps, the reverted banner and PR numbers. `custom_response_quality` is the template's LLM judge (1 to 5). The run ends with `RESULT: PASS`, or `RESULT: FAIL` with the failing metrics and cases listed above it, and writes an
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
