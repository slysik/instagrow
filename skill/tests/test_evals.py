"""Tests for the eval framework — FTS scoring, IR metrics, evaluators."""

from __future__ import annotations

import pytest

from domino_skill.evals.agent_eval import AgentEvaluator, AgentTestCase
from domino_skill.evals.metrics import f1, map_score, mrr, ndcg_at_k, precision_at_k, recall
from domino_skill.evals.response_eval import ResponseEvaluator, ResponseTestCase
from domino_skill.evals.runner import EvalRunner
from domino_skill.evals.scorer import FTSScorer
from domino_skill.evals.search_eval import SearchEvaluator, SearchTestCase


class TestFTSScorer:
    def test_bm25_basic(self) -> None:
        corpus = [
            "the quick brown fox jumps over the lazy dog",
            "the lazy dog sleeps all day",
            "quick brown foxes are beautiful animals",
            "python programming is fun and rewarding",
        ]
        scorer = FTSScorer(corpus)

        score1 = scorer.score_bm25("quick fox", corpus[0])
        score2 = scorer.score_bm25("quick fox", corpus[3])
        # "quick fox" should score higher on the doc containing those words
        assert score1 > score2

    def test_tfidf_basic(self) -> None:
        corpus = [
            "domino rest api documents views",
            "python sdk for domino",
            "completely unrelated text about cooking",
        ]
        scorer = FTSScorer(corpus)

        score1 = scorer.score_tfidf("domino api", corpus[0])
        score2 = scorer.score_tfidf("domino api", corpus[2])
        assert score1 > score2

    def test_rank_documents(self) -> None:
        docs = [
            "the cat sat on the mat",
            "the dog ran in the park",
            "cats and dogs are great pets",
        ]
        scorer = FTSScorer(docs)

        results = scorer.rank_documents("cat pets")
        assert len(results) == 3
        # Results should be sorted by score descending
        assert results[0].score >= results[1].score >= results[2].score

    def test_rank_top_k(self) -> None:
        docs = ["doc a", "doc b", "doc c", "doc d", "doc e"]
        scorer = FTSScorer(docs)
        results = scorer.rank_documents("doc", top_k=2)
        assert len(results) == 2

    def test_combined_score(self) -> None:
        scorer = FTSScorer(["hello world", "goodbye world"])
        score = scorer.score_combined("hello", "hello world")
        assert score > 0

    def test_empty_corpus(self) -> None:
        scorer = FTSScorer()
        score = scorer.score_bm25("query", "document text")
        assert isinstance(score, float)


class TestIRMetrics:
    def test_precision_at_k(self) -> None:
        retrieved = ["d1", "d2", "d3", "d4", "d5"]
        relevant = {"d1", "d3", "d5"}

        assert precision_at_k(retrieved, relevant, k=3) == pytest.approx(2 / 3)
        assert precision_at_k(retrieved, relevant, k=5) == pytest.approx(3 / 5)
        assert precision_at_k(retrieved, relevant, k=1) == 1.0

    def test_recall(self) -> None:
        retrieved = ["d1", "d2", "d3"]
        relevant = {"d1", "d3", "d5", "d7"}

        assert recall(retrieved, relevant) == pytest.approx(2 / 4)

    def test_f1(self) -> None:
        retrieved = ["d1", "d2", "d3"]
        relevant = {"d1", "d3"}

        f1_score = f1(retrieved, relevant, k=3)
        assert f1_score > 0

    def test_ndcg_at_k_perfect(self) -> None:
        retrieved = ["d1", "d2", "d3"]
        grades = {"d1": 3, "d2": 2, "d3": 1}

        # Perfect ranking should give NDCG = 1.0
        assert ndcg_at_k(retrieved, grades, k=3) == pytest.approx(1.0)

    def test_ndcg_at_k_imperfect(self) -> None:
        retrieved = ["d3", "d1", "d2"]  # Worst ranked first
        grades = {"d1": 3, "d2": 2, "d3": 1}

        score = ndcg_at_k(retrieved, grades, k=3)
        assert 0 < score < 1.0

    def test_mrr(self) -> None:
        retrieved_lists = [
            ["d2", "d1", "d3"],  # First relevant at position 2
            ["d1", "d2", "d3"],  # First relevant at position 1
        ]
        relevant_sets = [{"d1"}, {"d1"}]

        assert mrr(retrieved_lists, relevant_sets) == pytest.approx((0.5 + 1.0) / 2)

    def test_map_score(self) -> None:
        retrieved_lists = [["d1", "d2", "d3"]]
        relevant_sets = [{"d1", "d3"}]

        score = map_score(retrieved_lists, relevant_sets)
        assert 0 < score <= 1.0

    def test_empty_inputs(self) -> None:
        assert precision_at_k([], set(), k=5) == 0.0
        assert recall([], set()) == 0.0
        assert ndcg_at_k([], {}, k=5) == 0.0
        assert mrr([], []) == 0.0


class TestResponseEvaluator:
    def test_completeness(self) -> None:
        evaluator = ResponseEvaluator()
        response = {"name": "John", "email": "j@x.com"}
        score = evaluator.score_completeness(
            response, ["name", "email", "phone"]
        )
        assert score == pytest.approx(2 / 3)

    def test_correctness(self) -> None:
        evaluator = ResponseEvaluator()
        response = {"name": "John", "age": 30}
        score = evaluator.score_correctness(
            response, {"name": "John", "age": 25}
        )
        assert score == pytest.approx(0.5)

    def test_latency_within_threshold(self) -> None:
        evaluator = ResponseEvaluator()
        assert evaluator.score_latency(100, 500) == 1.0

    def test_latency_over_threshold(self) -> None:
        evaluator = ResponseEvaluator()
        score = evaluator.score_latency(1000, 500)
        assert 0 < score < 1.0

    def test_evaluate_composite(self) -> None:
        evaluator = ResponseEvaluator()
        tc = ResponseTestCase(
            name="test",
            endpoint="/api/v1/document",
            expected_fields=["name"],
            expected_values={"name": "John"},
        )
        score = evaluator.evaluate(
            tc,
            response={"name": "John"},
            actual_status=200,
            response_time_ms=100,
        )
        assert score.composite > 0
        assert score.name == "test"


class TestAgentEvaluator:
    def test_endpoint_selection_exact(self) -> None:
        evaluator = AgentEvaluator()
        assert evaluator.score_endpoint_selection(
            "/api/v1/document", "/api/v1/document"
        ) == 1.0

    def test_endpoint_selection_partial(self) -> None:
        evaluator = AgentEvaluator()
        score = evaluator.score_endpoint_selection(
            "/api/v1/document", "/api/v1/query"
        )
        assert 0 < score < 1.0

    def test_efficiency(self) -> None:
        evaluator = AgentEvaluator()
        assert evaluator.score_efficiency(1, 1) == 1.0
        assert evaluator.score_efficiency(5, 1) == pytest.approx(0.2)

    def test_evaluate_composite(self) -> None:
        evaluator = AgentEvaluator()
        tc = AgentTestCase(
            name="test",
            task_description="Get a document",
            optimal_endpoint="/api/v1/document",
            optimal_params={"dataSource": "mydb"},
            optimal_auth="basic",
            min_api_calls=1,
        )
        score = evaluator.evaluate(
            tc,
            chosen_endpoint="/api/v1/document",
            chosen_auth="basic",
            chosen_params={"dataSource": "mydb"},
            api_calls_made=1,
        )
        assert score.composite == pytest.approx(1.0)


class TestSearchEvaluator:
    def test_evaluate(self) -> None:
        scorer = FTSScorer(["doc about cats", "doc about dogs", "doc about birds"])
        evaluator = SearchEvaluator(scorer)
        tc = SearchTestCase(
            name="test",
            query="cats",
            data_source="testdb",
            relevant_unids=["u1"],
            relevance_grades={"u1": 3},
            k=3,
        )
        score = evaluator.evaluate(
            tc,
            result_unids=["u1", "u2", "u3"],
            result_texts=["doc about cats", "doc about dogs", "doc about birds"],
        )
        assert score.precision > 0
        assert score.composite > 0


class TestEvalRunner:
    def test_run_all_empty(self) -> None:
        runner = EvalRunner()
        report = runner.run_all({})
        assert report.composite_score == 0.0

    def test_run_response_evals(self) -> None:
        runner = EvalRunner()
        cases = [{"name": "t1", "endpoint": "/test", "expected_fields": ["x"]}]
        responses = [{"x": 1}]
        statuses = [200]
        latencies = [50.0]

        scores = runner.run_response_evals(cases, responses, statuses, latencies)
        assert len(scores) == 1
        assert scores[0].name == "t1"

    def test_experiment_keep_or_discard(self) -> None:
        runner = EvalRunner(log_path="/tmp/test_experiment.jsonl")
        runner._best_score = 0.5

        # Experiment that improves
        result = runner.run_experiment(
            "improve",
            modification=lambda: {"change": "better"},
            evaluate=lambda: 0.8,
        )
        assert result.kept is True
        assert runner._best_score == 0.8

        # Experiment that doesn't improve
        result = runner.run_experiment(
            "regress",
            modification=lambda: {"change": "worse"},
            evaluate=lambda: 0.3,
        )
        assert result.kept is False
        assert runner._best_score == 0.8  # Unchanged

    def test_export_html(self) -> None:
        from domino_skill.evals.runner import EvalReport

        runner = EvalRunner()
        report = EvalReport()
        html = runner.export_report(report, format="html")
        assert "<html>" in html
        assert "Domino Skill Eval Report" in html
