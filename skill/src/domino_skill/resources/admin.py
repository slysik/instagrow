"""Admin operations — Admin API."""

from __future__ import annotations

from typing import Any

from domino_skill.http.transport import HttpTransport
from domino_skill.models.admin import ACL, ACLEntry


class AdminResource:
    """Server administration and ACL management.

    Endpoints:
        DELETE /api/admin-v1/cache                            — clear cache
        GET    /api/admin-v1/acl?dataSource=                  — get ACL
        PUT    /api/admin-v1/acl?dataSource=                  — update ACL
        DELETE /api/admin-v1/acl/roles/{role}?dataSource=     — delete role
    """

    def __init__(self, transport: HttpTransport) -> None:
        self._t = transport

    # --- Async ---

    async def clear_cache(self) -> dict:
        """Reset the Domino REST API scope and schema cache."""
        return await self._t.delete("/api/admin-v1/cache")

    async def get_acl(self, data_source: str) -> ACL:
        """Get the Access Control List for a database."""
        data = await self._t.get(
            "/api/admin-v1/acl", params={"dataSource": data_source}
        )
        return ACL.model_validate(data)

    async def update_acl(
        self, data_source: str, entries: list[dict[str, Any]]
    ) -> ACL:
        """Update the ACL for a database."""
        data = await self._t.put(
            "/api/admin-v1/acl",
            params={"dataSource": data_source},
            json={"entries": entries},
        )
        return ACL.model_validate(data)

    async def delete_role(self, data_source: str, role_name: str) -> dict:
        """Delete an ACL role."""
        return await self._t.delete(
            f"/api/admin-v1/acl/roles/{role_name}",
            params={"dataSource": data_source},
        )

    # --- Sync ---

    def clear_cache_sync(self) -> dict:
        return self._t.delete_sync("/api/admin-v1/cache")

    def get_acl_sync(self, data_source: str) -> ACL:
        data = self._t.get_sync(
            "/api/admin-v1/acl", params={"dataSource": data_source}
        )
        return ACL.model_validate(data)

    def update_acl_sync(
        self, data_source: str, entries: list[dict[str, Any]]
    ) -> ACL:
        data = self._t.put_sync(
            "/api/admin-v1/acl",
            params={"dataSource": data_source},
            json={"entries": entries},
        )
        return ACL.model_validate(data)

    def delete_role_sync(self, data_source: str, role_name: str) -> dict:
        return self._t.delete_sync(
            f"/api/admin-v1/acl/roles/{role_name}",
            params={"dataSource": data_source},
        )
