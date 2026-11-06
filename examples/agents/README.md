# Example agents

Four small ADK agents built with Agents CLI for the DevFest Baguio 2026 talk and codelab.
Each folder is a complete `agents-cli create --prototype` project you can run on your laptop.

| Agent | What it does | Tools | Port |
|---|---|---|---|
| [root-cause-agent](root-cause-agent/) | Reads a log and explains what broke | `read_log`, `find_errors` | 8080 |
| [code-reviewer](code-reviewer/) | Reviews a branch for bugs, security problems and missing tests | `get_diff`, `read_file` | 8502 |
| [design-reviewer](design-reviewer/) | Reviews a phone screenshot for contrast and tap targets | `contrast_ratio`, `check_touch_target` | 8503 |
| [release-notes-writer](release-notes-writer/) | Turns commits since a tag into release notes | `git_log` | 8504 |

## Before you start (one time)

You need [uv](https://docs.astral.sh/uv/getting-started/installation/), Agents CLI and a Gemini API key.
Git must be installed. uv downloads Python for you. No Google Cloud project is needed to run or evaluate the agents.

**1. Install uv**

```bash
# macOS or Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

On Windows, install WSL first (`wsl --install` in PowerShell as administrator, then restart), open **Ubuntu**, and
run the same command there. Do everything below in the Ubuntu terminal.

**2. Install Agents CLI and its skills**

```bash
uvx google-agents-cli@1.13.0 setup
```

Open a new terminal, then check: `agents-cli --version` prints `agents-cli, version 1.13.0`.

**3. Get a Gemini API key**

Create one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). One key works for all four agents.

## Run one agent

```bash
cd examples/agents/root-cause-agent     # or any of the four folders
cp .env.example .env                    # then open .env and paste your key after GEMINI_API_KEY=
./setup.sh                              # only in code-reviewer and release-notes-writer
agents-cli install
agents-cli playground                   # add --port 8502 and so on to run several at once
```

Open the address it prints, usually `http://127.0.0.1:8080/dev-ui/?app=app`. Each agent's README has the question to
ask and what you should see. Stop the playground with `Ctrl+C`.

## Run all four at once

In each folder, run the `cp`, `./setup.sh` (where there is one) and `agents-cli install` lines above once. Then start each playground in its own terminal tab, from the repo root:

```bash
cd examples/agents/root-cause-agent     && agents-cli playground --port 8080
cd examples/agents/code-reviewer        && agents-cli playground --port 8502
cd examples/agents/design-reviewer      && agents-cli playground --port 8503
cd examples/agents/release-notes-writer && agents-cli playground --port 8504
```

## Checklist for the session

- [ ] `agents-cli --version` prints 1.13.0
- [ ] Each folder has a `.env` with your key, and `git status` does not list any `.env`
- [ ] `./setup.sh` ran in `code-reviewer` and `release-notes-writer`
- [ ] Each playground opens, and its README question gets an answer
- [ ] Optional: `agents-cli eval run --dataset tests/eval/datasets/<file>.json` ends with `RESULT: PASS`

**If something fails**

- `agents-cli: command not found`: open a new terminal, or run `uv tool update-shell`.
- `API key not valid`: the key in `.env` is wrong, or a `GOOGLE_*` line in `.env` is not commented out.
- `DefaultCredentialsError`: check that `app/fast_api_app.py` has `otel_to_cloud = False`. It already does in these
  examples.
- `429`: you hit the free rate limit. Wait a minute and try again.
- Code reviewer or release notes writer says it can't find a repo or tag: run `./setup.sh` again.

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
