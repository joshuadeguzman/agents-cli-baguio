# Ask your data

Answers questions about a sales CSV by writing pandas code and running it. The numbers come from the code, not from
the model's guess. This is the first demo in the talk: no tools to write, no cloud setup.

The data is `app/data/sales.csv`: 48 rows of monthly sales with `month`, `quarter`, `region`, `product`, `units` and
`price`. Revenue for a row is `units x price`.

How it works: a `before_agent_callback` puts the CSV into session state, the instruction includes it, and
`BuiltInCodeExecutor` lets Gemini run the code it writes.

## Run it

```bash
cp .env.example .env        # put your Gemini API key in .env
agents-cli install
agents-cli playground
```

Open `http://127.0.0.1:8080/dev-ui/?app=app` and ask:

```text
What is the total revenue for the year?
```

**You should see** a code block, its output, then the answer: **72,006.26**. Then try:

```text
What's the median revenue per row, and which row is the biggest outlier above the mean?
```

The answer is a median of **1,378.97**, and May, South, Gadget at **6,196.90**, which is **4,696.77** above the mean.

## Build it with one prompt

This folder is what a coding agent builds from one prompt. To show it live, make an empty folder, open your coding agent
there with the Agents CLI skills installed (`uvx google-agents-cli@1.13.0 setup`), and paste
[`PROMPT.txt`](PROMPT.txt):

```text
Use agents-cli 1.13.0 and its skills to build an ADK 2 agent in a new prototype project called ask-your-data.
Download the sample data to app/data/sales.csv from https://joshuamdeguzman.com/agents-cli-baguio/examples/agents/ask-your-data/app/data/sales.csv
The agent answers questions about that CSV. Revenue for a row is units x price.
Load the CSV into session state with a before_agent_callback, and give the agent BuiltInCodeExecutor so it writes and runs pandas code instead of guessing.
Round money to 2 decimals and give counts as whole numbers.
Use gemini-3.8-flash with my Gemini API key. I will add the key to .env myself. Don't read or print .env.
Set otel_to_cloud = False in app/fast_api_app.py. Don't deploy anything.
When it's done, run: agents-cli run "What is the total revenue for the year?" The answer should be 72,006.26.
```

Then put your key in the new project's `.env` and run `agents-cli playground`. Approve each command the agent runs.

## Test it

```bash
uv run pytest tests/unit                       # 6 passed, no API key needed
uv run python tests/eval/build_dataset.py      # rebuilds the eval cases from the CSV
agents-cli eval run --dataset tests/eval/datasets/basic-dataset.json
```

`build_dataset.py` computes every expected answer from the CSV with plain Python, so the eval checks the agent against
the real numbers. It writes 6 cases to `basic-dataset.json` and 3 to `holdout-dataset.json`. Use the holdout set only
after you stop changing the instruction, to check you did not tune it to the first 6.

`answer_matches_truth` (`tests/eval/answer_match.py`) passes when every expected number is in the answer.
`custom_response_quality` is the template's LLM judge (1 to 5). The run ends with `RESULT: PASS` or `RESULT: FAIL`.

## Deploy it

Follow [DEPLOY.md](../DEPLOY.md). Nothing is different for this agent: the CSV is inside `app/`, so the Dockerfile
already copies it.

Call the deployed agent:

```bash
agents-cli run "What is the total revenue for the year?" --url SERVICE_URL --mode a2a
```

## Use your own data

Replace `app/data/sales.csv` with your own CSV (keep it small: it goes into every prompt), then update the
instruction in `app/agent.py` with what the columns mean, and rerun `build_dataset.py` after you change its questions.
Don't use data you can't send to the Gemini API.

## Files

- `app/agent.py`: the agent, the callback and the code executor
- `app/data/sales.csv`: the sample data
- `tests/unit/test_truth.py`: checks the ground truth and the metric, offline
- `tests/eval/`: the ground truth script, the eval cases and the metrics
- `app/fast_api_app.py`: `otel_to_cloud = False`, so it runs without a gcloud login
