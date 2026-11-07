"""Offline tests: the workflow is wired in the right order. No API key, no model call."""

import re

from app.agent import analyst, fact_checker, root_agent

PLACEHOLDER = re.compile(r"\{(\w+)\}")
EDGES = {(e.from_node.name, e.to_node.name) for e in root_agent.graph.edges}


def test_edges_match_the_diagram():
    assert EDGES == {
        ("__START__", "analyst"),
        ("analyst", "exec_writer"),
        ("analyst", "team_writer"),
        ("exec_writer", "join"),
        ("team_writer", "join"),
        ("join", "fact_checker"),
    }


def test_every_placeholder_is_saved_by_an_agent_that_runs_earlier():
    agents = {n.name: n for n in root_agent.graph.nodes}

    def upstream(name):
        before = {f for f, t in EDGES if t == name}
        return before | {u for b in before for u in upstream(b)}

    for name, node in agents.items():
        if not hasattr(node, "instruction"):
            continue  # START and join have no instruction
        saved = {"dataset_csv"}  # set by the analyst's before_agent_callback
        saved |= {getattr(agents[u], "output_key", None) for u in upstream(name)}
        missing = set(PLACEHOLDER.findall(node.instruction)) - saved
        assert not missing, f"{name} reads {missing} before any agent saves it"


def test_only_the_analyst_runs_code():
    assert analyst.code_executor is not None
    assert fact_checker.code_executor is None


def test_keys():
    assert analyst.output_key == "figures"
    assert fact_checker.output_key == "brief"
