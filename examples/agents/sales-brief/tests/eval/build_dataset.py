"""Write the eval dataset. Every expected answer is computed from the CSV, not by a model.

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


def build(t: dict) -> list[dict]:
    """The brief must carry the key figures through all four agents, unchanged."""
    top = t["top"]
    q = t["quarters"]
    figures = (
        f"Total revenue {money(t['total'])}. "
        f"Q1 {money(q['Q1'])}, Q2 {money(q['Q2'])}, Q3 {money(q['Q3'])}, Q4 {money(q['Q4'])}. "
        f"North {money(t['regions']['North'])}, South {money(t['regions']['South'])}. "
        f"Top row: {top['month']}, {top['region']}, {top['product']} at {money(top['revenue'])}."
    )
    return [
        case("weekly_brief", "Make this week's sales brief.", figures),
        case("brief_for_manager", "Write the sales brief for my manager.", figures),
    ]


if __name__ == "__main__":
    cases = build(truth(load_rows()))
    (OUT / "basic-dataset.json").write_text(json.dumps({"eval_cases": cases}, indent=2) + "\n")
    print(f"wrote {len(cases)} cases to basic-dataset.json")
