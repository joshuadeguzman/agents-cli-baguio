# Root cause agent

Reads a log file and explains what broke, with the log lines that prove it. This is the agent from the codelab.

Tools: `find_errors` (ERROR and WARN lines, with line numbers) and `read_log` (the whole file).
Both only read files inside `sample_logs/`.

Guardrails (`app/guardrails.py`): `block_secrets` answers without calling Gemini when a message contains an API key,
private key or password, and `only_log_files` stops any tool call that isn't for a plain `.log` file name.

## Run it

```bash
cp .env.example .env        # put your Gemini API key in .env
agents-cli install
agents-cli playground --port 8501
```

Open `http://127.0.0.1:8501/dev-ui/?app=app` and ask:

```text
What went wrong in this log?
```

Then try the guardrail: `Login fails with password=hunter2 in my config. Why?` The answer comes at once, with no
model call.

**You should see** a `find_errors` call, then `read_log`, then an answer: payments time out because v2.4.1 set
`PAYMENT_TIMEOUT_MS=30`, while the gateway needs about 400 ms. The fix is to set it back to 3000.

## Unit test it

```bash
uv run pytest tests/unit     # 10 passed, no API key needed
```

`tests/unit/test_tools.py` checks `find_errors` and `read_log` on both sample logs, and that neither tool reads outside
`sample_logs/`. `tests/unit/test_guardrails.py` checks that a pasted key or password is blocked, a normal question gets
through, and only `.log` names reach the tools. They call the Python code directly, with no model, so run them after every
change.

## Evaluate it

```bash
agents-cli eval run --dataset tests/eval/datasets/root-cause.json
```

The four cases include one for the guardrail. `names_the_timeout` checks that the answer names the bad setting (`PAYMENT_TIMEOUT_MS`, 30 ms). `custom_response_quality` is the template's LLM judge (1 to 5). The run ends with `RESULT: PASS`, or `RESULT: FAIL` with the failing metrics and cases listed above it, and writes an
HTML report to `artifacts/grade_results/`. The cases are in `tests/eval/datasets/root-cause.json`, and the metrics and pass
thresholds are in `tests/eval/eval_config.yaml`.

## Deploy it

Follow [DEPLOY.md](../DEPLOY.md). For this agent:

- In the `Dockerfile`, add `COPY ./sample_logs ./sample_logs` right after `COPY ./app ./app`, so the deployed agent can read its files.

Call the deployed agent:

```bash
agents-cli run "What went wrong in order-api.log?" --url SERVICE_URL --mode a2a
```

## Files

- `app/agent.py`: the agent and its two tools
- `app/guardrails.py`: the two guardrail callbacks
- `sample_logs/`: `order-api.log` (one planted failure) and `order-api-healthy.log`
- `tests/unit/test_tools.py` and `test_guardrails.py`: offline tests for the tools and the guardrails
- `tests/eval/`: the eval cases and metrics
- `app/fast_api_app.py`: `otel_to_cloud = False`, so it runs without a gcloud login
