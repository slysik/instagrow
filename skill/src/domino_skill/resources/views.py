"""View and folder operations — Basis API."""

from __future__ import annotations

from typing import Any

from domino_skill.http.transport import HttpTransport
from domino_skill.models.view import PivotEntry, ViewEntry, ViewInfo


class ViewsResource:
    """List views/folders and retrieve their entries.

    Endpoints:
        GET /api/v1/lists               — list all views/folders
        GET /api/v1/lists/{name}         — get view entries
        GET /api/v1/listspivot/{name}    — get pivoted view entries
    """

    def __init__(self, transport: HttpTransport) -> None:
        self._t = transport

    # --- Async ---

    async def list_all(self, data_source: str) -> list[ViewInfo]:
        """List all views and folders for a scope."""
        data = await self._t.get("/api/v1/lists", params={"dataSource": data_source})
        if isinstance(data, list):
            return [ViewInfo.model_validate(v) for v in data]
        return []

    async def get_entries(
        self,
        data_source: str,
        name: str,
        *,
        count: int = 100,
        start: int = 0,
        documents: bool = False,
        rich_text_as: str | None = None,
    ) -> list[ViewEntry]:
        """Get entries from a view or folder."""
        params: dict[str, Any] = {
            "dataSource": data_source,
            "count": count,
            "start": start,
        }
        if documents:
            params["documents"] = "true"
        if rich_text_as:
            params["richTextAs"] = rich_text_as

        data = await self._t.get(f"/api/v1/lists/{name}", params=params)
        if isinstance(data, list):
            return [ViewEntry.model_validate(e) for e in data]
        return []

    async def get_pivot(
        self,
        data_source: str,
        name: str,
        *,
        count: int = 100,
        start: int = 0,
    ) -> list[PivotEntry]:
        """Get pivoted/categorized view entries."""
        params: dict[str, Any] = {
            "dataSource": data_source,
            "count": count,
            "start": start,
        }
        data = await self._t.get(f"/api/v1/listspivot/{name}", params=params)
        if isinstance(data, list):
            return [PivotEntry.model_validate(e) for e in data]
        return []

    # --- Sync ---

    def list_all_sync(self, data_source: str) -> list[ViewInfo]:
        data = self._t.get_sync("/api/v1/lists", params={"dataSource": data_source})
        return [ViewInfo.model_validate(v) for v in data] if isinstance(data, list) else []

    def get_entries_sync(
        self, data_source: str, name: str, *, count: int = 100, start: int = 0, **kwargs: Any
    ) -> list[ViewEntry]:
        params: dict[str, Any] = {"dataSource": data_source, "count": count, "start": start}
        if kwargs.get("documents"):
            params["documents"] = "true"
        data = self._t.get_sync(f"/api/v1/lists/{name}", params=params)
        return [ViewEntry.model_validate(e) for e in data] if isinstance(data, list) else []

    def get_pivot_sync(
        self, data_source: str, name: str, *, count: int = 100, start: int = 0
    ) -> list[PivotEntry]:
        params: dict[str, Any] = {"dataSource": data_source, "count": count, "start": start}
        data = self._t.get_sync(f"/api/v1/listspivot/{name}", params=params)
        return [PivotEntry.model_validate(e) for e in data] if isinstance(data, list) else []
