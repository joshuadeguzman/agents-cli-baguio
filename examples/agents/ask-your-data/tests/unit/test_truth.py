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


def test_median_revenue():
    assert T["median"] == Decimal("1378.97")


def test_biggest_outlier():
    top = T["top"]
    assert (top["month"], top["region"], top["product"]) == ("May", "South", "Gadget")
    assert build_dataset.money(T["top_above_mean"]) == "4,696.77"


def test_metric_passes_a_right_answer():
    out = answer_match.evaluate({"reference": "Total revenue is 72,006.26.", "response": "It's 72006.26 in total."})
    assert out["score"] == 1.0


def test_metric_fails_a_wrong_answer():
    out = answer_match.evaluate({"reference": "Total revenue is 72,006.26.", "response": "About 72,000."})
    assert out["score"] == 0.0
