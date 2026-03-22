"""Scope CRUD operations — Setup API."""

from __future__ import annotations

from typing import Any

from domino_skill.http.transport import HttpTransport
from domino_skill.models.database import Scope, ScopeCreate


class ScopesResource:
    """Manage Domino REST API scopes (database access definitions).

    Endpoints:
        GET    /api/setup-v1/admin/scopes              — list all
        GET    /api/setup-v1/admin/scope?scopeName=     — get one
        POST   /api/setup-v1/admin/scope                — create
        PUT    /api/setup-v1/admin/scope                — update
        DELETE /api/setup-v1/admin/scope?scopeName=     — delete
    """

    def __init__(self, transport: HttpTransport) -> None:
        self._t = transport

    # --- Async ---

    async def list_all(self) -> list[Scope]:
        """List all configured scopes."""
        data = await self._t.get("/api/setup-v1/admin/scopes")
        if isinstance(data, list):
            return [Scope.model_validate(s) for s in data]
        return []

    async def get(self, scope_name: str) -> Scope:
        """Get a single scope by name."""
        data = await self._t.get(
            "/api/setup-v1/admin/scope", params={"scopeName": scope_name}
        )
        return Scope.model_validate(data)

    async def create(self, scope: ScopeCreate) -> Scope:
        """Create a new scope."""
        data = await self._t.post(
            "/api/setup-v1/admin/scope", json=scope.model_dump()
        )
        return Scope.model_validate(data)

    async def update(self, scope: ScopeCreate) -> Scope:
        """Update an existing scope."""
        data = await self._t.put(
            "/api/setup-v1/admin/scope", json=scope.model_dump()
        )
        return Scope.model_validate(data)

    async def delete(self, scope_name: str) -> dict:
        """Delete a scope."""
        return await self._t.delete(
            "/api/setup-v1/admin/scope", params={"scopeName": scope_name}
        )

    # --- Sync ---

    def list_all_sync(self) -> list[Scope]:
        data = self._t.get_sync("/api/setup-v1/admin/scopes")
        return [Scope.model_validate(s) for s in data] if isinstance(data, list) else []

    def get_sync(self, scope_name: str) -> Scope:
        data = self._t.get_sync(
            "/api/setup-v1/admin/scope", params={"scopeName": scope_name}
        )
        return Scope.model_validate(data)

    def create_sync(self, scope: ScopeCreate) -> Scope:
        data = self._t.post_sync(
            "/api/setup-v1/admin/scope", json=scope.model_dump()
        )
        return Scope.model_validate(data)

    def update_sync(self, scope: ScopeCreate) -> Scope:
        data = self._t.put_sync(
            "/api/setup-v1/admin/scope", json=scope.model_dump()
        )
        return Scope.model_validate(data)

    def delete_sync(self, scope_name: str) -> dict:
        return self._t.delete_sync(
            "/api/setup-v1/admin/scope", params={"scopeName": scope_name}
        )
