"""FTS scoring engine — BM25 + TF-IDF hybrid scorer for ranking relevance."""

from __future__ import annotations

import math
import re
from collections import Counter
from typing import NamedTuple


class ScoredResult(NamedTuple):
    """A document with its relevance score."""

    index: int
    score: float
    document: str


def _tokenize(text: str) -> list[str]:
    """Simple whitespace + punctuation tokenizer with lowercasing."""
    return re.findall(r"\w+", text.lower())


class FTSScorer:
    """BM25 + TF-IDF hybrid scorer for ranking document relevance.

    Implements the Okapi BM25 ranking function and TF-IDF scoring,
    used to evaluate search quality in the Domino eval framework.
    """

    def __init__(self, corpus: list[str] | None = None) -> None:
        self._corpus: list[str] = corpus or []
        self._doc_lengths: list[int] = []
        self._avg_doc_length: float = 0.0
        self._doc_freqs: Counter[str] = Counter()
        self._n_docs: int = 0
        if corpus:
            self._build_index(corpus)

    def _build_index(self, corpus: list[str]) -> None:
        """Pre-compute document frequencies and lengths for BM25."""
        self._corpus = corpus
        self._n_docs = len(corpus)
        self._doc_lengths = []
        self._doc_freqs = Counter()

        for doc in corpus:
            tokens = _tokenize(doc)
            self._doc_lengths.append(len(tokens))
            unique_tokens = set(tokens)
            for token in unique_tokens:
                self._doc_freqs[token] += 1

        self._avg_doc_length = (
            sum(self._doc_lengths) / self._n_docs if self._n_docs > 0 else 0.0
        )

    def set_corpus(self, corpus: list[str]) -> None:
        """Set or replace the document corpus and rebuild the index."""
        self._build_index(corpus)

    def score_bm25(
        self,
        query: str,
        document: str,
        *,
        k1: float = 1.5,
        b: float = 0.75,
        doc_index: int | None = None,
    ) -> float:
        """Compute BM25 score for a single document against a query.

        Args:
            query: Search query text
            document: Document text to score
            k1: Term frequency saturation parameter (default 1.5)
            b: Length normalization parameter (default 0.75)
            doc_index: Index into the corpus (for pre-computed doc lengths)

        Returns:
            BM25 relevance score (higher = more relevant)
        """
        query_tokens = _tokenize(query)
        doc_tokens = _tokenize(document)
        doc_tf = Counter(doc_tokens)
        doc_len = len(doc_tokens)

        if doc_index is not None and doc_index < len(self._doc_lengths):
            doc_len = self._doc_lengths[doc_index]

        avg_dl = self._avg_doc_length if self._avg_doc_length > 0 else doc_len
        n_docs = self._n_docs if self._n_docs > 0 else 1

        score = 0.0
        for term in query_tokens:
            tf = doc_tf.get(term, 0)
            df = self._doc_freqs.get(term, 0)

            # IDF component with smoothing
            idf = math.log((n_docs - df + 0.5) / (df + 0.5) + 1.0)

            # BM25 TF component
            tf_norm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * doc_len / avg_dl))

            score += idf * tf_norm

        return score

    def score_tfidf(self, query: str, document: str) -> float:
        """Compute TF-IDF cosine similarity score.

        Returns:
            Cosine similarity between query and document TF-IDF vectors (0-1)
        """
        query_tokens = _tokenize(query)
        doc_tokens = _tokenize(document)
        doc_tf = Counter(doc_tokens)
        query_tf = Counter(query_tokens)

        n_docs = max(self._n_docs, 1)

        # Build TF-IDF vectors
        all_terms = set(query_tokens) | set(doc_tokens)
        query_vec: list[float] = []
        doc_vec: list[float] = []

        for term in all_terms:
            df = self._doc_freqs.get(term, 1)
            idf = math.log(n_docs / df) if df > 0 else 0.0

            q_tfidf = query_tf.get(term, 0) * idf
            d_tfidf = doc_tf.get(term, 0) * idf

            query_vec.append(q_tfidf)
            doc_vec.append(d_tfidf)

        # Cosine similarity
        dot = sum(q * d for q, d in zip(query_vec, doc_vec))
        q_norm = math.sqrt(sum(q * q for q in query_vec))
        d_norm = math.sqrt(sum(d * d for d in doc_vec))

        if q_norm == 0 or d_norm == 0:
            return 0.0

        return dot / (q_norm * d_norm)

    def score_combined(
        self,
        query: str,
        document: str,
        *,
        weights: tuple[float, float] = (0.7, 0.3),
        doc_index: int | None = None,
    ) -> float:
        """Weighted combination of BM25 and TF-IDF scores.

        Args:
            weights: (bm25_weight, tfidf_weight) — must sum to 1.0
        """
        bm25 = self.score_bm25(query, document, doc_index=doc_index)
        tfidf = self.score_tfidf(query, document)
        return weights[0] * bm25 + weights[1] * tfidf

    def rank_documents(
        self,
        query: str,
        documents: list[str] | None = None,
        *,
        top_k: int | None = None,
    ) -> list[ScoredResult]:
        """Rank documents by combined relevance score.

        Args:
            query: Search query
            documents: Documents to rank (uses corpus if None)
            top_k: Return only top K results (None = all)

        Returns:
            Sorted list of ScoredResult (highest score first)
        """
        docs = documents if documents is not None else self._corpus
        if documents is not None and documents != self._corpus:
            # Temporarily build index for these documents
            old_corpus = self._corpus
            self._build_index(docs)
            results = [
                ScoredResult(
                    index=i,
                    score=self.score_combined(query, doc, doc_index=i),
                    document=doc,
                )
                for i, doc in enumerate(docs)
            ]
            self._build_index(old_corpus)
        else:
            results = [
                ScoredResult(
                    index=i,
                    score=self.score_combined(query, doc, doc_index=i),
                    document=doc,
                )
                for i, doc in enumerate(docs)
            ]

        results.sort(key=lambda r: r.score, reverse=True)

        if top_k is not None:
            results = results[:top_k]

        return results
