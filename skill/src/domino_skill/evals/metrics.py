"""Information Retrieval metrics — Precision, Recall, NDCG, MRR, MAP."""

from __future__ import annotations

import math


def precision_at_k(
    retrieved: list[str], relevant: set[str], k: int = 10
) -> float:
    """Precision@K — fraction of top-K results that are relevant.

    Args:
        retrieved: Ordered list of retrieved document IDs
        relevant: Set of relevant document IDs (ground truth)
        k: Cutoff rank

    Returns:
        Precision@K score (0.0 to 1.0)
    """
    if k <= 0:
        return 0.0
    top_k = retrieved[:k]
    if not top_k:
        return 0.0
    relevant_in_k = sum(1 for doc_id in top_k if doc_id in relevant)
    return relevant_in_k / len(top_k)


def recall(retrieved: list[str], relevant: set[str]) -> float:
    """Recall — fraction of relevant documents that were retrieved.

    Args:
        retrieved: List of retrieved document IDs
        relevant: Set of relevant document IDs (ground truth)

    Returns:
        Recall score (0.0 to 1.0)
    """
    if not relevant:
        return 0.0
    retrieved_set = set(retrieved)
    found = len(relevant & retrieved_set)
    return found / len(relevant)


def f1(retrieved: list[str], relevant: set[str], k: int = 10) -> float:
    """F1 score — harmonic mean of precision@K and recall.

    Args:
        retrieved: Ordered list of retrieved document IDs
        relevant: Set of relevant document IDs
        k: Cutoff rank for precision

    Returns:
        F1 score (0.0 to 1.0)
    """
    p = precision_at_k(retrieved, relevant, k)
    r = recall(retrieved, relevant)
    if p + r == 0:
        return 0.0
    return 2 * p * r / (p + r)


def ndcg_at_k(
    retrieved: list[str],
    relevance_grades: dict[str, int],
    k: int = 10,
) -> float:
    """Normalized Discounted Cumulative Gain at K.

    Measures ranking quality considering graded relevance.

    Args:
        retrieved: Ordered list of retrieved document IDs
        relevance_grades: Mapping of document ID → relevance grade (0-3)
        k: Cutoff rank

    Returns:
        NDCG@K score (0.0 to 1.0)
    """
    if k <= 0 or not relevance_grades:
        return 0.0

    # DCG for the retrieved ranking
    dcg = 0.0
    for i, doc_id in enumerate(retrieved[:k]):
        grade = relevance_grades.get(doc_id, 0)
        dcg += (2**grade - 1) / math.log2(i + 2)  # i+2 because log2(1)=0

    # Ideal DCG — sort all grades descending
    ideal_grades = sorted(relevance_grades.values(), reverse=True)[:k]
    idcg = 0.0
    for i, grade in enumerate(ideal_grades):
        idcg += (2**grade - 1) / math.log2(i + 2)

    if idcg == 0:
        return 0.0

    return dcg / idcg


def mrr(retrieved_lists: list[list[str]], relevant_sets: list[set[str]]) -> float:
    """Mean Reciprocal Rank — average of reciprocal ranks of first relevant result.

    Args:
        retrieved_lists: List of retrieved document ID lists (one per query)
        relevant_sets: List of relevant document ID sets (one per query)

    Returns:
        MRR score (0.0 to 1.0)
    """
    if not retrieved_lists:
        return 0.0

    reciprocal_ranks: list[float] = []
    for retrieved, relevant in zip(retrieved_lists, relevant_sets):
        rr = 0.0
        for rank, doc_id in enumerate(retrieved, start=1):
            if doc_id in relevant:
                rr = 1.0 / rank
                break
        reciprocal_ranks.append(rr)

    return sum(reciprocal_ranks) / len(reciprocal_ranks)


def map_score(
    retrieved_lists: list[list[str]], relevant_sets: list[set[str]]
) -> float:
    """Mean Average Precision — average of per-query average precision.

    Args:
        retrieved_lists: List of retrieved document ID lists
        relevant_sets: List of relevant document ID sets

    Returns:
        MAP score (0.0 to 1.0)
    """
    if not retrieved_lists:
        return 0.0

    avg_precisions: list[float] = []
    for retrieved, relevant in zip(retrieved_lists, relevant_sets):
        if not relevant:
            avg_precisions.append(0.0)
            continue

        hits = 0
        precision_sum = 0.0
        for rank, doc_id in enumerate(retrieved, start=1):
            if doc_id in relevant:
                hits += 1
                precision_sum += hits / rank

        ap = precision_sum / len(relevant)
        avg_precisions.append(ap)

    return sum(avg_precisions) / len(avg_precisions)
