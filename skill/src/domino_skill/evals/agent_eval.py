"""Agent decision-making evaluation."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class AgentTestCase(BaseModel):
    """Test case for evaluating agent decision quality."""

    name: str
    task_description: str
    optimal_endpoint: str
    optimal_params: dict[str, Any] = Field(default_factory=dict)
    optimal_auth: str = "basic"
    min_api_calls: int = 1
    context: dict[str, Any] = Field(default_factory=dict)


class AgentScore(BaseModel):
    """Evaluation score for agent decision-making."""

    name: str
    endpoint_selection: float = 0.0
    auth_method: float = 0.0
    param_accuracy: float = 0.0
    efficiency: float = 0.0
    error_recovery: float = 0.0
    composite: float = 0.0


class AgentEvaluator:
    """Evaluate the Domino agent's decision-making quality.

    Scores whether the agent chose the right endpoint, auth method,
    parameters, and did so efficiently.
    """

    def score_endpoint_selection(
        self, chosen: str, optimal: str
    ) -> float:
        """Score 0-1: did the agent pick the right endpoint?"""
        if chosen == optimal:
            return 1.0
        # Partial credit for similar endpoints
        chosen_parts = chosen.strip("/").split("/")
        optimal_parts = optimal.strip("/").split("/")
        if not optimal_parts:
            return 0.0
        matching = sum(
            1 for a, b in zip(chosen_parts, optimal_parts) if a == b
        )
        return matching / max(len(optimal_parts), len(chosen_parts))

    def score_auth_method(
        self, chosen_auth: str, optimal_auth: str
    ) -> float:
        """Score 0-1: did the agent use the appropriate auth method?"""
        return 1.0 if chosen_auth == optimal_auth else 0.0

    def score_param_accuracy(
        self, chosen_params: dict[str, Any], optimal_params: dict[str, Any]
    ) -> float:
        """Score 0-1: how well do the chosen params match the optimal ones?"""
        if not optimal_params:
            return 1.0
        correct = sum(
            1
            for k, v in optimal_params.items()
            if chosen_params.get(k) == v
        )
        return correct / len(optimal_params)

    def score_efficiency(
        self, api_calls_made: int, min_calls_needed: int
    ) -> float:
        """Score 0-1: ratio of minimum calls needed to actual calls made."""
        if api_calls_made <= 0:
            return 0.0
        if api_calls_made <= min_calls_needed:
            return 1.0
        return min_calls_needed / api_calls_made

    def score_error_recovery(
        self, recovery_actions: list[str], ideal_actions: list[str]
    ) -> float:
        """Score 0-1: how well did the agent recover from errors?"""
        if not ideal_actions:
            return 1.0
        if not recovery_actions:
            return 0.0
        matching = sum(1 for a in ideal_actions if a in recovery_actions)
        return matching / len(ideal_actions)

    def evaluate(
        self,
        test_case: AgentTestCase,
        chosen_endpoint: str,
        chosen_auth: str,
        chosen_params: dict[str, Any],
        api_calls_made: int,
        recovery_actions: list[str] | None = None,
        ideal_recovery: list[str] | None = None,
    ) -> AgentScore:
        """Run all scoring dimensions and produce a composite score."""
        endpoint = self.score_endpoint_selection(
            chosen_endpoint, test_case.optimal_endpoint
        )
        auth = self.score_auth_method(chosen_auth, test_case.optimal_auth)
        params = self.score_param_accuracy(
            chosen_params, test_case.optimal_params
        )
        efficiency = self.score_efficiency(
            api_calls_made, test_case.min_api_calls
        )
        error_rec = self.score_error_recovery(
            recovery_actions or [], ideal_recovery or []
        )

        composite = (
            0.30 * endpoint
            + 0.15 * auth
            + 0.25 * params
            + 0.20 * efficiency
            + 0.10 * error_rec
        )

        return AgentScore(
            name=test_case.name,
            endpoint_selection=endpoint,
            auth_method=auth,
            param_accuracy=params,
            efficiency=efficiency,
            error_recovery=error_rec,
            composite=composite,
        )
