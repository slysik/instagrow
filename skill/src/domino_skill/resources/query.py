"""Query and formula execution — Basis API."""

from __future__ import annotations

from typing import Any

from domino_skill.http.transport import HttpTransport
from domino_skill.models.document import Document


class QueryResource:
    """Execute DQL queries and formulas against Domino databases.

    Endpoints:
        POST /api/v1/query            — DQL query
        POST /api/v1/query/qrp/json   — QRP (Query Results Processor) query
        POST /api/v1/run/formula       — Run a Domino formula
    """

    def __init__(self, transport: HttpTransport) -> None:
        self._t = transport

    # --- Async ---

    async def execute_dql(
        self,
        data_source: str,
        query: str,
        *,
        max_scan_docs: int | None = None,
        max_scan_entries: int | None = None,
        rich_text_as: str | None = None,
    ) -> list[Document]:
        """Execute a DQL (Domino Query Language) query."""
        params: dict[str, Any] = {"dataSource": data_source}
        if rich_text_as:
            params["richTextAs"] = rich_text_as

        payload: dict[str, Any] = {"query": query}
        if max_scan_docs is not None:
            payload["maxScanDocs"] = max_scan_docs
        if max_scan_entries is not None:
            payload["maxScanEntries"] = max_scan_entries

        data = await self._t.post("/api/v1/query", params=params, json=payload)
        if isinstance(data, list):
            return [Document.model_validate(d) for d in data]
        return []

    async def execute_qrp(
        self,
        data_source: str,
        query: str,
        *,
        max_scan_docs: int | None = None,
    ) -> list[Document]:
        """Execute a QRP (Query Results Processor) query returning JSON."""
        params: dict[str, Any] = {"dataSource": data_source}
        payload: dict[str, Any] = {"query": query}
        if max_scan_docs is not None:
            payload["maxScanDocs"] = max_scan_docs

        data = await self._t.post("/api/v1/query/qrp/json", params=params, json=payload)
        if isinstance(data, list):
            return [Document.model_validate(d) for d in data]
        return []

    async def run_formula(
        self,
        data_source: str,
        formula: str,
        *,
        max_scan_docs: int | None = None,
    ) -> Any:
        """Run a Domino formula on the server."""
        params: dict[str, Any] = {"dataSource": data_source}
        payload: dict[str, Any] = {"formula": formula}
        if max_scan_docs is not None:
            payload["maxScanDocs"] = max_scan_docs

        return await self._t.post("/api/v1/run/formula", params=params, json=payload)

    # --- Sync ---

    def execute_dql_sync(
        self, data_source: str, query: str, **kwargs: Any
    ) -> list[Document]:
        params: dict[str, Any] = {"dataSource": data_source}
        if kwargs.get("rich_text_as"):
            params["richTextAs"] = kwargs["rich_text_as"]

        payload: dict[str, Any] = {"query": query}
        if kwargs.get("max_scan_docs") is not None:
            payload["maxScanDocs"] = kwargs["max_scan_docs"]

        data = self._t.post_sync("/api/v1/query", params=params, json=payload)
        return [Document.model_validate(d) for d in data] if isinstance(data, list) else []

    def execute_qrp_sync(self, data_source: str, query: str, **kwargs: Any) -> list[Document]:
        params = {"dataSource": data_source}
        payload: dict[str, Any] = {"query": query}
        if kwargs.get("max_scan_docs") is not None:
            payload["maxScanDocs"] = kwargs["max_scan_docs"]

        data = self._t.post_sync("/api/v1/query/qrp/json", params=params, json=payload)
        return [Document.model_validate(d) for d in data] if isinstance(data, list) else []

    def run_formula_sync(self, data_source: str, formula: str, **kwargs: Any) -> Any:
        params = {"dataSource": data_source}
        payload: dict[str, Any] = {"formula": formula}
        if kwargs.get("max_scan_docs") is not None:
            payload["maxScanDocs"] = kwargs["max_scan_docs"]

        return self._t.post_sync("/api/v1/run/formula", params=params, json=payload)
