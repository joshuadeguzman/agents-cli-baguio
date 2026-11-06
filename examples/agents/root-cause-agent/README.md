# Root cause agent

Reads a log file and explains what broke, with the log lines that prove it. This is the agent from the codelab.

Tools: `find_errors` (ERROR and WARN lines, with line numbers) and `read_log` (the whole file).
Both only read files inside `sample_logs/`.

## Run it

```bash
cp .env.example .env        # put your Gemini API key in .env
agents-cli install
agents-cli playground
```

Open `http://127.0.0.1:8080/dev-ui/?app=app` and ask:

```text
What went wrong in this log?
```

**You should see** a `find_errors` call, then `read_log`, then an answer: payments time out because v2.4.1 set
`PAYMENT_TIMEOUT_MS=30`, while the gateway needs about 400 ms. The fix is to set it back to 3000.

## Evaluate it

```bash
agents-cli eval run --dataset tests/eval/datasets/root-cause.json
```

`names_the_timeout` checks that the answer names the bad setting (`PAYMENT_TIMEOUT_MS`, 30 ms). `custom_response_quality` is the template's LLM judge (1 to 5). The run ends with `RESULT: PASS`, or `RESULT: FAIL` with the failing metrics and cases listed above it, and writes an
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
- `sample_logs/`: `order-api.log` (one planted failure) and `order-api-healthy.log`
- `tests/eval/`: the eval cases and metrics
- `app/fast_api_app.py`: `otel_to_cloud = False`, so it runs without a gcloud login
