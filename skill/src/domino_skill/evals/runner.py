"""Eval runner — autoresearch-style experiment loop for Domino assets."""

from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

from pydantic import BaseModel, Field

from domino_skill.evals.agent_eval import AgentEvaluator, AgentScore, AgentTestCase
from domino_skill.evals.response_eval import ResponseEvaluator, ResponseScore, ResponseTestCase
from domino_skill.evals.scorer import FTSScorer
from domino_skill.evals.search_eval import SearchEvaluator, SearchScore, SearchTestCase


class ExperimentResult(BaseModel):
    """Result of a single autoresearch-style experiment."""

    name: str = ""
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    score: float = 0.0
    baseline: float = 0.0
    improvement: float = 0.0
    kept: bool = False
    details: dict[str, Any] = Field(default_factory=dict)


class EvalReport(BaseModel):
    """Aggregated evaluation report."""

    run_id: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S"))
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    response_scores: list[ResponseScore] = Field(default_factory=list)
    agent_scores: list[AgentScore] = Field(default_factory=list)
    search_scores: list[SearchScore] = Field(default_factory=list)
    experiments: list[ExperimentResult] = Field(default_factory=list)
    composite_score: float = 0.0

    def compute_composite(self) -> float:
        """Compute the overall composite score across all eval dimensions."""
        scores: list[float] = []
        scores.extend(s.composite for s in self.response_scores)
        scores.extend(s.composite for s in self.agent_scores)
        scores.extend(s.composite for s in self.search_scores)
        self.composite_score = sum(scores) / len(scores) if scores else 0.0
        return self.composite_score


class EvalRunner:
    """Run evaluation suites and autoresearch-style experiment loops.

    Inspired by karpathy/autoresearch: one metric, autonomous iteration,
    keep-or-discard.
    """

    def __init__(
        self,
        scorer: FTSScorer | None = None,
        log_path: str | Path = "experiment_log.jsonl",
    ) -> None:
        self._scorer = scorer or FTSScorer()
        self._response_eval = ResponseEvaluator()
        self._agent_eval = AgentEvaluator()
        self._search_eval = SearchEvaluator(self._scorer)
        self._log_path = Path(log_path)
        self._best_score: float = 0.0
        self._experiments: list[ExperimentResult] = []

    # --- Eval suite execution ---

    def run_response_evals(
        self,
        cases: list[dict[str, Any]],
        responses: list[dict[str, Any]],
        statuses: list[int],
        latencies: list[float],
    ) -> list[ResponseScore]:
        """Run response quality evaluations."""
        scores: list[ResponseScore] = []
        for case_data, response, status, latency in zip(
            cases, responses, statuses, latencies
        ):
            tc = ResponseTestCase.model_validate(case_data)
            score = self._response_eval.evaluate(tc, response, status, latency)
            scores.append(score)
        return scores

    def run_agent_evals(
        self,
        cases: list[dict[str, Any]],
        agent_actions: list[dict[str, Any]],
    ) -> list[AgentScore]:
        """Run agent decision-making evaluations."""
        scores: list[AgentScore] = []
        for case_data, action in zip(cases, agent_actions):
            tc = AgentTestCase.model_validate(case_data)
            score = self._agent_eval.evaluate(
                tc,
                chosen_endpoint=action.get("endpoint", ""),
                chosen_auth=action.get("auth", "basic"),
                chosen_params=action.get("params", {}),
                api_calls_made=action.get("api_calls", 1),
                recovery_actions=action.get("recovery_actions"),
                ideal_recovery=action.get("ideal_recovery"),
            )
            scores.append(score)
        return scores

    def run_search_evals(
        self,
        cases: list[dict[str, Any]],
        results: list[dict[str, Any]],
    ) -> list[SearchScore]:
        """Run search quality evaluations."""
        scores: list[SearchScore] = []
        for case_data, result in zip(cases, results):
            tc = SearchTestCase.model_validate(case_data)
            score = self._search_eval.evaluate(
                tc,
                result_unids=result.get("unids", []),
                result_texts=result.get("texts"),
            )
            scores.append(score)
        return scores

    def run_all(self, suite: dict[str, Any]) -> EvalReport:
        """Run all evals from a test suite definition.

        Suite format:
        {
            "response_cases": [...],
            "response_data": [...],
            "agent_cases": [...],
            "agent_actions": [...],
            "search_cases": [...],
            "search_results": [...]
        }
        """
        report = EvalReport()

        if "response_cases" in suite:
            report.response_scores = self.run_response_evals(
                suite["response_cases"],
                suite.get("response_data", []),
                suite.get("response_statuses", []),
                suite.get("response_latencies", []),
            )

        if "agent_cases" in suite:
            report.agent_scores = self.run_agent_evals(
                suite["agent_cases"],
                suite.get("agent_actions", []),
            )

        if "search_cases" in suite:
            report.search_scores = self.run_search_evals(
                suite["search_cases"],
                suite.get("search_results", []),
            )

        report.compute_composite()
        return report

    def load_and_run(self, suite_path: str | Path) -> EvalReport:
        """Load a test suite from JSON and run all evals."""
        with open(suite_path) as f:
            suite = json.load(f)
        return self.run_all(suite)

    # --- Autoresearch-style experiment loop ---

    def run_experiment(
        self,
        name: str,
        modification: Callable[[], dict[str, Any]],
        evaluate: Callable[[], float],
        rollback: Callable[[], None] | None = None,
    ) -> ExperimentResult:
        """Run one experiment: apply modification, evaluate, keep/discard.

        Args:
            name: Experiment name
            modification: Function that applies the change, returns details dict
            evaluate: Function that computes the score (single float metric)
            rollback: Function to undo the change if score didn't improve
        """
        baseline = self._best_score
        details = modification()
        new_score = evaluate()
        improvement = new_score - baseline
        kept = new_score > baseline

        if not kept and rollback:
            rollback()
        elif kept:
            self._best_score = new_score

        result = ExperimentResult(
            name=name,
            score=new_score,
            baseline=baseline,
            improvement=improvement,
            kept=kept,
            details=details,
        )

        self._experiments.append(result)
        self._log_experiment(result)
        return result

    def run_loop(
        self,
        experiments: list[tuple[str, Callable[[], dict], Callable[[], float], Callable[[], None] | None]],
        budget_minutes: float = 30.0,
    ) -> EvalReport:
        """Run experiments within a time budget (autoresearch pattern).

        Args:
            experiments: List of (name, modification, evaluate, rollback) tuples
            budget_minutes: Maximum time budget in minutes
        """
        start_time = time.time()
        budget_seconds = budget_minutes * 60

        report = EvalReport()

        for name, modify, evaluate, rollback in experiments:
            if time.time() - start_time > budget_seconds:
                break
            result = self.run_experiment(name, modify, evaluate, rollback)
            report.experiments.append(result)

        report.compute_composite()
        return report

    def _log_experiment(self, result: ExperimentResult) -> None:
        """Append experiment result to JSONL log file."""
        with open(self._log_path, "a") as f:
            f.write(result.model_dump_json() + "\n")

    def get_experiment_history(self) -> list[ExperimentResult]:
        """Read all logged experiments."""
        if not self._log_path.exists():
            return []
        results: list[ExperimentResult] = []
        with open(self._log_path) as f:
            for line in f:
                line = line.strip()
                if line:
                    results.append(ExperimentResult.model_validate_json(line))
        return results

    def export_report(
        self, report: EvalReport, format: str = "json"
    ) -> str:
        """Export a report as JSON or HTML."""
        if format == "html":
            return self._to_html(report)
        return report.model_dump_json(indent=2)

    def _to_html(self, report: EvalReport) -> str:
        """Generate a simple HTML report."""
        rows: list[str] = []
        for s in report.response_scores:
            rows.append(
                f"<tr><td>Response</td><td>{s.name}</td>"
                f"<td>{s.composite:.3f}</td></tr>"
            )
        for s in report.agent_scores:
            rows.append(
                f"<tr><td>Agent</td><td>{s.name}</td>"
                f"<td>{s.composite:.3f}</td></tr>"
            )
        for s in report.search_scores:
            rows.append(
                f"<tr><td>Search</td><td>{s.name}</td>"
                f"<td>{s.composite:.3f}</td></tr>"
            )
        for e in report.experiments:
            status = "KEPT" if e.kept else "DISCARDED"
            rows.append(
                f"<tr><td>Experiment</td><td>{e.name}</td>"
                f"<td>{e.score:.3f} ({status})</td></tr>"
            )

        table_rows = "\n".join(rows)
        return f"""<!DOCTYPE html>
<html><head><title>Domino Eval Report — {report.run_id}</title>
<style>
body {{ font-family: system-ui; max-width: 900px; margin: 2rem auto; }}
table {{ border-collapse: collapse; width: 100%; }}
th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
th {{ background: #f5f5f5; }}
.score {{ font-size: 2rem; font-weight: bold; }}
</style></head><body>
<h1>Domino Skill Eval Report</h1>
<p>Run: {report.run_id} | {report.timestamp}</p>
<p class="score">Composite: {report.composite_score:.3f}</p>
<table>
<tr><th>Type</th><th>Name</th><th>Score</th></tr>
{table_rows}
</table>
</body></html>"""
