"""Document CRUD operations — Basis API."""

from __future__ import annotations

from typing import Any

from domino_skill.http.transport import HttpTransport
from domino_skill.models.document import Document, DocumentMetadata


class DocumentsResource:
    """Manage Domino documents via the Basis REST API.

    Endpoints:
        POST   /api/v1/document             — create
        GET    /api/v1/document/{unid}       — read
        PUT    /api/v1/document/{unid}       — full update
        PATCH  /api/v1/document/{unid}       — partial update
        DELETE /api/v1/document/{unid}       — delete
        GET    /api/v1/docmeta/{unid}        — metadata
    """

    def __init__(self, transport: HttpTransport) -> None:
        self._t = transport

    # --- Async ---

    async def create(
        self,
        data_source: str,
        form: str,
        fields: dict[str, Any],
        *,
        rich_text_as: str | None = None,
        parent_unid: str | None = None,
    ) -> Document:
        """Create a new document."""
        payload: dict[str, Any] = {"Form": form, **fields}
        params: dict[str, Any] = {"dataSource": data_source}
        if rich_text_as:
            params["richTextAs"] = rich_text_as
        if parent_unid:
            params["parentUnid"] = parent_unid

        data = await self._t.post("/api/v1/document", params=params, json=payload)
        return Document.model_validate(data)

    async def get(
        self,
        data_source: str,
        unid: str,
        *,
        rich_text_as: str | None = None,
        mode: str | None = None,
    ) -> Document:
        """Retrieve a document by UNID."""
        params: dict[str, Any] = {"dataSource": data_source}
        if rich_text_as:
            params["richTextAs"] = rich_text_as
        if mode:
            params["mode"] = mode

        data = await self._t.get(f"/api/v1/document/{unid}", params=params)
        return Document.model_validate(data)

    async def update(
        self,
        data_source: str,
        unid: str,
        fields: dict[str, Any],
        *,
        mode: str | None = None,
        etag: str | None = None,
    ) -> Document:
        """Full update (PUT) of a document."""
        params: dict[str, Any] = {"dataSource": data_source}
        if mode:
            params["mode"] = mode
        headers = {}
        if etag:
            headers["If-Match"] = etag

        data = await self._t.put(
            f"/api/v1/document/{unid}", params=params, json=fields, headers=headers
        )
        return Document.model_validate(data)

    async def patch(
        self,
        data_source: str,
        unid: str,
        fields: dict[str, Any],
        *,
        mode: str | None = None,
        etag: str | None = None,
    ) -> Document:
        """Partial update (PATCH) of a document."""
        params: dict[str, Any] = {"dataSource": data_source}
        if mode:
            params["mode"] = mode
        headers = {}
        if etag:
            headers["If-Match"] = etag

        data = await self._t.patch(
            f"/api/v1/document/{unid}", params=params, json=fields, headers=headers
        )
        return Document.model_validate(data)

    async def delete(self, data_source: str, unid: str, *, mode: str | None = None) -> dict:
        """Delete a document by UNID."""
        params: dict[str, Any] = {"dataSource": data_source}
        if mode:
            params["mode"] = mode
        return await self._t.delete(f"/api/v1/document/{unid}", params=params)

    async def get_metadata(self, data_source: str, unid: str) -> DocumentMetadata:
        """Get document metadata."""
        params = {"dataSource": data_source}
        data = await self._t.get(f"/api/v1/docmeta/{unid}", params=params)
        return DocumentMetadata.model_validate(data)

    # --- Sync ---

    def create_sync(
        self, data_source: str, form: str, fields: dict[str, Any], **kwargs: Any
    ) -> Document:
        payload: dict[str, Any] = {"Form": form, **fields}
        params: dict[str, Any] = {"dataSource": data_source}
        if kwargs.get("rich_text_as"):
            params["richTextAs"] = kwargs["rich_text_as"]
        data = self._t.post_sync("/api/v1/document", params=params, json=payload)
        return Document.model_validate(data)

    def get_sync(self, data_source: str, unid: str, **kwargs: Any) -> Document:
        params: dict[str, Any] = {"dataSource": data_source}
        if kwargs.get("rich_text_as"):
            params["richTextAs"] = kwargs["rich_text_as"]
        data = self._t.get_sync(f"/api/v1/document/{unid}", params=params)
        return Document.model_validate(data)

    def update_sync(
        self, data_source: str, unid: str, fields: dict[str, Any], **kwargs: Any
    ) -> Document:
        params: dict[str, Any] = {"dataSource": data_source}
        headers = {}
        if kwargs.get("etag"):
            headers["If-Match"] = kwargs["etag"]
        data = self._t.put_sync(
            f"/api/v1/document/{unid}", params=params, json=fields, headers=headers
        )
        return Document.model_validate(data)

    def patch_sync(
        self, data_source: str, unid: str, fields: dict[str, Any], **kwargs: Any
    ) -> Document:
        params: dict[str, Any] = {"dataSource": data_source}
        headers = {}
        if kwargs.get("etag"):
            headers["If-Match"] = kwargs["etag"]
        data = self._t.patch_sync(
            f"/api/v1/document/{unid}", params=params, json=fields, headers=headers
        )
        return Document.model_validate(data)

    def delete_sync(self, data_source: str, unid: str) -> dict:
        return self._t.delete_sync(
            f"/api/v1/document/{unid}", params={"dataSource": data_source}
        )

    def get_metadata_sync(self, data_source: str, unid: str) -> DocumentMetadata:
        data = self._t.get_sync(
            f"/api/v1/docmeta/{unid}", params={"dataSource": data_source}
        )
        return DocumentMetadata.model_validate(data)
