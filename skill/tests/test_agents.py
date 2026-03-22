"""Tests for agent operations."""

from __future__ import annotations

import pytest
import respx
from httpx import Response

from domino_skill.auth.basic import BasicAuthProvider
from domino_skill.config import DominoConfig
from domino_skill.http.transport import HttpTransport
from domino_skill.resources.agents import AgentsResource


@pytest.fixture
def agents() -> AgentsResource:
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
    return AgentsResource(HttpTransport(config, auth))


class TestAgents:
    @respx.mock
    @pytest.mark.asyncio
    async def test_run_agent(self, agents: AgentsResource) -> None:
        respx.post("https://domino.test:8880/api/v1/run/agent").mock(
            return_value=Response(200, json={
                "status": "completed",
                "agentName": "ProcessDocs",
                "result": {"processed": 5},
            })
        )

        result = await agents.run("testdb", "ProcessDocs")
        assert result.status == "completed"
        assert result.agentName == "ProcessDocs"

    @respx.mock
    @pytest.mark.asyncio
    async def test_run_async_agent(self, agents: AgentsResource) -> None:
        respx.post("https://domino.test:8880/api/v1/run/agentAsync").mock(
            return_value=Response(200, json={
                "status": "processing",
                "uuid": "async-uuid-123",
                "agentName": "LongRunning",
            })
        )

        result = await agents.run_async("testdb", "LongRunning")
        assert result.status == "processing"
        assert result.uuid == "async-uuid-123"

    @respx.mock
    @pytest.mark.asyncio
    async def test_get_async_status(self, agents: AgentsResource) -> None:
        respx.get("https://domino.test:8880/api/v1/run/agentAsync/uuid-123").mock(
            return_value=Response(200, json={
                "status": "completed",
                "uuid": "uuid-123",
            })
        )

        result = await agents.get_async_status("uuid-123")
        assert result.status == "completed"
