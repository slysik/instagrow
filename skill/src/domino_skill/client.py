"""DominoClient — single entry point for the Domino REST API SDK."""

from __future__ import annotations

from typing import Any

from domino_skill.auth.base import AuthProvider
from domino_skill.auth.basic import BasicAuthProvider
from domino_skill.auth.oauth import OAuthProvider
from domino_skill.config import DominoConfig
from domino_skill.http.transport import HttpTransport
from domino_skill.resources.admin import AdminResource
from domino_skill.resources.agents import AgentsResource
from domino_skill.resources.attachments import AttachmentsResource
from domino_skill.resources.bulk import BulkResource
from domino_skill.resources.design import DesignResource
from domino_skill.resources.documents import DocumentsResource
from domino_skill.resources.pim import PIMResource
from domino_skill.resources.query import QueryResource
from domino_skill.resources.richtext import RichTextResource
from domino_skill.resources.scopes import ScopesResource
from domino_skill.resources.views import ViewsResource


class DominoClient:
    """Main entry point for interacting with the HCL Domino REST API.

    Provides access to all API resource groups via namespaced properties.
    Supports both synchronous and asynchronous usage patterns.

    Usage (sync):
        client = DominoClient(base_url="https://domino:8880",
                              username="admin", password="secret")
        doc = client.documents.get_sync("mydb", "UNID123")

    Usage (async):
        async with DominoClient(base_url="https://domino:8880",
                                username="admin", password="secret") as client:
            doc = await client.documents.get("mydb", "UNID123")

    Usage (from env):
        client = DominoClient()  # reads from DOMINO_* env vars
    """

    def __init__(
        self,
        config: DominoConfig | None = None,
        *,
        base_url: str | None = None,
        auth_type: str = "basic",
        username: str | None = None,
        password: str | None = None,
        client_id: str | None = None,
        client_secret: str | None = None,
        oauth_token_url: str | None = None,
        scope: str = "$DATA",
        verify_ssl: bool = True,
        timeout: float = 30.0,
        **kwargs: Any,
    ) -> None:
        if config is not None:
            self.config = config
        elif base_url is not None:
            self.config = DominoConfig(
                base_url=base_url,
                auth_type=auth_type,  # type: ignore[arg-type]
                username=username,
                password=password,
                client_id=client_id,
                client_secret=client_secret,
                oauth_token_url=oauth_token_url,
                scope=scope,
                verify_ssl=verify_ssl,
                timeout=timeout,
            )
        else:
            self.config = DominoConfig.from_env()

        self._auth = self._build_auth()
        self._transport = HttpTransport(self.config, self._auth)

        # Resource namespaces — Basis API
        self.documents = DocumentsResource(self._transport)
        self.bulk = BulkResource(self._transport)
        self.views = ViewsResource(self._transport)
        self.query = QueryResource(self._transport)
        self.agents = AgentsResource(self._transport)
        self.richtext = RichTextResource(self._transport)
        self.attachments = AttachmentsResource(self._transport)

        # Setup API
        self.scopes = ScopesResource(self._transport)
        self.design = DesignResource(self._transport)

        # Admin API
        self.admin = AdminResource(self._transport)

        # PIM API
        self.pim = PIMResource(self._transport)

    def _build_auth(self) -> AuthProvider:
        """Build the appropriate auth provider based on config."""
        if self.config.auth_type == "oauth":
            if not self.config.client_id:
                raise ValueError("client_id required for OAuth authentication")
            return OAuthProvider(
                base_url=self.config.base_url,
                client_id=self.config.client_id,
                client_secret=self.config.client_secret,
                token_url=self.config.oauth_token_url,
                scope=self.config.oauth_scope,
                verify_ssl=self.config.verify_ssl,
            )
        else:
            if not self.config.username or not self.config.password:
                raise ValueError("username and password required for basic authentication")
            return BasicAuthProvider(
                base_url=self.config.base_url,
                username=self.config.username,
                password=self.config.password,
                scope=self.config.scope,
                verify_ssl=self.config.verify_ssl,
            )

    # --- Context managers ---

    async def __aenter__(self) -> DominoClient:
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self._transport.close()

    def __enter__(self) -> DominoClient:
        return self

    def __exit__(self, *args: Any) -> None:
        self._transport.close_sync()

    async def close(self) -> None:
        """Close underlying HTTP connections."""
        await self._transport.close()

    def close_sync(self) -> None:
        """Close underlying HTTP connections (sync)."""
        self._transport.close_sync()
