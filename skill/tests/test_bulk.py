"""Tests for bulk operations."""

from __future__ import annotations

import pytest
import respx
from httpx import Response

from domino_skill.auth.basic import BasicAuthProvider
from domino_skill.config import DominoConfig
from domino_skill.http.transport import HttpTransport
from domino_skill.resources.bulk import BulkResource


@pytest.fixture
def bulk() -> BulkResource:
    config = DominoConfig(
        base_url="https://domino.test:8880",
        auth_type="basic", username="admin", password="secret",
        verify_ssl=False,
    )
    auth = BasicAuthProvider(
        base_url=config.base_url, username="admin", password="secret",
        verify_ssl=False,
    )
    auth._token = "test-token"
    auth._token_expiry = 9999999999.0
    return BulkResource(HttpTransport(config, auth))


class TestBulk:
    @respx.mock
    @pytest.mark.asyncio
    async def test_create_many(self, bulk: BulkResource) -> None:
        respx.post("https://domino.test:8880/api/v1/bulk/create").mock(
            return_value=Response(200, json=[
                {"@unid": "NEW1", "Form": "Contact"},
                {"@unid": "NEW2", "Form": "Contact"},
            ])
        )

        docs = await bulk.create_many("testdb", [
            {"Form": "Contact", "FirstName": "A"},
            {"Form": "Contact", "FirstName": "B"},
        ])
        assert len(docs) == 2
        assert docs[0].unid == "NEW1"

    @respx.mock
    @pytest.mark.asyncio
    async def test_delete_many(self, bulk: BulkResource) -> None:
        respx.post("https://domino.test:8880/api/v1/bulk/delete").mock(
            return_value=Response(200, json={"deleted": 2})
        )

        result = await bulk.delete_many("testdb", ["U1", "U2"])
        assert result["deleted"] == 2

    @respx.mock
    @pytest.mark.asyncio
    async def test_get_many(self, bulk: BulkResource) -> None:
        respx.post("https://domino.test:8880/api/v1/bulk/unid").mock(
            return_value=Response(200, json=[
                {"@unid": "U1", "Form": "Contact"},
                {"@unid": "U2", "Form": "Contact"},
            ])
        )

        docs = await bulk.get_many("testdb", ["U1", "U2"])
        assert len(docs) == 2
