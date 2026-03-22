"""Bulk document operations — Basis API."""

from __future__ import annotations

from typing import Any

from domino_skill.http.transport import HttpTransport
from domino_skill.models.document import Document


class BulkResource:
    """Bulk operations on Domino documents.

    Endpoints:
        POST  /api/v1/bulk/create  — batch create
        PATCH /api/v1/bulk/update  — batch update
        POST  /api/v1/bulk/delete  — batch delete
        POST  /api/v1/bulk/unid    — batch get by UNIDs
        POST  /api/v1/bulk/etag    — assign ETags
    """

    def __init__(self, transport: HttpTransport) -> None:
        self._t = transport

    # --- Async ---

    async def create_many(
        self,
        data_source: str,
        documents: list[dict[str, Any]],
        *,
        rich_text_as: str | None = None,
    ) -> list[Document]:
        """Create multiple documents in one request."""
        params: dict[str, Any] = {"dataSource": data_source}
        if rich_text_as:
            params["richTextAs"] = rich_text_as
        data = await self._t.post("/api/v1/bulk/create", params=params, json=documents)
        return [Document.model_validate(d) for d in (data if isinstance(data, list) else [])]

    async def update_many(
        self,
        data_source: str,
        documents: list[dict[str, Any]],
    ) -> list[Document]:
        """Update multiple documents."""
        params = {"dataSource": data_source}
        data = await self._t.patch("/api/v1/bulk/update", params=params, json=documents)
        return [Document.model_validate(d) for d in (data if isinstance(data, list) else [])]

    async def delete_many(
        self,
        data_source: str,
        unids: list[str],
        *,
        mode: str | None = None,
    ) -> dict:
        """Delete multiple documents by UNID."""
        params: dict[str, Any] = {"dataSource": data_source}
        if mode:
            params["mode"] = mode
        return await self._t.post(
            "/api/v1/bulk/delete", params=params, json=[{"unid": u} for u in unids]
        )

    async def get_many(
        self,
        data_source: str,
        unids: list[str],
        *,
        rich_text_as: str | None = None,
    ) -> list[Document]:
        """Get multiple documents by UNID."""
        params: dict[str, Any] = {"dataSource": data_source}
        if rich_text_as:
            params["richTextAs"] = rich_text_as
        data = await self._t.post(
            "/api/v1/bulk/unid", params=params, json=[{"unid": u} for u in unids]
        )
        return [Document.model_validate(d) for d in (data if isinstance(data, list) else [])]

    async def set_etags(self, data_source: str, unids: list[str]) -> dict:
        """Assign ETags to documents."""
        params = {"dataSource": data_source}
        return await self._t.post(
            "/api/v1/bulk/etag", params=params, json=[{"unid": u} for u in unids]
        )

    # --- Sync ---

    def create_many_sync(
        self, data_source: str, documents: list[dict[str, Any]], **kwargs: Any
    ) -> list[Document]:
        params: dict[str, Any] = {"dataSource": data_source}
        if kwargs.get("rich_text_as"):
            params["richTextAs"] = kwargs["rich_text_as"]
        data = self._t.post_sync("/api/v1/bulk/create", params=params, json=documents)
        return [Document.model_validate(d) for d in (data if isinstance(data, list) else [])]

    def update_many_sync(
        self, data_source: str, documents: list[dict[str, Any]]
    ) -> list[Document]:
        params = {"dataSource": data_source}
        data = self._t.patch_sync("/api/v1/bulk/update", params=params, json=documents)
        return [Document.model_validate(d) for d in (data if isinstance(data, list) else [])]

    def delete_many_sync(self, data_source: str, unids: list[str]) -> dict:
        return self._t.post_sync(
            "/api/v1/bulk/delete",
            params={"dataSource": data_source},
            json=[{"unid": u} for u in unids],
        )

    def get_many_sync(self, data_source: str, unids: list[str], **kwargs: Any) -> list[Document]:
        params: dict[str, Any] = {"dataSource": data_source}
        if kwargs.get("rich_text_as"):
            params["richTextAs"] = kwargs["rich_text_as"]
        data = self._t.post_sync(
            "/api/v1/bulk/unid", params=params, json=[{"unid": u} for u in unids]
        )
        return [Document.model_validate(d) for d in (data if isinstance(data, list) else [])]

    def set_etags_sync(self, data_source: str, unids: list[str]) -> dict:
        return self._t.post_sync(
            "/api/v1/bulk/etag",
            params={"dataSource": data_source},
            json=[{"unid": u} for u in unids],
        )
