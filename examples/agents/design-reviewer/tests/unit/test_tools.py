"""Offline tests for the measuring tools. No API key needed: uv run pytest tests/unit"""

from app.agent import check_touch_target, contrast_ratio


def test_black_on_white_is_21_to_1():
    out = contrast_ratio("#000000", "#FFFFFF")
    assert out == {"ratio": 21.0, "aa_normal_text": True, "aa_large_text": True}


def test_same_color_is_1_to_1():
    assert contrast_ratio("#777777", "#777777")["ratio"] == 1.0


def test_light_gray_on_white_fails_aa():
    out = contrast_ratio("#AAAAAA", "#FFFFFF")
    assert out["ratio"] == 2.32
    assert not out["aa_normal_text"] and not out["aa_large_text"]


def test_order_does_not_matter():
    assert contrast_ratio("#1A73E8", "#FFFFFF") == contrast_ratio("#FFFFFF", "#1A73E8")


def test_touch_target():
    assert check_touch_target(48, 48)["passes"]
    out = check_touch_target(36, 52)
    assert not out["passes"] and out["smallest_side_dp"] == 36
