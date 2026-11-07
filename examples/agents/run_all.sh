#!/usr/bin/env bash
# Starts every example agent's playground on its own port, for the agent console (../../console/).
# Run from anywhere: examples/agents/run_all.sh   Stop them all with Ctrl+C.
# Each folder needs a .env with your key, and agents-cli install run once. Folders without a .env are skipped.
set -uo pipefail
cd "$(dirname "$0")"

AGENTS="ask-your-data:8080 root-cause-agent:8501 code-reviewer:8502 design-reviewer:8503 release-notes-writer:8504 sales-brief:8505"

trap 'echo; echo "Stopping all playgrounds..."; kill 0' INT TERM EXIT

for pair in $AGENTS; do
  name="${pair%%:*}"; port="${pair##*:}"
  if [ ! -f "$name/.env" ]; then
    echo "skip  $name: no .env (cp $name/.env.example $name/.env, then add your key)"
    continue
  fi
  if [ -x "$name/setup.sh" ] && [ ! -d "$name/sample_repo" ]; then
    (cd "$name" && ./setup.sh > /dev/null)
  fi
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN > /dev/null 2>&1; then
    echo "skip  $name: port $port is already in use"
    continue
  fi
  (cd "$name" && exec agents-cli playground --port "$port" > .playground.log 2>&1) &
  echo "start $name on http://127.0.0.1:$port  (log: $name/.playground.log)"
done

echo
echo "Open the console: serve the repo root (python3 -m http.server 8811 from the parent of the repo, see README)"
echo "and go to /agents-cli-baguio/console/. Press Ctrl+C here to stop every agent."
wait
