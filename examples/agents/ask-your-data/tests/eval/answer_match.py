"""Plain Python metric: does the answer contain every number in the expected answer?

No model call. Scores the share of expected numbers that appear in the response.
"""

import re

NUMBER = re.compile(r"\d[\d,]*(?:\.\d+)?")


def _numbers(text: str) -> set[str]:
    return {n.replace(",", "") for n in NUMBER.findall(text)}


def evaluate(instance: dict) -> dict:
    expected = _numbers(str(instance.get("reference", "")))
    expected = {n for n in expected if not re.fullmatch(r"[1-4]", n)}  # skip quarter digits like the 3 in Q3
    if not expected:
        return {"score": 1.0, "explanation": "No numbers to check."}
    found = _numbers(str(instance.get("response", "")))
    missing = sorted(expected - found)
    score = round(1 - len(missing) / len(expected), 2)
    return {"score": score, "explanation": "All numbers match." if not missing else f"Missing: {', '.join(missing)}"}
