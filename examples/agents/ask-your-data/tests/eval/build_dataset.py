"""Write the eval datasets. Every expected answer is computed from the CSV, not by a model.

Run: uv run python tests/eval/build_dataset.py
"""

import csv
import json
import statistics
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CSV = ROOT / "app" / "data" / "sales.csv"
OUT = Path(__file__).resolve().parent / "datasets"


def money(x: Decimal) -> str:
    return f"{x.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP):,}"


def load_rows() -> list[dict]:
    with CSV.open() as f:
        rows = list(csv.DictReader(f))
    for r in rows:
        r["revenue"] = Decimal(r["units"]) * Decimal(r["price"])
    return rows


def truth(rows: list[dict]) -> dict:
    revs = [r["revenue"] for r in rows]
    mean = sum(revs) / len(revs)
    top = max(rows, key=lambda r: r["revenue"])
    by = lambda key: {k: sum(r["revenue"] for r in rows if r[key] == k) for k in sorted({r[key] for r in rows})}  # noqa: E731
    quarters = by("quarter")
    best_q = max(quarters, key=quarters.get)
    units = {p: sum(int(r["units"]) for r in rows if r["product"] == p) for p in ("Widget", "Gadget")}
    return {
        "total": sum(revs),
        "median": Decimal(statistics.median(revs)),
        "mean": mean,
        "top": top,
        "top_above_mean": top["revenue"] - mean,
        "regions": by("region"),
        "quarters": quarters,
        "best_quarter": best_q,
        "units": units,
        "south_widget_units": sum(int(r["units"]) for r in rows if r["region"] == "South" and r["product"] == "Widget"),
    }


def case(case_id: str, question: str, answer: str) -> dict:
    return {
        "eval_case_id": case_id,
        "prompt": {"role": "user", "parts": [{"text": question}]},
        "reference": {"response": {"role": "model", "parts": [{"text": answer}]}},
    }


def build(t: dict) -> tuple[list[dict], list[dict]]:
    top = t["top"]
    basic = [
        case("total_revenue", "What is the total revenue for the year?",
             f"Total revenue for the year is {money(t['total'])}."),
        case("median_revenue", "What's the median revenue per row?",
             f"The median revenue per row is {money(t['median'])}."),
        case("biggest_outlier", "Which row is the biggest outlier above the mean, and by how much?",
             f"{top['month']}, {top['region']}, {top['product']} at {money(top['revenue'])}, "
             f"which is {money(t['top_above_mean'])} above the mean."),
        case("revenue_by_region", "What is the revenue for each region?",
             f"North: {money(t['regions']['North'])}. South: {money(t['regions']['South'])}."),
        case("units_by_product", "How many units of each product were sold?",
             f"Widget: {t['units']['Widget']} units. Gadget: {t['units']['Gadget']} units."),
        case("best_quarter", "Which quarter had the highest revenue?",
             f"{t['best_quarter']}, with {money(t['quarters'][t['best_quarter']])}."),
    ]
    holdout = [
        case("q3_revenue", "What was the revenue in Q3?", f"Q3 revenue was {money(t['quarters']['Q3'])}."),
        case("south_widget_units", "How many Widgets did the South region sell?",
             f"The South region sold {t['south_widget_units']} Widgets."),
        case("mean_revenue", "What is the average revenue per row?",
             f"The average revenue per row is {money(t['mean'])}."),
    ]
    return basic, holdout


if __name__ == "__main__":
    basic, holdout = build(truth(load_rows()))
    for name, cases in (("basic-dataset.json", basic), ("holdout-dataset.json", holdout)):
        (OUT / name).write_text(json.dumps({"eval_cases": cases}, indent=2) + "\n")
        print(f"wrote {len(cases)} cases to {name}")
