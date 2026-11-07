# Agents CLI at DevFest Baguio 2026

Slides, a live demo, a hands-on codelab and six example agents for the talk
**Google's Agents CLI: Build & Deploy Agents in Under 20 Minutes**, DevFest Baguio, November 7, 2026.

- Site: https://joshuamdeguzman.com/agents-cli-baguio/
- Codelab: https://joshuamdeguzman.com/agents-cli-baguio/codelab/
- Example agents: [`examples/agents/`](examples/agents/)

## What's here

| Path | What it is |
|------|------------|
| `index.html` | Landing page: title, date, QR code to the codelab |
| `slides/index.html` | The talk deck. Arrow keys to move, `N` for speaker notes, `J` to jump |
| `demo/index.html` | Click-through replay of a recorded agents-cli session. `?embed=1` for a compact view |
| `codelab/index.html` | 14-step codelab: build a root cause agent with guardrails, unit tests and an eval, deploy it (optional), then four more in the bonus step, including one that chains four agents |
| `examples/index.html` | Example agents for developers, with code, a one-prompt version and deploy steps |
| `examples/agents/` | The six example agents as runnable Agents CLI projects. Start with its README |
| `sample_logs/`, `sample_logs.zip` | Log files the codelab agent reads. One planted failure |
| `samples/` | Bonus-step samples: a Flutter file with planted bugs (fake key) and a phone screen with design issues |
| `assets/` | Shared styles, the terminal replay, the live demo slide, the QR code, the ADK and Agents CLI logos, illustrations and screenshots |

## Run the site locally

No build step. Serve the parent folder so the paths match production:

```bash
mkdir -p /tmp/www && ln -sfn "$PWD" /tmp/www/agents-cli-baguio
python3 -m http.server 8811 --directory /tmp/www
# open http://127.0.0.1:8811/agents-cli-baguio/
```

## Run the example agents

You need three things: [uv](https://docs.astral.sh/uv/getting-started/installation/), Agents CLI and a Gemini API key.

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh   # uv (on Windows, inside Ubuntu on WSL)
uvx google-agents-cli@1.13.0 setup                # Agents CLI and its skills, then open a new terminal
cd examples/agents/ask-your-data                  # the sales CSV agent from the demo
cp .env.example .env                              # paste your key from aistudio.google.com/apikey
agents-cli install
uv run pytest tests/unit                          # offline tests, no key needed
agents-cli playground
```

The full steps, running all six at once, and a checklist for the session are in
[`examples/agents/README.md`](examples/agents/README.md).

## Publish

GitHub Pages serves each repo at `/<repo-name>/` on the custom domain, so this repo must be named
**`agents-cli-baguio`** for the links and the QR code to work.

1. Create `joshuadeguzman/agents-cli-baguio` on GitHub and push `main`.
2. Settings, Pages: deploy from the `main` branch, root folder.
3. Check https://joshuamdeguzman.com/agents-cli-baguio/codelab/ and scan the QR code on the title slide.

## Secrets

Nothing in this repo needs an API key, and none is stored in it.

- The codelab and examples put the Gemini API key only in each agent project's `.env`. Every project lists `.env`
  in `.gitignore`, and people are told to check with `git check-ignore -v .env` before committing.
- This repo's `.gitignore` also blocks `.env`, `.env.*`, key and certificate files, and credential JSON.
  `.env.example` files are allowed: they only hold placeholders.
- `samples/login_service.dart` and its copy in `examples/agents/code-reviewer/samples/` contain a fake key
  (`demo-key-not-real-0000`) on purpose, for the code reviewer agent to find.

Before pushing, scan for anything that looks like a real key:

```bash
git grep -nE 'AIza[0-9A-Za-z_-]{20,}|sk_live|ghp_[A-Za-z0-9]{20,}' -- ':!README.md' ; echo "exit $? (1 means nothing found)"
```

## Recorded output

The demo page, the live demo slide and the codelab's "Show output" buttons replay real runs of agents-cli on macOS.
Lines tagged `sample` (model answers) or `simulated` (coding agent narration, deploy, publish) were not recorded.

Tested with google-agents-cli 1.13.0, google-adk 2.13.0 and uv 0.13.7 on November 6, 2026.

## Fonts

Only Google's open-source fonts, from Google Fonts: **Google Sans** for all text and **Google Sans Code** for code,
commands and terminal output.

## Credits

Sundar Pichai's photo is by Lukasz Kobus, European Commission, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Sundar_Pichai_(2023)_cropped.jpg), cropped. Lauren Tan's picture is her public GitHub avatar (github.com/poteto). The ADK and Agents CLI logos are from Google's [adk-python](https://github.com/google/adk-python) and
[agents-cli](https://github.com/google/agents-cli) repositories. Illustrations generated for this talk with Higgsfield (GPT Image 2.6). Company screenshots are of public homepages,
retrieved November 6, 2026, and quotes come from the Google posts linked on each slide.
