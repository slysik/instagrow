"""Agent execution operations — Basis API."""

from __future__ import annotations

from typing import Any

from domino_skill.http.transport import HttpTransport
from domino_skill.models.agent import AgentRunResult


class AgentsResource:
    """Run Domino agents via the REST API.

    Endpoints:
        POST   /api/v1/run/agent                — run agent (sync)
        POST   /api/v1/run/agentWithContext      — run agent with document UNIDs
        POST   /api/v1/run/agentAsync            — run agent (async)
        GET    /api/v1/run/agentAsync/{uuid}     — check async status
        DELETE /api/v1/run/agentAsync/{uuid}     — cancel async agent
    """

    def __init__(self, transport: HttpTransport) -> None:
        self._t = transport

    # --- Async ---

    async def run(
        self,
        data_source: str,
        agent_name: str,
    ) -> AgentRunResult:
        """Run an agent synchronously (blocks until complete)."""
        params = {"dataSource": data_source}
        data = await self._t.post(
            "/api/v1/run/agent", params=params, json={"agentName": agent_name}
        )
        return AgentRunResult.model_validate(data)

    async def run_with_context(
        self,
        data_source: str,
        agent_name: str,
        unids: list[str],
    ) -> AgentRunResult:
        """Run an agent with specific document UNIDs as context."""
        params = {"dataSource": data_source}
        data = await self._t.post(
            "/api/v1/run/agentWithContext",
            params=params,
            json={"agentName": agent_name, "unids": unids},
        )
        return AgentRunResult.model_validate(data)

    async def run_async(
        self,
        data_source: str,
        agent_name: str,
    ) -> AgentRunResult:
        """Run an agent asynchronously. Returns a UUID for status polling."""
        params = {"dataSource": data_source}
        data = await self._t.post(
            "/api/v1/run/agentAsync", params=params, json={"agentName": agent_name}
        )
        return AgentRunResult.model_validate(data)

    async def get_async_status(self, uuid: str) -> AgentRunResult:
        """Check the status of an asynchronously running agent."""
        data = await self._t.get(f"/api/v1/run/agentAsync/{uuid}")
        return AgentRunResult.model_validate(data)

    async def cancel_async(self, uuid: str) -> dict:
        """Cancel an asynchronously running agent."""
        return await self._t.delete(f"/api/v1/run/agentAsync/{uuid}")

    # --- Sync ---

    def run_sync(self, data_source: str, agent_name: str) -> AgentRunResult:
        data = self._t.post_sync(
            "/api/v1/run/agent",
            params={"dataSource": data_source},
            json={"agentName": agent_name},
        )
        return AgentRunResult.model_validate(data)

    def run_with_context_sync(
        self, data_source: str, agent_name: str, unids: list[str]
    ) -> AgentRunResult:
        data = self._t.post_sync(
            "/api/v1/run/agentWithContext",
            params={"dataSource": data_source},
            json={"agentName": agent_name, "unids": unids},
        )
        return AgentRunResult.model_validate(data)

    def run_async_sync(self, data_source: str, agent_name: str) -> AgentRunResult:
        data = self._t.post_sync(
            "/api/v1/run/agentAsync",
            params={"dataSource": data_source},
            json={"agentName": agent_name},
        )
        return AgentRunResult.model_validate(data)

    def get_async_status_sync(self, uuid: str) -> AgentRunResult:
        data = self._t.get_sync(f"/api/v1/run/agentAsync/{uuid}")
        return AgentRunResult.model_validate(data)

    def cancel_async_sync(self, uuid: str) -> dict:
        return self._t.delete_sync(f"/api/v1/run/agentAsync/{uuid}")
