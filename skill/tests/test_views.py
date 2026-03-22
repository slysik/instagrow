"""Tests for view operations."""

from __future__ import annotations

import pytest
import respx
from httpx import Response

from domino_skill.auth.basic import BasicAuthProvider
from domino_skill.config import DominoConfig
from domino_skill.http.transport import HttpTransport
from domino_skill.resources.views import ViewsResource


@pytest.fixture
def views() -> ViewsResource:
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
    return ViewsResource(HttpTransport(config, auth))


class TestViews:
    @respx.mock
    @pytest.mark.asyncio
    async def test_list_all(self, views: ViewsResource) -> None:
        respx.get("https://domino.test:8880/api/v1/lists").mock(
            return_value=Response(200, json=[
                {"name": "AllContacts", "alias": ["Contacts"]},
                {"name": "ByCompany", "alias": []},
            ])
        )

        result = await views.list_all("testdb")
        assert len(result) == 2
        assert result[0].name == "AllContacts"

    @respx.mock
    @pytest.mark.asyncio
    async def test_get_entries(self, views: ViewsResource) -> None:
        respx.get("https://domino.test:8880/api/v1/lists/AllContacts").mock(
            return_value=Response(200, json=[
                {"@unid": "U1", "FirstName": "Alice"},
                {"@unid": "U2", "FirstName": "Bob"},
            ])
        )

        entries = await views.get_entries("testdb", "AllContacts", count=10)
        assert len(entries) == 2
        assert entries[0].unid == "U1"
