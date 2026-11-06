# Example agents

Four small ADK agents built with Agents CLI for the DevFest Baguio 2026 talk and codelab.
Each folder is a complete `agents-cli create --prototype` project you can run on your laptop.

| Agent | What it does | Tools | Port |
|---|---|---|---|
| [root-cause-agent](root-cause-agent/) | Reads a log and explains what broke | `read_log`, `find_errors` | 8080 |
| [code-reviewer](code-reviewer/) | Reviews a branch for bugs, security problems and missing tests | `get_diff`, `read_file` | 8502 |
| [design-reviewer](design-reviewer/) | Reviews a phone screenshot for contrast and tap targets | `contrast_ratio`, `check_touch_target` | 8503 |
| [release-notes-writer](release-notes-writer/) | Turns commits since a tag into release notes | `git_log` | 8504 |

## Before you start

- [uv](https://docs.astral.sh/uv/getting-started/installation/) and Agents CLI: `uvx google-agents-cli@1.13.0 setup`
- A Gemini API key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey). No Google Cloud project needed.
- On Windows, use Ubuntu on WSL 2.

## Run one

```bash
cd root-cause-agent          # or any other folder
cp .env.example .env         # then put your key in .env
agents-cli install
agents-cli playground        # add --port 8502 and so on to run several at once
```

Open the address it prints, usually `http://127.0.0.1:8080/dev-ui/?app=app`.

## The whole path for each agent

1. **Run it locally:** the steps above, then the question in its README.
2. **Evaluate it:** `agents-cli eval run --dataset tests/eval/datasets/<file>.json`. Each agent has eval cases, a plain
   Python check for the facts it must get right, an LLM judge, and pass thresholds. The run ends with `RESULT: PASS`
   or `RESULT: FAIL`.
3. **Deploy it:** [DEPLOY.md](DEPLOY.md) covers Cloud Run, calling the deployed agent, evaluating it, and deleting it.
   Each README lists what is different for that agent.

## Keep your key safe

- The key goes only in `.env`. Every project lists `.env` in `.gitignore`.
- Check before you commit: `git check-ignore -v .env` must mention `.env`.
- Share `.env.example`, never `.env`. Never paste the key into a chat or a coding agent.
- If a key leaks, delete it at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and make a new one.

The full walkthrough is in the codelab: https://joshuamdeguzman.com/agents-cli-baguio/codelab/
