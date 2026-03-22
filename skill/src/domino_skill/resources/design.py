"""Design element access — Setup API."""

from __future__ import annotations

from typing import Any

from domino_skill.http.transport import HttpTransport


class DesignResource:
    """Access database design elements (forms, views, agents, folders).

    Endpoints:
        GET /api/setup-v1/design/{type}/{name}   — get specific design element
        GET /api/setup-v1/design/forms             — list forms
        GET /api/setup-v1/design/views             — list views
        GET /api/setup-v1/design/agents            — list agents
        GET /api/setup-v1/design/folders           — list folders
    """

    def __init__(self, transport: HttpTransport) -> None:
        self._t = transport

    # --- Async ---

    async def get_element(
        self, data_source: str, design_type: str, design_name: str
    ) -> dict:
        """Get a specific design element by type and name."""
        return await self._t.get(
            f"/api/setup-v1/design/{design_type}/{design_name}",
            params={"dataSource": data_source},
        )

    async def list_forms(self, data_source: str) -> list[dict]:
        """List all forms in a database."""
        data = await self._t.get(
            "/api/setup-v1/design/forms", params={"dataSource": data_source}
        )
        return data if isinstance(data, list) else []

    async def list_views(self, data_source: str) -> list[dict]:
        """List all views in a database."""
        data = await self._t.get(
            "/api/setup-v1/design/views", params={"dataSource": data_source}
        )
        return data if isinstance(data, list) else []

    async def list_agents(self, data_source: str) -> list[dict]:
        """List all agents in a database."""
        data = await self._t.get(
            "/api/setup-v1/design/agents", params={"dataSource": data_source}
        )
        return data if isinstance(data, list) else []

    async def list_folders(self, data_source: str) -> list[dict]:
        """List all folders in a database."""
        data = await self._t.get(
            "/api/setup-v1/design/folders", params={"dataSource": data_source}
        )
        return data if isinstance(data, list) else []

    # --- Sync ---

    def get_element_sync(
        self, data_source: str, design_type: str, design_name: str
    ) -> dict:
        return self._t.get_sync(
            f"/api/setup-v1/design/{design_type}/{design_name}",
            params={"dataSource": data_source},
        )

    def list_forms_sync(self, data_source: str) -> list[dict]:
        data = self._t.get_sync(
            "/api/setup-v1/design/forms", params={"dataSource": data_source}
        )
        return data if isinstance(data, list) else []

    def list_views_sync(self, data_source: str) -> list[dict]:
        data = self._t.get_sync(
            "/api/setup-v1/design/views", params={"dataSource": data_source}
        )
        return data if isinstance(data, list) else []

    def list_agents_sync(self, data_source: str) -> list[dict]:
        data = self._t.get_sync(
            "/api/setup-v1/design/agents", params={"dataSource": data_source}
        )
        return data if isinstance(data, list) else []

    def list_folders_sync(self, data_source: str) -> list[dict]:
        data = self._t.get_sync(
            "/api/setup-v1/design/folders", params={"dataSource": data_source}
        )
        return data if isinstance(data, list) else []
