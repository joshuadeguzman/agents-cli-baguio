# DevFest Baguio 2026

Talk pages for DevFest Baguio 2026, November 7. Served by GitHub Pages at
`joshuamdeguzman.com/devfest_baguio/`, the same way `/agents-cli` and `/a2ui` are:
each repo with Pages turned on serves at `/<repo-name>/`.

| Path | What it is |
|------|------------|
| `index.html` | Landing page: title, date, links, QR code to the codelab |
| `slides/index.html` | Copy of the `/agents-cli` deck, retargeted to DevFest Baguio |
| `codelab/index.html` | 12-step codelab: build a root cause agent |
| `sample_logs/`, `sample_logs.zip` | Log files the codelab agent reads. One planted failure. |
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

Tested with google-agents-cli 1.13.0, google-adk 2.13.0, uv 0.13.7, on November 6, 2026.
