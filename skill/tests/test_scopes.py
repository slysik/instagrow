"""Tests for scope operations."""

from __future__ import annotations

import pytest
import respx
from httpx import Response

from domino_skill.auth.basic import BasicAuthProvider
from domino_skill.config import DominoConfig
from domino_skill.http.transport import HttpTransport
from domino_skill.models.database import ScopeCreate
from domino_skill.resources.scopes import ScopesResource


@pytest.fixture
def scopes() -> ScopesResource:
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
    return ScopesResource(HttpTransport(config, auth))


class TestScopes:
    @respx.mock
    @pytest.mark.asyncio
    async def test_list_all(self, scopes: ScopesResource) -> None:
        respx.get("https://domino.test:8880/api/setup-v1/admin/scopes").mock(
            return_value=Response(200, json=[
                {"apiName": "db1", "nsfPath": "db1.nsf", "isActive": True},
                {"apiName": "db2", "nsfPath": "db2.nsf", "isActive": False},
            ])
        )

        result = await scopes.list_all()
        assert len(result) == 2
        assert result[0].apiName == "db1"

    @respx.mock
    @pytest.mark.asyncio
    async def test_create_scope(self, scopes: ScopesResource) -> None:
        respx.post("https://domino.test:8880/api/setup-v1/admin/scope").mock(
            return_value=Response(200, json={
                "apiName": "newdb",
                "schemaName": "newdb-schema",
                "nsfPath": "newdb.nsf",
                "isActive": True,
            })
        )

        new_scope = ScopeCreate(
            apiName="newdb",
            schemaName="newdb-schema",
            nsfPath="newdb.nsf",
        )
        result = await scopes.create(new_scope)
        assert result.apiName == "newdb"

    @respx.mock
    @pytest.mark.asyncio
    async def test_delete_scope(self, scopes: ScopesResource) -> None:
        respx.delete("https://domino.test:8880/api/setup-v1/admin/scope").mock(
            return_value=Response(200, json={"status": "deleted"})
        )

        result = await scopes.delete("olddb")
        assert result["status"] == "deleted"
