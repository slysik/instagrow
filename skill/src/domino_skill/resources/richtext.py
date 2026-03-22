"""Rich text retrieval — Basis API."""

from __future__ import annotations

from typing import Any

from domino_skill.http.transport import HttpTransport
from domino_skill.models.document import RichTextContent


class RichTextResource:
    """Retrieve rich text content from documents in various formats.

    Endpoints:
        GET /api/v1/richtextprocessors              — list available processors
        GET /api/v1/richtext/html/{unid}             — as HTML
        GET /api/v1/richtext/markdown/{unid}          — as Markdown
        GET /api/v1/richtext/mime/{unid}              — as MIME
        GET /api/v1/richtext/plain/{unid}             — as plain text
    """

    def __init__(self, transport: HttpTransport) -> None:
        self._t = transport

    # --- Async ---

    async def get_processors(self) -> list[str]:
        """List available rich text processing methods."""
        data = await self._t.get("/api/v1/richtextprocessors")
        return data if isinstance(data, list) else []

    async def get_as_html(self, data_source: str, unid: str) -> RichTextContent:
        """Get rich text as HTML."""
        data = await self._t.get(
            f"/api/v1/richtext/html/{unid}", params={"dataSource": data_source}
        )
        return RichTextContent(content=str(data), format="html")

    async def get_as_markdown(self, data_source: str, unid: str) -> RichTextContent:
        """Get rich text as Markdown."""
        data = await self._t.get(
            f"/api/v1/richtext/markdown/{unid}", params={"dataSource": data_source}
        )
        return RichTextContent(content=str(data), format="markdown")

    async def get_as_mime(self, data_source: str, unid: str) -> RichTextContent:
        """Get rich text as MIME."""
        data = await self._t.get(
            f"/api/v1/richtext/mime/{unid}", params={"dataSource": data_source}
        )
        return RichTextContent(content=str(data), format="mime")

    async def get_as_plain(self, data_source: str, unid: str) -> RichTextContent:
        """Get rich text as plain text."""
        data = await self._t.get(
            f"/api/v1/richtext/plain/{unid}", params={"dataSource": data_source}
        )
        return RichTextContent(content=str(data), format="plain")

    # --- Sync ---

    def get_processors_sync(self) -> list[str]:
        data = self._t.get_sync("/api/v1/richtextprocessors")
        return data if isinstance(data, list) else []

    def get_as_html_sync(self, data_source: str, unid: str) -> RichTextContent:
        data = self._t.get_sync(
            f"/api/v1/richtext/html/{unid}", params={"dataSource": data_source}
        )
        return RichTextContent(content=str(data), format="html")

    def get_as_markdown_sync(self, data_source: str, unid: str) -> RichTextContent:
        data = self._t.get_sync(
            f"/api/v1/richtext/markdown/{unid}", params={"dataSource": data_source}
        )
        return RichTextContent(content=str(data), format="markdown")

    def get_as_mime_sync(self, data_source: str, unid: str) -> RichTextContent:
        data = self._t.get_sync(
            f"/api/v1/richtext/mime/{unid}", params={"dataSource": data_source}
        )
        return RichTextContent(content=str(data), format="mime")

    def get_as_plain_sync(self, data_source: str, unid: str) -> RichTextContent:
        data = self._t.get_sync(
            f"/api/v1/richtext/plain/{unid}", params={"dataSource": data_source}
        )
        return RichTextContent(content=str(data), format="plain")
