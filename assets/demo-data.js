/* Generated from real terminal recordings. Lines marked sample need a real API key and are illustrative. */
window.DEMO = {
"recorded": "Recorded on November 6, 2026 with google-agents-cli 1.13.0 and google-adk 2.13.0 on macOS.",
"scenes": [
{
"id": "install",
"title": "Install Agents CLI and its skills",
"say": "One command installs the agents-cli command and seven skills for the coding agents it finds.",
"steps": [
{
"cmd": "uvx google-agents-cli@1.13.0 setup",
"cwd": "~",
"out": [
"Setting up...",
"",
" █▀█ █▀▀ █▀▀ █▄ █ ▀█▀ █▀   █▀▀ █  █",
" █▀█ █▄█ ██▄ █ ▀█  █  ▄█   █▄▄ █▄ █",
"",
" Give your coding agent the power to build ADK projects.",
"",
" 1. Authentication",
" ─────────────────",
"",
"  Not authenticated. Run with --interactive (-i) to authenticate interactively.",
"",
" 2. CLI Installation",
" ───────────────────",
"",
"  ▸ uv tool install google-agents-cli",
"",
" 3. Skills Installation",
" ──────────────────────",
"",
"  ▸ npx -y skills@1.5.9 add https://github.com/google/agents-cli -y -g",
"",
"│",
"●   claude-code_2-1-316_agent  Agent detected — installing non-interactively",
"│",
"◇  Source: https://github.com/google/agents-cli.git",
"│",
"◇  Repository cloned",
"│",
"◇  Found 7 skills",
"│",
"●  Installing all 7 skills",
"│",
"◇  56 agents",
"│",
"●  Installing to: Claude Code",
"",
"│",
"◇  Installation Summary ────────────────────────────────────────╮",
"│                                                               │",
"│  ~/.agents/skills/google-agents-cli-adk-code                  │",
"│    universal: Amp, Antigravity, Cline, Codex, Cursor +9 more  │",
"│    symlink → Claude Code                                      │",
"│                                                               │",
"│  ~/.agents/skills/google-agents-cli-deploy                    │",
"│    universal: Amp, Antigravity, Cline, Codex, Cursor +9 more  │",
"│    symlink → Claude Code                                      │",
"│                                                               │",
"│  ~/.agents/skills/google-agents-cli-eval                      │",
"│    universal: Amp, Antigravity, Cline, Codex, Cursor +9 more  │",
"│    symlink → Claude Code                                      │",
"│                                                               │",
"│  ~/.agents/skills/google-agents-cli-observability             │",
"│    universal: Amp, Antigravity, Cline, Codex, Cursor +9 more  │",
"│    symlink → Claude Code                                      │",
"│                                                               │",
"│  ~/.agents/skills/google-agents-cli-publish                   │",
"│    universal: Amp, Antigravity, Cline, Codex, Cursor +9 more  │",
"│    symlink → Claude Code                                      │",
"│                                                               │",
"│  ~/.agents/skills/google-agents-cli-scaffold                  │",
"│    universal: Amp, Antigravity, Cline, Codex, Cursor +9 more  │",
"│    symlink → Claude Code                                      │",
"│                                                               │",
"│  ~/.agents/skills/google-agents-cli-workflow                  │",
"│    universal: Amp, Antigravity, Cline, Codex, Cursor +9 more  │",
"│    symlink → Claude Code                                      │",
"│                                                               │",
"├───────────────────────────────────────────────────────────────╯",
"│",
"◇  Security Risk Assessments ─────────────────────────────────────────────────────╮",
"│                                                                                 │",
"│                                   Gen               Socket            Snyk      │",
"│  google-agents-cli-adk-code       Safe              0 alerts          Low Risk  │",
"│  google-agents-cli-deploy         Safe              0 alerts          Low Risk  │",
"│  google-agents-cli-eval           Safe              0 alerts          Low Risk  │",
"│  google-agents-cli-observability  Safe              0 alerts          Low Risk  │",
"│  google-agents-cli-publish        Safe              0 alerts          Low Risk  │",
"│  google-agents-cli-scaffold       Safe              0 alerts          Low Risk  │",
"│  google-agents-cli-workflow       Safe              0 alerts          Low Risk  │",
"│                                                                                 │",
"│  Details: https://skills.sh/google/agents-cli                                   │",
"│                                                                                 │",
"├─────────────────────────────────────────────────────────────────────────────────╯",
"│",
"◇  Installation complete",
"",
"│",
"◇  Installed 7 skills ──────────────────────────────────────────╮",
"│                                                               │",
"│  ✓ ~/.agents/skills/google-agents-cli-adk-code                │",
"│    universal: Amp, Antigravity, Cline, Codex, Cursor +9 more  │",
"│    symlinked: Claude Code                                     │",
"│  ✓ ~/.agents/skills/google-agents-cli-deploy                  │",
"│    universal: Amp, Antigravity, Cline, Codex, Cursor +9 more  │",
"│    symlinked: Claude Code                                     │",
"│  ✓ ~/.agents/skills/google-agents-cli-eval                    │",
"│    universal: Amp, Antigravity, Cline, Codex, Cursor +9 more  │",
"│    symlinked: Claude Code                                     │",
"│  ✓ ~/.agents/skills/google-agents-cli-observability           │",
"│    universal: Amp, Antigravity, Cline, Codex, Cursor +9 more  │",
"│    symlinked: Claude Code                                     │",
"│  ✓ ~/.agents/skills/google-agents-cli-publish                 │",
"│    universal: Amp, Antigravity, Cline, Codex, Cursor +9 more  │",
"│    symlinked: Claude Code                                     │",
"│  ✓ ~/.agents/skills/google-agents-cli-scaffold                │",
"│    universal: Amp, Antigravity, Cline, Codex, Cursor +9 more  │",
"│    symlinked: Claude Code                                     │",
"│  ✓ ~/.agents/skills/google-agents-cli-workflow                │",
"│    universal: Amp, Antigravity, Cline, Codex, Cursor +9 more  │",
"│    symlinked: Claude Code                                     │",
"│                                                               │",
"├───────────────────────────────────────────────────────────────╯",
"",
"│",
"└  Done!  Review skills before use; they run with full agent permissions.",
"",
" 4. Summary",
" ──────────",
"",
"  Auth:   Not authenticated",
"  CLI:    agents-cli installed",
"  Skills: Installed",
"  Scope:  global",
"",
"  Done.",
"",
"  Coding agent? Read ~/.agents/skills/google-agents-cli-workflow/SKILL.md now."
]
},
{
"cmd": "agents-cli --version",
"cwd": "~",
"out": [
"agents-cli, version 1.13.0"
]
}
]
},
{
"id": "create",
"title": "Create the project",
"say": "--prototype skips deployment files. --yes takes the defaults. The Google Cloud warnings are expected: we use an API key.",
"steps": [
{
"cmd": "agents-cli create root-cause-agent --prototype --yes",
"cwd": "~",
"out": [
"Agents CLI v1.13.0",
"--agent not specified. Defaulting to 'adk_python' in auto-approve mode.",
"Prototype mode: using deployment_target='none'.",
"> Verifying GCP credentials...",
"⚠️  Warning: Looks like you are not authenticated with Google Cloud.",
"Please run: `gcloud auth login --update-adc`",
"Then set your project: `gcloud config set project YOUR_PROJECT_ID`. Continuing with template processing...",
"",
"✅ Success! Your agent project is ready.",
"",
"📖 Documentation",
"   README:    cat root-cause-agent/README.md",
"",
"💡 Tip",
"   Add a deployment target later with: agents-cli scaffold enhance",
"",
"⚠️  Set your GCP project",
"   No GCP project was detected, so .env still has GOOGLE_CLOUD_PROJECT=your-gcp-project-id.",
"   Edit root-cause-agent/.env and set it to your project ID before running the agent.",
"",
"🚀 Get Started",
"   cd root-cause-agent && agents-cli install && agents-cli playground"
]
},
{
"cmd": "cd root-cause-agent",
"cwd": "~",
"out": []
},
{
"cmd": "agents-cli install",
"cwd": "~/root-cause-agent",
"out": [
"  ▸ uv sync",
"Using CPython 3.13.0 interpreter at: /opt/homebrew/opt/python@3.13/bin/python3.13",
"Creating virtual environment at: .venv",
"Resolved 173 packages in 45ms",
"   Building root-cause-agent @ file://~/root-cause-agent",
"      Built root-cause-agent @ file://~/root-cause-agent",
"Prepared 1 package in 318ms",
"Installed 124 packages in 283ms",
" + a2a-sdk==1.3.0",
" + aiohappyeyeballs==2.7.1",
" + aiohttp==3.14.5",
" + aiosignal==1.4.0",
{
"s": "  ... 118 more packages ...",
"k": "gap"
},
" + google-adk==2.13.0",
" + wrapt==2.5.2",
" + yarl==1.25.1"
]
}
]
},
{
"id": "key",
"title": "Add your API key",
"say": "Switch .env from Google Cloud to your Gemini API key, and turn off Cloud telemetry so run and eval work without a gcloud login.",
"steps": [
{
"edit": ".env",
"cwd": "~/root-cause-agent",
"diff": [
[
"-",
"GOOGLE_GENAI_USE_ENTERPRISE=true"
],
[
"+",
"# GOOGLE_GENAI_USE_ENTERPRISE=true"
],
[
"-",
"GOOGLE_CLOUD_PROJECT=your-gcp-project-id"
],
[
"+",
"# GOOGLE_CLOUD_PROJECT=your-gcp-project-id"
],
[
"-",
"GOOGLE_CLOUD_LOCATION=global"
],
[
"+",
"# GOOGLE_CLOUD_LOCATION=global"
],
[
"-",
"# GEMINI_API_KEY=your-api-key-here"
],
[
"+",
"GEMINI_API_KEY=your-api-key-here"
]
]
},
{
"edit": "app/fast_api_app.py",
"cwd": "~/root-cause-agent",
"diff": [
[
"-",
"otel_to_cloud = True"
],
[
"+",
"otel_to_cloud = False"
]
]
}
]
},
{
"id": "logs",
"title": "Add the sample logs",
"say": "Two log files from a made-up food ordering API. One has a planted failure.",
"steps": [
{
"cmd": "curl -LO https://joshuamdeguzman.com/devfest_baguio/sample_logs.zip",
"cwd": "~/root-cause-agent",
"out": [
"  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current",
"                                 Dload  Upload   Total   Spent    Left  Speed",
"",
"  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0",
"100  2049  100  2049    0     0   871k      0 --:--:-- --:--:-- --:--:-- 1000k"
]
},
{
"cmd": "unzip sample_logs.zip",
"cwd": "~/root-cause-agent",
"out": [
"Archive:  sample_logs.zip",
"   creating: sample_logs",
"  inflating: sample_logs/order-api-healthy.log",
"  inflating: sample_logs/order-api.log",
"  inflating: sample_logs/README.md"
]
},
{
"cmd": "ls sample_logs",
"cwd": "~/root-cause-agent",
"out": [
"order-api-healthy.log",
"order-api.log",
"README.md"
]
}
]
},
{
"id": "tools",
"title": "Add two tools",
"say": "A tool is a Python function. The model reads its name, arguments and docstring, never its body.",
"steps": [
{
"edit": "app/agent.py",
"cwd": "~/root-cause-agent",
"diff": [
[
" ",
"def find_errors(file_name: str) -> dict:"
],
[
"+",
"    \"\"\"Find the ERROR and WARN lines in a log file, with line numbers."
],
[
"+",
""
],
[
"+",
"    Use this first to locate problems quickly. Then call read_log if you"
],
[
"+",
"    need the lines around them."
],
[
"+",
"    \"\"\""
],
[
" ",
"    ..."
],
[
" ",
""
],
[
"-",
"    tools=[get_weather, get_current_time],"
],
[
"+",
"    tools=[read_log, find_errors],"
]
]
},
{
"cmd": "uv run python -c \"from app.agent import find_errors; print(find_errors('order-api.log')['count'])\"",
"cwd": "~/root-cause-agent",
"out": [
"15"
]
}
]
},
{
"id": "run",
"title": "Run it with a prompt",
"say": "The model calls find_errors, then read_log, then answers. Each tool call and response is printed as it happens.",
"steps": [
{
"cmd": "agents-cli run \"What went wrong in order-api.log?\"",
"cwd": "~/root-cause-agent",
"out": [
"Starting a temporary local server on port 18080 (stops automatically when done).",
"[user]: What went wrong in order-api.log?",
"[tool_call: find_errors({\"file_name\": \"order-api.log\"})]",
"[tool_response: find_errors -> {\"status\": \"success\", \"count\": 15, \"lines\": [\"10: 2026-11-07T09:00:05.902Z WARN  cache      miss key=menu:baguio-sessio …",
{
"s": "(line trimmed for the demo)",
"k": "gap"
},
"[tool_call: read_log({\"file_name\": \"order-api.log\"})]",
"[tool_response: read_log -> {\"status\": \"success\", \"content\": \"2026-11-07T08:58:01.114Z INFO  order-api  pid=4121 Starting order-api v2.4.1 (build 8f3c …",
{
"s": "(line trimmed for the demo)",
"k": "gap"
},
"",
{
"s": "Payments are failing after the v2.4.1 deploy. The payment timeout is set to",
"k": "sample"
},
{
"s": "30 ms (PAYMENT_TIMEOUT_MS=30, line 4), but the gateway takes about 400 ms to",
"k": "sample"
},
{
"s": "answer (p50=412ms, line 29). Every charge times out after 30 ms, both retries",
"k": "sample"
},
{
"s": "fail, and POST /orders/{id}/pay returns 502 (lines 14 to 19 and 23 to 28).",
"k": "sample"
},
{
"s": "",
"k": "sample"
},
{
"s": "Fix: set PAYMENT_TIMEOUT_MS back to 3000, the value v2.4.0 used, and redeploy.",
"k": "sample"
},
{
"s": "The cache miss warning on line 10 is normal and not related.",
"k": "sample"
},
"Local server stopped."
]
}
]
},
{
"id": "playground",
"title": "Open the playground, change the instruction",
"say": "The playground is the ADK web UI. Save agent.py and it reloads by itself.",
"steps": [
{
"cmd": "agents-cli playground",
"cwd": "~/root-cause-agent",
"out": [
"╭──────────────────────────────────────────────────────────────────────────────────────╮",
"│ Starting your agent playground...                                                    │",
"│                                                                                      │",
"│ Running command:       uv run adk web . --host 127.0.0.1 --port 8080 --allow_origins │",
"│ Will be available at:  http://127.0.0.1:8080/dev-ui/?app=app                         │",
"╰──────────────────────────────────────────────────────────────────────────────────────╯",
"2026-11-06 18:31:45,687 - INFO - service_factory.py:333 - Using in-memory memory service",
"2026-11-06 18:31:45,687 - INFO - local_storage.py:89 - Using per-agent session storage rooted at ~/root-cause-agent",
"2026-11-06 18:31:45,687 - INFO - local_storage.py:121 - Using per-agent artifact storage rooted at ~/root-cause-agent",
"~/root-cause-agent/.venv/lib/python3.13/site-packages/google/adk/cli/fast_api.py:320: UserWarning: [EXPERIMENTAL] InMemoryCredentialService: This feature is experimental and may change or be removed in future versions without notice. It may introduce breaking changes at any time.",
"  credential_service = InMemoryCredentialService()",
"~/root-cause-agent/.venv/lib/python3.13/site-packages/google/adk/auth/credential_service/in_memory_credential_service.py:33: UserWarning: [EXPERIMENTAL] BaseCredentialService: This feature is experimental and may change or be removed in future versions without notice. It may introduce breaking changes at any time.",
"  super().__init__()",
"INFO:     Started server process [99236]",
"INFO:     Waiting for application startup.",
"INFO:     Application startup complete.",
"INFO:     Uvicorn running on http://127.0.0.1:8080 (Press CTRL+C to quit)"
]
},
{
"edit": "app/agent.py",
"cwd": "~/root-cause-agent",
"diff": [
[
"-",
"        \"first, then read_log for context. Explain the root cause in plain \""
],
[
"-",
"        \"words, point to the log lines that prove it, and suggest one fix. \""
],
[
"+",
"        \"first, then read_log for context. Answer in three short bullet \""
],
[
"+",
"        \"points: Root cause, Evidence (quote the log lines), Fix. \""
]
]
},
{
"out": [
"INFO - agent_change_handler.py:79 - Change detected in agents directory: ~/root-cause-agent/app/agent.py"
]
}
]
},
{
"id": "eval",
"title": "Evaluate it",
"say": "eval run sends each case to the agent, then grades the answers. A missed threshold fails the run.",
"steps": [
{
"cmd": "agents-cli eval run --dataset tests/eval/datasets/root-cause.json",
"cwd": "~/root-cause-agent",
"out": [
"─────────────────────────────── Step 1/2: eval generate ────────────────────────────────",
"Booting local ADK server (app_name=app)",
"Running inference on dataset: ~/root-cause-agent/tests/eval/datasets/root-cause.json",
"Starting a temporary local server on port 18080 (stops automatically when done).",
"Server ready at http://127.0.0.1:18080",
"Discovered root_agent_name=root_cause_agent",
"",
{
"s": "───────────────────────────────── Step 2/2: eval grade ─────────────────────────────────",
"k": "sample"
},
{
"s": "RESULT: PASS",
"k": "sample"
}
]
}
]
},
{
"id": "deploy",
"title": "Deploy and publish to Gemini Enterprise",
"say": "Add Agent Runtime, deploy it, then register it in a Gemini Enterprise app. Needs a billed Google Cloud project.",
"steps": [
{
"cmd": "agents-cli scaffold enhance -d agent_runtime --yes",
"cwd": "~/root-cause-agent",
"out": [
"Agents CLI v1.13.0",
"",
"Generating templates for comparison...",
"  - Old template...",
"  - New template...",
"⚠️  Warning: --session-type cannot be used with agent_runtime deployment target, it will be unset. Agent Runtime in Gemini platform handles session management internally.",
"",
"Comparing files...",
"",
"Will auto-update (unchanged by you):",
"  ✓ README.md",
"  ✓ app/app_utils/a2a.py",
"  ✓ tests/integration/test_server_e2e.py",
"",
"Will preserve (you modified, template unchanged):",
"  ✓ tests/eval/eval_config.yaml",
"",
"Skipping (your code):",
"  - .env",
"  - app/agent.py",
"",
"Files to add:",
"  + app/app_utils/reasoning_engine_adapter.py",
"  + deployment/terraform/shared/completions.sql",
"  + deployment/terraform/shared/dummy_source.b64",
"  + deployment/terraform/shared/genai_logs_schema.json",
"  + deployment/terraform/single-project/apis.tf",
"  + deployment/terraform/single-project/iam.tf",
"  + deployment/terraform/single-project/outputs.tf",
"  + deployment/terraform/single-project/providers.tf",
"  + deployment/terraform/single-project/service.tf",
"  + deployment/terraform/single-project/service_outputs.tf",
"  + deployment/terraform/single-project/storage.tf",
"  + deployment/terraform/single-project/telemetry.tf",
"  + deployment/terraform/single-project/telemetry_outputs.tf",
"  + deployment/terraform/single-project/variables.tf",
"  + deployment/terraform/single-project/vars/env.tfvars",
"  + deployment_metadata.json",
"",
"Conflicts (both changed):",
"  ⚠  app/fast_api_app.py",
"  You'll be prompted to resolve each conflict.",
"",
"Dependency changes:",
"  + Add: google-cloud-agentplatform[agent-engines]>=2.2.0,<3.0.0",
"  + Add: google-cloud-aiplatform[evaluation]>=2.2.0,<3.0.0",
"  + Add: protobuf>=6.31.1,<7.0.0",
"",
"📦 Creating backup before modification...",
"Backup created: ~/.agents-cli/backups/enh_20261106_184244",
"",
"Resolving conflicts:",
"⚠️  Warning: Conflict: app/fast_api_app.py — keeping your version (use --prefer-new to override)",
" Dependencies updated — run agents-cli install to install the new versions.",
"Recorded changes to agents-cli-manifest.yaml.",
"",
"  Updated: 3 files",
"  Added: 16 files",
"  Removed: 0 files",
"  Conflicts: 0 updated, 1 kept yours",
"",
"✅ Enhancement complete!"
]
},
{
"cmd": "agents-cli deploy --project devfest-baguio-demo",
"cwd": "~/root-cause-agent",
"out": [
{
"s": "Deploying root-cause-agent to Agent Runtime in Gemini platform (us-east1)...",
"k": "sim"
},
{
"s": "Deployed: projects/PROJECT_NUMBER/locations/us-east1/reasoningEngines/ENGINE_ID",
"k": "sim"
}
]
},
{
"cmd": "agents-cli publish gemini --gemini-app-id projects/PROJECT_NUMBER/locations/global/collections/default_collection/engines/devfest-app --display-name \"Root cause agent\"",
"cwd": "~/root-cause-agent",
"out": [
{
"s": "Registered \"Root cause agent\" in the Gemini Enterprise app devfest-app.",
"k": "sim"
}
]
}
]
},
{
"id": "prompt",
"title": "Or: one prompt to a coding agent",
"say": "With the skills installed, one plain-English prompt is enough. The coding agent runs the same agents-cli commands you would.",
"steps": [
{
"cmd": "claude \"Use agents-cli to build a root cause agent called root-cause-agent. Give it two tools, read_log and find_errors, for the files in sample_logs/. It names the root cause, quotes the log lines and suggests one fix. Use my Gemini API key. Run it once on order-api.log.\"",
"cwd": "~",
"out": [
{
"s": "● Loading skill google-agents-cli-workflow",
"k": "sim"
},
{
"s": "● Bash(agents-cli create root-cause-agent --prototype --yes)",
"k": "sim"
},
"  ✅ Success! Your agent project is ready.",
{
"s": "● Bash(agents-cli install)",
"k": "sim"
},
"  Installed 124 packages in 283ms",
{
"s": "● Edit(app/agent.py): add read_log and find_errors, new instruction",
"k": "sim"
},
{
"s": "● Bash(uv run python -c \"...find_errors('order-api.log')['count']\")",
"k": "sim"
},
"  15",
{
"s": "● Bash(agents-cli run \"What went wrong in order-api.log?\")",
"k": "sim"
},
"  [tool_call: find_errors({\"file_name\": \"order-api.log\"})]",
"  [tool_call: read_log({\"file_name\": \"order-api.log\"})]",
{
"s": "",
"k": "sim"
},
{
"s": "Done. root-cause-agent has two tools and finds the payment timeout in order-api.log.",
"k": "sim"
},
{
"s": "Try it: cd root-cause-agent && agents-cli playground",
"k": "sim"
}
]
}
]
}
]
};
