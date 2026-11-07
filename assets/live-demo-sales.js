/* Sales version of the live demo slide. Playground and eval output: real recordings on November 7, 2026
   (agents-cli 1.13.0, google-adk 2.13.0). Answers: real agent answers, trimmed. Lines tagged sim: not recorded. */
window.LIVE_DEMOS = window.LIVE_DEMOS || {};
window.LIVE_DEMOS.liveDemoSales = {
 "name": "Ask your data",
 "hello": "Ask your data, on your laptop.<span>Same agent, nothing deployed. Pick a question below.</span>",
 "port": 8080,
 "note": "Real answer from the agent, trimmed. Wording varies between runs.",
 "actions": [
  {
   "tab": "setup",
   "scenes": [
    "install"
   ]
  },
  {
   "tab": "coding agent",
   "scenes": [
    "sales-prompt"
   ]
  },
  {
   "tab": "playground",
   "scene": "sales-playground",
   "then": "local"
  },
  {
   "chat": 0
  },
  {
   "tab": "eval",
   "scenes": [
    "sales-eval"
   ]
  },
  {
   "tab": "deploy",
   "scenes": [
    "sales-deploy"
   ],
   "then": "live"
  },
  {
   "chat": 1
  }
 ],
 "chats": [
  {
   "q": "What is the total revenue for the year?",
   "tools": [
    "code execution · pandas"
   ],
   "a": [
    "<b>$72,006.26</b> for the year.",
    "Revenue is <code>units * price</code> for each row, summed over all 48 rows."
   ]
  },
  {
   "q": "What's the median revenue per row, and which row is the biggest outlier above the mean?",
   "tools": [
    "code execution · pandas"
   ],
   "a": [
    "Median revenue per row: <b>$1,378.97</b>.",
    "Biggest outlier: <b>May, South, Gadget</b>, 310 units at $19.99, so <b>$6,196.90</b>. That is $4,696.77 above the mean of $1,500.13."
   ]
  },
  {
   "q": "Which region sold more, and by how much?",
   "tools": [
    "code execution · pandas"
   ],
   "a": [
    "<b>South</b>: $37,642.95 against North's $34,363.31, so <b>$3,279.64</b> more.",
    "By units it is close: 2,705 against 2,669."
   ]
  },
  {
   "q": "Which quarter had the highest revenue?",
   "tools": [
    "code execution · pandas"
   ],
   "a": [
    "<b>Q4</b>, with <b>$18,585.81</b>.",
    "Q1 $16,417.66, Q2 $18,506.44, Q3 $18,496.35."
   ]
  }
 ],
 "scenes": [
  {
   "id": "sales-prompt",
   "steps": [
    {
     "cmd": "claude \"Use agents-cli 1.13.0 and its skills to build an ADK 2 agent in a new prototype project called ask-your-data.\nDownload the sample data to app/data/sales.csv from https://joshuamdeguzman.com/agents-cli-baguio/examples/agents/ask-your-data/app/data/sales.csv\nThe agent answers questions about that CSV. Revenue for a row is units x price.\nLoad the CSV into session state with a before_agent_callback, and give the agent BuiltInCodeExecutor so it writes and runs pandas code instead of guessing.\nRound money to 2 decimals and give counts as whole numbers.\nUse gemini-3.8-flash with my Gemini API key. I will add the key to .env myself. Don't read or print .env.\nSet otel_to_cloud = False in app/fast_api_app.py. Don't deploy anything.\nWhen it's done, run: agents-cli run \\\"What is the total revenue for the year?\\\" The answer should be 72,006.26.\"",
     "cwd": "~",
     "out": [
      {
       "s": "● Loading skill google-agents-cli-workflow",
       "k": "sim"
      },
      {
       "s": "● Bash(agents-cli create ask-your-data --prototype --yes)",
       "k": "sim"
      },
      {
       "s": "● Bash(curl -L -o app/data/sales.csv ...)",
       "k": "sim"
      },
      {
       "s": "● Write(app/agent.py): before_agent_callback, BuiltInCodeExecutor",
       "k": "sim"
      },
      {
       "s": "● Edit(app/fast_api_app.py): otel_to_cloud = False",
       "k": "sim"
      },
      {
       "s": "● Bash(agents-cli install)",
       "k": "sim"
      },
      {
       "s": "● Bash(agents-cli run \"What is the total revenue for the year?\")",
       "k": "sim"
      },
      {
       "s": "  Total revenue for the year: $72,006.26",
       "k": "sim"
      },
      {
       "s": "",
       "k": "sim"
      },
      {
       "s": "Done. ask-your-data answers from pandas code it runs, not from memory.",
       "k": "sim"
      },
      {
       "s": "Try it: cd ask-your-data && agents-cli playground",
       "k": "sim"
      }
     ]
    }
   ]
  },
  {
   "id": "sales-playground",
   "steps": [
    {
     "cmd": "agents-cli playground",
     "cwd": "~/ask-your-data",
     "out": [
      "╭──────────────────────────────────────────────────────────────────────────────────────╮",
      "│ Starting your agent playground...                                                    │",
      "│                                                                                      │",
      "│ Running command:       uv run adk web . --host 127.0.0.1 --port 8080 --allow_origins │",
      "│ Will be available at:  http://127.0.0.1:8080/dev-ui/?app=app                         │",
      "╰──────────────────────────────────────────────────────────────────────────────────────╯",
      "2026-11-07 11:45:01,792 - INFO - service_factory.py:333 - Using in-memory memory service",
      "2026-11-07 11:45:01,793 - INFO - local_storage.py:89 - Using per-agent session storage rooted at ~/ask-your-data",
      "2026-11-07 11:45:01,794 - INFO - local_storage.py:121 - Using per-agent artifact storage rooted at ~/ask-your-data",
      "INFO:     Started server process [48213]",
      "INFO:     Waiting for application startup.",
      "",
      "+-----------------------------------------------------------------------------+",
      "| ADK Web Server started                                                      |",
      "|                                                                             |",
      "| For local testing, access at http://127.0.0.1:8080.                         |",
      "+-----------------------------------------------------------------------------+",
      "",
      "INFO:     Application startup complete.",
      "INFO:     Uvicorn running on http://127.0.0.1:8080 (Press CTRL+C to quit)",
      "INFO:     Shutting down",
      "INFO:     Waiting for application shutdown.",
      "",
      "+-----------------------------------------------------------------------------+",
      "| ADK Web Server shutting down...                                             |",
      "+-----------------------------------------------------------------------------+",
      "",
      "INFO:     Application shutdown complete.",
      "INFO:     Finished server process [48213]"
     ]
    }
   ]
  },
  {
   "id": "sales-eval",
   "steps": [
    {
     "cmd": "agents-cli eval run --dataset tests/eval/datasets/basic-dataset.json",
     "cwd": "~/ask-your-data",
     "out": [
      "─────────────────────────────── Step 1/2: eval generate ────────────────────────────────",
      "Booting local ADK server (app_name=app)",
      "Running inference on dataset: ~/ask-your-data/tests/eval/datasets/basic-dataset.json",
      "Starting a temporary local server on port 18080 (stops automatically when done).",
      "Server ready at http://127.0.0.1:18080",
      "Discovered root_agent_name=ask_your_data",
      "[generate] case[3] done",
      "[generate] case[0] done",
      "[generate] case[5] done",
      "[generate] case[4] done",
      "[generate] case[1] done",
      "[generate] case[2] done",
      "Traces saved to ~/ask-your-data/artifacts/traces/traces_20261107_114432.json",
      "Local server stopped.",
      "───────────────────────────────── Step 2/2: eval grade ─────────────────────────────────",
      "Loaded 2 local custom metric(s). These execute in-process; user-supplied code runs with the CLI's privileges.",
      "Loading trace file(s) from ~/ask-your-data/artifacts/traces/traces_20261107_114432.json...",
      "Loaded 6 total eval cases from 1 file(s).",
      "Running evaluation for metrics: answer_matches_truth, custom_response_quality at 15/s (--qps to change)...",
      "Dropped 6 event(s) with no content; the eval service rejects them.",
      "Saved full results to ~/ask-your-data/artifacts/grade_results/results_20261107_114505.json",
      "Saved HTML results to ~/ask-your-data/artifacts/grade_results/results_20261107_114505.html",
      "",
      "Evaluation Summary",
      "",
      "answer_matches_truth:",
      "  num_cases_total: 6",
      "  num_cases_valid: 6",
      "  num_cases_error: 0",
      "  mean_score: 1.0000",
      "  stdev_score: 0.0000",
      "  pass_rate: 1.0000",
      "",
      "custom_response_quality:",
      "  num_cases_total: 6",
      "  num_cases_valid: 6",
      "  num_cases_error: 0",
      "  mean_score: 5.0000",
      "  stdev_score: 0.0000",
      "  pass_rate: 1.0000",
      "",
      "RESULT: PASS (answer_matches_truth 1.00 >= 1.00; custom_response_quality 5.00 >= 3.00)"
     ]
    }
   ]
  },
  {
   "id": "sales-deploy",
   "steps": [
    {
     "cmd": "agents-cli scaffold enhance -d agent_runtime --yes",
     "cwd": "~/ask-your-data",
     "out": [
      {
       "s": "Added deployment files for Agent Runtime. Your app/ code is unchanged.",
       "k": "sim"
      },
      {
       "s": "✅ Enhancement complete!",
       "k": "sim"
      }
     ]
    },
    {
     "cmd": "agents-cli deploy --project devfest-baguio-demo",
     "cwd": "~/ask-your-data",
     "out": [
      {
       "s": "Deploying ask-your-data to Agent Runtime in Gemini platform (us-east1)...",
       "k": "sim"
      },
      {
       "s": "Deployed: projects/PROJECT_NUMBER/locations/us-east1/reasoningEngines/ENGINE_ID",
       "k": "sim"
      }
     ]
    },
    {
     "cmd": "agents-cli publish gemini --gemini-app-id projects/PROJECT_NUMBER/locations/global/collections/default_collection/engines/devfest-app --display-name \"Ask your data\"",
     "cwd": "~/ask-your-data",
     "out": [
      {
       "s": "Registered \"Ask your data\" in the Gemini Enterprise app devfest-app.",
       "k": "sim"
      }
     ]
    }
   ]
  }
 ]
};
