"""Evaluation framework for Domino REST API — FTS scoring, IR metrics, autoresearch loops."""

from domino_skill.evals.agent_eval import AgentEvaluator, AgentScore, AgentTestCase
from domino_skill.evals.metrics import f1, map_score, mrr, ndcg_at_k, precision_at_k, recall
from domino_skill.evals.response_eval import ResponseEvaluator, ResponseScore, ResponseTestCase
from domino_skill.evals.runner import EvalReport, EvalRunner, ExperimentResult
from domino_skill.evals.scorer import FTSScorer, ScoredResult
from domino_skill.evals.search_eval import SearchEvaluator, SearchScore, SearchTestCase

__all__ = [
    "AgentEvaluator",
    "AgentScore",
    "AgentTestCase",
    "EvalReport",
    "EvalRunner",
    "ExperimentResult",
    "FTSScorer",
    "ResponseEvaluator",
    "ResponseScore",
    "ResponseTestCase",
    "ScoredResult",
    "SearchEvaluator",
    "SearchScore",
    "SearchTestCase",
    "f1",
    "map_score",
    "mrr",
    "ndcg_at_k",
    "precision_at_k",
    "recall",
]
