from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types


def _luminance(hex_color: str) -> float:
    rgb = [int(hex_color.lstrip("#")[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def contrast_ratio(foreground: str, background: str) -> dict:
    """Compute the WCAG contrast ratio between a text color and its background.

    Use this for every text color you can read from the screenshot. Do not
    guess contrast by eye.

    Args:
        foreground: Text color as hex, for example "#777777".
        background: Background color as hex, for example "#FFFFFF".

    Returns:
        A dict with the ratio and whether it passes WCAG AA for normal
        text (4.5:1) and large text (3:1).
    """
    a, b = _luminance(foreground), _luminance(background)
    ratio = (max(a, b) + 0.05) / (min(a, b) + 0.05)
    return {"ratio": round(ratio, 2), "aa_normal_text": ratio >= 4.5, "aa_large_text": ratio >= 3}


def check_touch_target(width_dp: float, height_dp: float) -> dict:
    """Check a tappable element against the 48 x 48 dp minimum touch target.

    Args:
        width_dp: Width of the element in dp.
        height_dp: Height of the element in dp.

    Returns:
        A dict with "passes" and the smallest side.
    """
    passes = width_dp >= 48 and height_dp >= 48
    return {"passes": passes, "smallest_side_dp": min(width_dp, height_dp)}


root_agent = Agent(
    name="design_reviewer",
    model=Gemini(model="gemini-3.8-flash", retry_options=types.HttpRetryOptions(attempts=3)),
    instruction=(
        "You review mobile app screens. The user attaches a screenshot. Check "
        "hierarchy, spacing and alignment by looking. Check text contrast with "
        "contrast_ratio and tap targets with check_touch_target, never by eye. "
        "Return the top five issues, most important first, each with a fix."
    ),
    tools=[contrast_ratio, check_touch_target],
)

app = App(root_agent=root_agent, name="app")
