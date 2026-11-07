"""Offline tests: the ground truth script and the answer metric. No API key needed."""

import sys
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "eval"))

import answer_match  # noqa: E402
import build_dataset  # noqa: E402

T = build_dataset.truth(build_dataset.load_rows())


def test_total_revenue():
    assert T["total"] == Decimal("72006.26")


def test_quarters():
    assert {q: build_dataset.money(v) for q, v in T["quarters"].items()} == {
        "Q1": "16,417.66", "Q2": "18,506.44", "Q3": "18,496.35", "Q4": "18,585.81"}


def test_top_row():
    top = T["top"]
    assert (top["month"], top["region"], top["product"]) == ("May", "South", "Gadget")
    assert build_dataset.money(top["revenue"]) == "6,196.90"


def test_metric_fails_a_brief_with_a_changed_number():
    ref = "Total revenue 72,006.26. South 37,642.95."
    assert answer_match.evaluate({"reference": ref, "response": "Revenue was 72,006.26, South 37,642.95."})["score"] == 1.0
    assert answer_match.evaluate({"reference": ref, "response": "Revenue was 72,006.26, South 37,000."})["score"] == 0.5
