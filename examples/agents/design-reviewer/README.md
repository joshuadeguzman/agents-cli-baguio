# Design reviewer

Looks at a phone screenshot and lists the top five issues, most important first. Contrast and tap targets are
measured with tools, not guessed.

Tools: `contrast_ratio` (WCAG AA) and `check_touch_target` (48 x 48 dp minimum).

## Run it

```bash
cp .env.example .env        # put your Gemini API key in .env
agents-cli install
agents-cli playground --port 8503
```

Open `http://127.0.0.1:8503/dev-ui/?app=app`, click **+** in the message box, attach
`sample_screens/login.png`, and send:

```text
Review this screen. The subtitle is #B0B0B0 on #FFFFFF. The button is white text on #FFC107, and it is 120 x 36 dp.
```

**You should see** calls to both tools. The subtitle fails at 2.17:1, the button text fails at 1.63:1, and the
36 dp button is under the 48 dp minimum. Then layout notes from the screenshot.

Giving the colors and size in the message helps: models read layout well, but not exact hex values.

## Unit test it

```bash
uv run pytest tests/unit     # 5 passed, no API key needed
```

The tests in `tests/unit/test_tools.py` check `contrast_ratio` against known WCAG values (black on white is 21:1) and the 48 dp check in `check_touch_target`. They call the Python tools directly, with no model, so run them after every change.

## Evaluate it

```bash
agents-cli eval run --dataset tests/eval/datasets/design-review.json
```

`uses_measured_numbers` checks that the answer quotes the numbers the tools computed (2.17, 1.63, 48), not guesses. `custom_response_quality` is the template's LLM judge (1 to 5). The run ends with `RESULT: PASS`, or `RESULT: FAIL` with the failing metrics and cases listed above it, and writes an
HTML report to `artifacts/grade_results/`. The cases are in `tests/eval/datasets/design-review.json`, and the metrics and pass
thresholds are in `tests/eval/eval_config.yaml`.

## Deploy it

Follow [DEPLOY.md](../DEPLOY.md). For this agent:

- No extra `Dockerfile` line: this agent reads nothing from its folder.
- `--file` attaches the screenshot to the message.

Call the deployed agent:

```bash
agents-cli run "Review this screen. The subtitle is #B0B0B0 on #FFFFFF. The button is white text on #FFC107, and it is 120 x 36 dp." --file sample_screens/login.png --url SERVICE_URL --mode a2a
```
