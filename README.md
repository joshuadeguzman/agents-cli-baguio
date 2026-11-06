# DevFest Baguio 2026

Talk pages for DevFest Baguio 2026, November 7. Served by GitHub Pages at
`joshuamdeguzman.com/devfest_baguio/`, the same way `/agents-cli` and `/a2ui` are:
each repo with Pages turned on serves at `/<repo-name>/`.

| Path | What it is |
|------|------------|
| `index.html` | Landing page: title, date, links, QR code to the codelab |
| `slides/index.html` | Copy of the `/agents-cli` deck, retargeted to DevFest Baguio |
| `codelab/index.html` | 12-step codelab: build a root cause agent |
| `samples/` | Bonus-step samples: a Flutter file with planted bugs (fake key) and a phone screen with design issues |
| `sample_logs/`, `sample_logs.zip` | Log files the codelab agent reads. One planted failure. |
| `examples/index.html` | Example agents for developers: code reviewer, design reviewer, release notes writer. Tools tested, agents load with ADK 2.13.0 |
| `demo/index.html` | Click-through replay of a recorded agents-cli session. `?embed=1` for a compact view |
| `assets/demo-data.js` | The recorded terminal output. Generated, see below |
| `assets/terminal.js` | Replays `demo-data.js` in the demo page and the codelab's "Show output" buttons |
| `assets/live-demo.js` | The "One prompt, a local chat, then Gemini Enterprise" slide: terminal tabs and a mock chat, one step per key press |
| `assets/site.css` | Tokens copied from the deck, shared by the landing page and codelab |
| `assets/qr-codelab.svg` | QR code for `https://joshuamdeguzman.com/devfest_baguio/codelab/` |

No build step. Open `index.html`, or serve the parent folder so the paths match production:

```bash
mkdir -p /tmp/www && ln -sfn "$PWD" /tmp/www/devfest_baguio
python3 -m http.server 8811 --directory /tmp/www
# http://127.0.0.1:8811/devfest_baguio/
```

Rebuild the zip after you edit the logs:

```bash
rm sample_logs.zip && zip -q -X -r sample_logs.zip sample_logs
```

Recorded output: real runs of agents-cli on macOS. Lines tagged `sample` (model answers) or `simulated`
(coding agent narration, deploy, publish) were not recorded. Re-record with a real `GEMINI_API_KEY`
to replace the sample answers.

Tested with google-agents-cli 1.13.0, google-adk 2.13.0, uv 0.13.7, on November 6, 2026.

## Secrets

Nothing in this repo needs an API key. The codelab and examples tell people to put their Gemini API key only in each
agent project's `.env`, which `agents-cli create` lists in `.gitignore`, and to check with `git check-ignore -v .env`
before committing. This repo's own `.gitignore` also blocks `.env`, key files and credential JSON.

`samples/login_service.dart` contains a fake key (`demo-key-not-real-0000`) on purpose, for the code reviewer agent to find.

Before pushing, scan for anything that looks like a real key:

```bash
git grep -nE 'AIza[0-9A-Za-z_-]{20,}|sk_live|ghp_[A-Za-z0-9]{20,}' -- ':!README.md' ; echo "exit $? (1 means nothing found)"
```
