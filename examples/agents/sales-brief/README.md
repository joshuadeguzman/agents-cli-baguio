# Sales brief: four agents in one app

Turns the sales CSV from [ask-your-data](../ask-your-data/) into a checked weekly brief. Four agents work in a chain
inside one ADK `Workflow`:

```
START -> analyst -> exec_writer  -> join -> fact_checker
                 -> team_writer  ->
```

| Agent | Job | Saves to state |
|---|---|---|
| `analyst` | Writes and runs pandas code: total, by quarter, by region, units, top row | `figures` |
| `exec_writer` | 3 bullets for a manager, using only `{figures}` | `exec_summary` |
| `team_writer` | 2 actions for the sales team, tied to `{figures}` | `team_actions` |
| `fact_checker` | Checks every number against `{figures}`, fixes any mismatch, writes the brief | `brief` |

How the chain works:

- **Passing results:** each agent saves its answer with `output_key`. The next agent reads it with a `{placeholder}`
  in its instruction.
- **Order:** the `edges` of the `Workflow` say who runs after whom. A tuple, `(exec_writer, team_writer)`, runs
  those agents at the same time. `JoinNode` waits for both before the fact checker starts.
- **Only the analyst runs code.** The writers can only reuse its numbers, and the fact checker catches any that change.

`Workflow` is the ADK 2 way to build this. `SequentialAgent` and `ParallelAgent` still work in ADK 2.13.0, but they
print a deprecation warning.

## Run it

```bash
cp .env.example .env        # put your Gemini API key in .env
agents-cli install
agents-cli playground --port 8505
```

Open `http://127.0.0.1:8505/dev-ui/?app=app` and ask:

```text
Make this week's sales brief.
```

**You should see** four turns, one per agent, in about 30 to 60 seconds. The analyst's turn shows its code and these
numbers: total **72,006.26**, Q4 **18,585.81**, South **37,642.95**, and the top row May, South, Gadget at
**6,196.90**. The brief ends with `Checked: all numbers match`. In the dev UI, the **State** tab shows `figures`,
`exec_summary`, `team_actions` and `brief`.

Without the playground:

```bash
agents-cli run "Make this week's sales brief."
```

## Test it

```bash
uv run pytest tests/unit                       # 8 passed, no API key needed
agents-cli eval run --dataset tests/eval/datasets/basic-dataset.json
```

- `tests/unit/test_chain.py` checks the wiring without a model call: the edges match the diagram, and every
  `{placeholder}` an agent reads is saved by an agent that runs before it. Rename an `output_key` and this test names
  the agent that breaks.
- `tests/unit/test_truth.py` checks the expected numbers and the metric.
- The eval has 2 cases. `answer_matches_truth` passes when the final brief still has every key number from the CSV,
  after four agents. `custom_response_quality` is the template's LLM judge (1 to 5). `build_dataset.py` computes the
  expected numbers with plain Python.

## Deploy it

Follow [DEPLOY.md](../DEPLOY.md). Nothing is different for this agent: the CSV is inside `app/`, so the Dockerfile
already copies it.

## Make it yours

- **Add a step:** write another `Agent` with an `output_key`, then put it in the `edges` chain.
- **Change the readers:** edit the writers' instructions. Keep "Copy numbers exactly. No new numbers."
- **Use your own data:** replace `app/data/sales.csv` (keep it small: it goes into the analyst's prompt), update the
  analyst's instruction, then update `build_dataset.py` and rerun it.

## Files

- `app/agent.py`: the four agents and the `Workflow`
- `app/data/sales.csv`: the same sample data as ask-your-data
- `tests/unit/`: wiring and ground truth tests, offline
- `tests/eval/`: the ground truth script, the eval cases and the metrics
- `app/fast_api_app.py`: `otel_to_cloud = False`, so it runs without a gcloud login
