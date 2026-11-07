from pathlib import Path

from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.code_executors import BuiltInCodeExecutor
from google.adk.models import Gemini
from google.genai import types

MODEL = "gemini-3.8-flash"

# 48 rows of monthly sales: month, quarter, region, product, units, price.
DATASET = Path(__file__).resolve().parent / "data" / "sales.csv"


async def load_dataset(callback_context):
    """Put the CSV into session state so the instruction can include it."""
    callback_context.state["dataset_csv"] = DATASET.read_text()


root_agent = Agent(
    name="ask_your_data",
    model=Gemini(model=MODEL, retry_options=types.HttpRetryOptions(attempts=3)),
    instruction=(
        "You are a data analyst for the sales CSV below. Revenue for a row is units x price. "
        "For every question, write pandas code that loads the CSV from the text below, run it, "
        "and answer with the computed numbers. Round money to 2 decimals and give counts as whole numbers. Never estimate a number "
        "you did not compute. Say which rows or columns you used.\n\n"
        "{dataset_csv}"
    ),
    code_executor=BuiltInCodeExecutor(),
    before_agent_callback=load_dataset,
)

app = App(root_agent=root_agent, name="app")
