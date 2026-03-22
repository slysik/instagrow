"""Attachment operations — Basis API."""

from __future__ import annotations

from pathlib import Path
from typing import Any, BinaryIO

from domino_skill.http.transport import HttpTransport
from domino_skill.models.document import Attachment


class AttachmentsResource:
    """Upload and download file attachments on Domino documents.

    Endpoints:
        GET  /api/v1/attachments/{unid}/{name}  — download
        POST /api/v1/attachments/{unid}          — upload
    """

    def __init__(self, transport: HttpTransport) -> None:
        self._t = transport

    # --- Async ---

    async def download(
        self,
        data_source: str,
        unid: str,
        attachment_name: str,
    ) -> Attachment:
        """Download an attachment by name."""
        params = {"dataSource": data_source}
        content = await self._t.get_bytes(
            f"/api/v1/attachments/{unid}/{attachment_name}", params=params
        )
        return Attachment(name=attachment_name, data=content, size=len(content))

    async def upload(
        self,
        data_source: str,
        unid: str,
        file: BinaryIO | Path | bytes,
        filename: str,
        content_type: str = "application/octet-stream",
    ) -> dict:
        """Upload an attachment to a document."""
        params = {"dataSource": data_source}

        if isinstance(file, Path):
            file_bytes = file.read_bytes()
        elif isinstance(file, bytes):
            file_bytes = file
        else:
            file_bytes = file.read()

        files = {"file": (filename, file_bytes, content_type)}
        response = await self._t.request(
            "POST",
            f"/api/v1/attachments/{unid}",
            params=params,
            files=files,
        )
        return response.json() if response.content else {}

    # --- Sync ---

    def download_sync(
        self, data_source: str, unid: str, attachment_name: str
    ) -> Attachment:
        params = {"dataSource": data_source}
        content = self._t.get_bytes_sync(
            f"/api/v1/attachments/{unid}/{attachment_name}", params=params
        )
        return Attachment(name=attachment_name, data=content, size=len(content))

    def upload_sync(
        self,
        data_source: str,
        unid: str,
        file: BinaryIO | Path | bytes,
        filename: str,
        content_type: str = "application/octet-stream",
    ) -> dict:
        params = {"dataSource": data_source}

        if isinstance(file, Path):
            file_bytes = file.read_bytes()
        elif isinstance(file, bytes):
            file_bytes = file
        else:
            file_bytes = file.read()

        files = {"file": (filename, file_bytes, content_type)}
        response = self._t.request_sync(
            "POST",
            f"/api/v1/attachments/{unid}",
            params=params,
            files=files,
        )
        return response.json() if response.content else {}
