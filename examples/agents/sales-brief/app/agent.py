"""Weekly sales brief: four agents chained in one ADK Workflow.

START -> analyst -> (exec_writer, team_writer) -> join -> fact_checker

Each agent saves its answer in session state with output_key. The next agent reads it
with a {placeholder} in its instruction. The Workflow edges say who runs after whom.
"""

from pathlib import Path

from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.code_executors import BuiltInCodeExecutor
from google.adk.models import Gemini
from google.adk.workflow import JoinNode, Workflow
from google.genai import types

MODEL = Gemini(model="gemini-3.8-flash", retry_options=types.HttpRetryOptions(attempts=3))

# 48 rows of monthly sales: month, quarter, region, product, units, price.
DATASET = Path(__file__).resolve().parent / "data" / "sales.csv"


async def load_dataset(callback_context):
    """Put the CSV into session state so the analyst's instruction can include it."""
    callback_context.state["dataset_csv"] = DATASET.read_text()


# 1. Computes the numbers. The only agent that runs code.
analyst = Agent(
    name="analyst",
    model=MODEL,
    instruction=(
        "You are a data analyst. Revenue for a row is units x price. Write pandas code that "
        "loads the CSV below, run it, and report these numbers, rounded to 2 decimals:\n"
        "- total revenue\n- revenue by quarter\n- revenue by region\n- units by product\n"
        "- the single row with the highest revenue: month, region, product and revenue\n"
        "Report only computed numbers, as a short list. No advice.\n\n{dataset_csv}"
    ),
    code_executor=BuiltInCodeExecutor(),
    before_agent_callback=load_dataset,
    output_key="figures",
)

# 2a and 2b. Two writers, same figures, different readers. The edges run them at the same time.
exec_writer = Agent(
    name="exec_writer",
    model=MODEL,
    instruction=(
        "Write a 3-bullet summary of the year for a busy manager, using only these figures. "
        "Include the total, every quarter, both regions and the top row. "
        "Copy numbers exactly. No new numbers.\n\nFIGURES:\n{figures}"
    ),
    output_key="exec_summary",
)

team_writer = Agent(
    name="team_writer",
    model=MODEL,
    instruction=(
        "Suggest 2 concrete actions for the sales team next quarter, each tied to one of these "
        "figures. Copy numbers exactly. No new numbers.\n\nFIGURES:\n{figures}"
    ),
    output_key="team_actions",
)

# 3. Checks every number the writers used against the analyst's figures.
fact_checker = Agent(
    name="fact_checker",
    model=MODEL,
    instruction=(
        "You are a fact checker. Check every number in the SUMMARY and ACTIONS against the "
        "FIGURES. Then output the final brief in markdown: a 'Summary' section, an 'Actions' "
        "section, and a last line 'Checked: all numbers match' or 'Checked: fixed N numbers'. "
        "Fix any number that does not match the FIGURES.\n\n"
        "FIGURES:\n{figures}\n\nSUMMARY:\n{exec_summary}\n\nACTIONS:\n{team_actions}"
    ),
    output_key="brief",
)

# Waits for both writers before the fact checker starts.
join = JoinNode(name="join")

root_agent = Workflow(
    name="sales_brief",
    description="Turns the sales CSV into a checked weekly brief.",
    # A tuple in the chain runs those agents at the same time.
    edges=[("START", analyst, (exec_writer, team_writer), join, fact_checker)],
)

app = App(root_agent=root_agent, name="app")
