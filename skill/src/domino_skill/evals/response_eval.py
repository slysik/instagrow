"""API response quality evaluation."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ResponseTestCase(BaseModel):
    """Test case for evaluating an API response."""

    name: str
    endpoint: str
    method: str = "GET"
    params: dict[str, Any] = Field(default_factory=dict)
    expected_status: int = 200
    expected_fields: list[str] = Field(default_factory=list)
    expected_values: dict[str, Any] | None = None
    max_latency_ms: float = 5000.0


class ResponseScore(BaseModel):
    """Evaluation score for an API response."""

    name: str
    completeness: float = 0.0
    correctness: float = 0.0
    latency: float = 0.0
    error_handling: float = 0.0
    composite: float = 0.0


class ResponseEvaluator:
    """Grade the quality and completeness of Domino REST API responses."""

    def score_completeness(
        self, response: dict[str, Any], expected_fields: list[str]
    ) -> float:
        """Score 0-1: what fraction of expected fields are present?"""
        if not expected_fields:
            return 1.0
        present = sum(1 for f in expected_fields if f in response)
        return present / len(expected_fields)

    def score_correctness(
        self, response: dict[str, Any], expected_values: dict[str, Any]
    ) -> float:
        """Score 0-1: what fraction of expected values match exactly?"""
        if not expected_values:
            return 1.0
        correct = sum(
            1 for k, v in expected_values.items() if response.get(k) == v
        )
        return correct / len(expected_values)

    def score_latency(
        self, response_time_ms: float, threshold_ms: float
    ) -> float:
        """Score 0-1: 1.0 if within threshold, decaying linearly to 0 at 3x threshold."""
        if response_time_ms <= threshold_ms:
            return 1.0
        if response_time_ms >= threshold_ms * 3:
            return 0.0
        return 1.0 - (response_time_ms - threshold_ms) / (threshold_ms * 2)

    def score_error_handling(
        self, actual_status: int, expected_status: int
    ) -> float:
        """Score 0-1: did we get the expected HTTP status?"""
        return 1.0 if actual_status == expected_status else 0.0

    def evaluate(
        self,
        test_case: ResponseTestCase,
        response: dict[str, Any],
        actual_status: int,
        response_time_ms: float,
    ) -> ResponseScore:
        """Run all scoring dimensions and produce a composite score."""
        completeness = self.score_completeness(response, test_case.expected_fields)
        correctness = self.score_correctness(
            response, test_case.expected_values or {}
        )
        latency = self.score_latency(response_time_ms, test_case.max_latency_ms)
        error_handling = self.score_error_handling(
            actual_status, test_case.expected_status
        )

        # Weighted composite
        composite = (
            0.35 * completeness
            + 0.30 * correctness
            + 0.20 * latency
            + 0.15 * error_handling
        )

        return ResponseScore(
            name=test_case.name,
            completeness=completeness,
            correctness=correctness,
            latency=latency,
            error_handling=error_handling,
            composite=composite,
        )
