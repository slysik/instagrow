"""Tests for admin operations."""

from __future__ import annotations

import pytest
import respx
from httpx import Response

from domino_skill.auth.basic import BasicAuthProvider
from domino_skill.config import DominoConfig
from domino_skill.http.transport import HttpTransport
from domino_skill.resources.admin import AdminResource


@pytest.fixture
def admin() -> AdminResource:
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
    return AdminResource(HttpTransport(config, auth))


class TestAdmin:
    @respx.mock
    @pytest.mark.asyncio
    async def test_clear_cache(self, admin: AdminResource) -> None:
        respx.delete("https://domino.test:8880/api/admin-v1/cache").mock(
            return_value=Response(200, json={"status": "ok"})
        )

        result = await admin.clear_cache()
        assert result["status"] == "ok"

    @respx.mock
    @pytest.mark.asyncio
    async def test_get_acl(self, admin: AdminResource) -> None:
        respx.get("https://domino.test:8880/api/admin-v1/acl").mock(
            return_value=Response(200, json={
                "entries": [
                    {"name": "admin", "level": "Manager", "roles": ["[Admin]"]},
                ],
                "roles": ["[Admin]", "[User]"],
            })
        )

        acl = await admin.get_acl("testdb")
        assert len(acl.entries) == 1
        assert acl.entries[0].name == "admin"
        assert "[Admin]" in acl.roles
