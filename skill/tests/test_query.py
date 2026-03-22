"""Tests for query operations."""

from __future__ import annotations

import pytest
import respx
from httpx import Response

from domino_skill.auth.basic import BasicAuthProvider
from domino_skill.config import DominoConfig
from domino_skill.http.transport import HttpTransport
from domino_skill.resources.query import QueryResource


@pytest.fixture
def query() -> QueryResource:
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
    return QueryResource(HttpTransport(config, auth))


class TestQuery:
    @respx.mock
    @pytest.mark.asyncio
    async def test_execute_dql(self, query: QueryResource) -> None:
        respx.post("https://domino.test:8880/api/v1/query").mock(
            return_value=Response(200, json=[
                {"@unid": "U1", "Form": "Contact", "FirstName": "Alice"},
            ])
        )

        docs = await query.execute_dql("testdb", "Form = 'Contact'")
        assert len(docs) == 1
        assert docs[0].unid == "U1"

    @respx.mock
    @pytest.mark.asyncio
    async def test_run_formula(self, query: QueryResource) -> None:
        respx.post("https://domino.test:8880/api/v1/run/formula").mock(
            return_value=Response(200, json={"result": "Hello World"})
        )

        result = await query.run_formula("testdb", '"Hello " + "World"')
        assert result["result"] == "Hello World"
