"""Tests for DominoClient."""

from __future__ import annotations

import pytest

from domino_skill.client import DominoClient
from domino_skill.config import DominoConfig


class TestDominoClient:
    def test_create_with_config(self) -> None:
        config = DominoConfig(
            base_url="https://domino.test:8880",
            auth_type="basic",
            username="admin",
            password="secret",
        )
        client = DominoClient(config=config)
        assert client.config.base_url == "https://domino.test:8880"
        assert client.documents is not None
        assert client.bulk is not None
        assert client.views is not None
        assert client.query is not None
        assert client.agents is not None
        assert client.richtext is not None
        assert client.attachments is not None
        assert client.scopes is not None
        assert client.design is not None
        assert client.admin is not None
        assert client.pim is not None

    def test_create_with_kwargs(self) -> None:
        client = DominoClient(
            base_url="https://domino.test:8880",
            username="admin",
            password="secret",
        )
        assert client.config.auth_type == "basic"

    def test_create_oauth_client(self) -> None:
        client = DominoClient(
            base_url="https://domino.test:8880",
            auth_type="oauth",
            client_id="my-app",
            client_secret="my-secret",
        )
        assert client.config.auth_type == "oauth"

    def test_basic_auth_requires_credentials(self) -> None:
        with pytest.raises(ValueError, match="username and password"):
            DominoClient(base_url="https://domino.test:8880", auth_type="basic")

    def test_oauth_requires_client_id(self) -> None:
        with pytest.raises(ValueError, match="client_id"):
            DominoClient(base_url="https://domino.test:8880", auth_type="oauth")

    def test_context_manager_sync(self) -> None:
        with DominoClient(
            base_url="https://domino.test:8880",
            username="admin",
            password="secret",
        ) as client:
            assert client.documents is not None

    @pytest.mark.asyncio
    async def test_context_manager_async(self) -> None:
        async with DominoClient(
            base_url="https://domino.test:8880",
            username="admin",
            password="secret",
        ) as client:
            assert client.documents is not None
