"""Tests for document CRUD operations."""

from __future__ import annotations

import pytest
import respx
from httpx import Response

from domino_skill.auth.basic import BasicAuthProvider
from domino_skill.config import DominoConfig
from domino_skill.http.transport import HttpTransport
from domino_skill.resources.documents import DocumentsResource


@pytest.fixture
def transport() -> HttpTransport:
    config = DominoConfig(
        base_url="https://domino.test:8880",
        auth_type="basic",
        username="admin",
        password="secret",
        verify_ssl=False,
    )
    auth = BasicAuthProvider(
        base_url=config.base_url,
        username="admin",
        password="secret",
        verify_ssl=False,
    )
    # Pre-set a token to avoid auth calls in tests
    auth._token = "test-token"
    auth._token_expiry = 9999999999.0
    return HttpTransport(config, auth)


@pytest.fixture
def docs(transport: HttpTransport) -> DocumentsResource:
    return DocumentsResource(transport)


class TestDocuments:
    @respx.mock
    @pytest.mark.asyncio
    async def test_get_document(self, docs: DocumentsResource) -> None:
        respx.get("https://domino.test:8880/api/v1/document/ABC123").mock(
            return_value=Response(
                200,
                json={
                    "@unid": "ABC123",
                    "Form": "Contact",
                    "FirstName": "John",
                    "LastName": "Doe",
                },
            )
        )

        doc = await docs.get("testdb", "ABC123")
        assert doc.unid == "ABC123"
        assert doc.form == "Contact"

    @respx.mock
    @pytest.mark.asyncio
    async def test_create_document(self, docs: DocumentsResource) -> None:
        respx.post("https://domino.test:8880/api/v1/document").mock(
            return_value=Response(
                200,
                json={
                    "@unid": "NEW456",
                    "Form": "Contact",
                    "FirstName": "Jane",
                },
            )
        )

        doc = await docs.create("testdb", "Contact", {"FirstName": "Jane"})
        assert doc.unid == "NEW456"

    @respx.mock
    @pytest.mark.asyncio
    async def test_update_document(self, docs: DocumentsResource) -> None:
        respx.put("https://domino.test:8880/api/v1/document/ABC123").mock(
            return_value=Response(
                200,
                json={
                    "@unid": "ABC123",
                    "Form": "Contact",
                    "FirstName": "Updated",
                },
            )
        )

        doc = await docs.update("testdb", "ABC123", {"FirstName": "Updated"})
        assert doc.unid == "ABC123"

    @respx.mock
    @pytest.mark.asyncio
    async def test_delete_document(self, docs: DocumentsResource) -> None:
        respx.delete("https://domino.test:8880/api/v1/document/ABC123").mock(
            return_value=Response(200, json={"status": "deleted"})
        )

        result = await docs.delete("testdb", "ABC123")
        assert result["status"] == "deleted"

    @respx.mock
    @pytest.mark.asyncio
    async def test_get_metadata(self, docs: DocumentsResource) -> None:
        respx.get("https://domino.test:8880/api/v1/docmeta/ABC123").mock(
            return_value=Response(
                200,
                json={
                    "@unid": "ABC123",
                    "Form": "Contact",
                    "@created": "2024-01-01T00:00:00Z",
                },
            )
        )

        meta = await docs.get_metadata("testdb", "ABC123")
        assert meta.unid == "ABC123"
