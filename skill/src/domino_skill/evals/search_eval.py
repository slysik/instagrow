"""Search/query result evaluation with FTS relevance scoring."""

from __future__ import annotations

from pydantic import BaseModel, Field

from domino_skill.evals.metrics import (
    f1,
    mrr,
    ndcg_at_k,
    precision_at_k,
    recall,
)
from domino_skill.evals.scorer import FTSScorer


class SearchTestCase(BaseModel):
    """Test case for evaluating search/query results."""

    name: str
    query: str
    data_source: str
    relevant_unids: list[str] = Field(default_factory=list)
    relevance_grades: dict[str, int] = Field(default_factory=dict)
    k: int = 10


class SearchScore(BaseModel):
    """Evaluation score for search results."""

    name: str
    precision: float = 0.0
    recall_score: float = 0.0
    f1_score: float = 0.0
    ndcg: float = 0.0
    mrr_score: float = 0.0
    fts_relevance: float = 0.0
    composite: float = 0.0


class SearchEvaluator:
    """Evaluate search and query result quality using IR metrics + FTS scoring."""

    def __init__(self, scorer: FTSScorer | None = None) -> None:
        self._scorer = scorer or FTSScorer()

    def score_relevance(
        self,
        query: str,
        result_texts: list[str],
        relevant_unids: list[str],
        result_unids: list[str],
    ) -> float:
        """Average BM25 score of relevant documents found in results."""
        if not result_texts or not relevant_unids:
            return 0.0

        self._scorer.set_corpus(result_texts)
        relevant_set = set(relevant_unids)
        scores: list[float] = []
        for i, (unid, text) in enumerate(zip(result_unids, result_texts)):
            if unid in relevant_set:
                scores.append(self._scorer.score_bm25(query, text, doc_index=i))

        if not scores:
            return 0.0
        max_score = max(scores) if scores else 1.0
        return sum(scores) / (len(scores) * max_score) if max_score > 0 else 0.0

    def evaluate(
        self,
        test_case: SearchTestCase,
        result_unids: list[str],
        result_texts: list[str] | None = None,
    ) -> SearchScore:
        """Run all search quality metrics and produce a composite score."""
        relevant_set = set(test_case.relevant_unids)

        p = precision_at_k(result_unids, relevant_set, test_case.k)
        r = recall(result_unids, relevant_set)
        f = f1(result_unids, relevant_set, test_case.k)
        n = ndcg_at_k(result_unids, test_case.relevance_grades, test_case.k)

        # MRR with single query
        m = mrr([result_unids], [relevant_set])

        # FTS relevance if texts available
        fts = 0.0
        if result_texts:
            fts = self.score_relevance(
                test_case.query, result_texts,
                test_case.relevant_unids, result_unids,
            )

        composite = (
            0.25 * p
            + 0.15 * r
            + 0.10 * f
            + 0.25 * n
            + 0.15 * m
            + 0.10 * fts
        )

        return SearchScore(
            name=test_case.name,
            precision=p,
            recall_score=r,
            f1_score=f,
            ndcg=n,
            mrr_score=m,
            fts_relevance=fts,
            composite=composite,
        )
