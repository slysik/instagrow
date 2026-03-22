"""OAuth 2.0 / OIDC authentication provider."""

from __future__ import annotations

import hashlib
import secrets
import time
from base64 import urlsafe_b64encode

import httpx

from domino_skill.auth.base import AuthProvider
from domino_skill.http.errors import AuthenticationError


class OAuthProvider(AuthProvider):
    """Authenticates via OAuth 2.0 client credentials or authorization code flow.

    Supports:
    - Client credentials grant (server-to-server)
    - Token endpoint discovery via .well-known/openid-configuration
    - Token refresh via refresh_token
    - PKCE (Proof Key for Code Exchange) for public clients
    """

    def __init__(
        self,
        base_url: str,
        client_id: str,
        client_secret: str | None = None,
        token_url: str | None = None,
        scope: str = "$DATA",
        verify_ssl: bool = True,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._client_id = client_id
        self._client_secret = client_secret
        self._token_url = token_url
        self._scope = scope
        self._verify_ssl = verify_ssl
        self._access_token: str | None = None
        self._refresh_token: str | None = None
        self._token_expiry: float = 0.0
        self._code_verifier: str | None = None

    @property
    def is_expired(self) -> bool:
        if self._access_token is None:
            return True
        return time.time() >= self._token_expiry

    async def get_token(self) -> str:
        if not self.is_expired and self._access_token is not None:
            return self._access_token
        return await self.refresh()

    async def refresh(self) -> str:
        token_url = await self._resolve_token_url()

        if self._refresh_token:
            return await self._refresh_with_token(token_url)
        return await self._client_credentials_grant(token_url)

    async def _resolve_token_url(self) -> str:
        """Resolve the token endpoint, discovering via OIDC if not configured."""
        if self._token_url:
            return self._token_url

        # Try OIDC discovery
        discovery_url = f"{self._base_url}/.well-known/openid-configuration"
        async with httpx.AsyncClient(verify=self._verify_ssl) as client:
            try:
                resp = await client.get(discovery_url)
                if resp.status_code == 200:
                    data = resp.json()
                    self._token_url = data.get("token_endpoint", "")
                    if self._token_url:
                        return self._token_url
            except httpx.HTTPError:
                pass

        # Fallback to Domino default
        self._token_url = f"{self._base_url}/oauth/token"
        return self._token_url

    async def _client_credentials_grant(self, token_url: str) -> str:
        payload = {
            "grant_type": "client_credentials",
            "client_id": self._client_id,
            "scope": self._scope,
        }
        if self._client_secret:
            payload["client_secret"] = self._client_secret

        async with httpx.AsyncClient(verify=self._verify_ssl) as client:
            response = await client.post(
                token_url,
                data=payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )

        if response.status_code != 200:
            raise AuthenticationError(
                f"OAuth client credentials grant failed: {response.text}",
                status_code=response.status_code,
                response_body=response.text,
            )

        return self._process_token_response(response.json())

    async def _refresh_with_token(self, token_url: str) -> str:
        payload = {
            "grant_type": "refresh_token",
            "refresh_token": self._refresh_token,
            "client_id": self._client_id,
        }
        if self._client_secret:
            payload["client_secret"] = self._client_secret

        async with httpx.AsyncClient(verify=self._verify_ssl) as client:
            response = await client.post(
                token_url,
                data=payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )

        if response.status_code != 200:
            # Refresh failed, try full auth
            self._refresh_token = None
            return await self._client_credentials_grant(token_url)

        return self._process_token_response(response.json())

    def _process_token_response(self, data: dict) -> str:
        self._access_token = data.get("access_token", "")
        self._refresh_token = data.get("refresh_token", self._refresh_token)
        expires_in = data.get("expires_in", 3600)
        # Refresh 60 seconds before actual expiry
        self._token_expiry = time.time() + max(expires_in - 60, 0)
        return self._access_token  # type: ignore[return-value]

    def get_token_sync(self) -> str:
        if not self.is_expired and self._access_token is not None:
            return self._access_token
        return self._refresh_sync()

    def _refresh_sync(self) -> str:
        token_url = self._resolve_token_url_sync()

        if self._refresh_token:
            return self._refresh_with_token_sync(token_url)
        return self._client_credentials_grant_sync(token_url)

    def _resolve_token_url_sync(self) -> str:
        if self._token_url:
            return self._token_url

        discovery_url = f"{self._base_url}/.well-known/openid-configuration"
        with httpx.Client(verify=self._verify_ssl) as client:
            try:
                resp = client.get(discovery_url)
                if resp.status_code == 200:
                    data = resp.json()
                    self._token_url = data.get("token_endpoint", "")
                    if self._token_url:
                        return self._token_url
            except httpx.HTTPError:
                pass

        self._token_url = f"{self._base_url}/oauth/token"
        return self._token_url

    def _client_credentials_grant_sync(self, token_url: str) -> str:
        payload = {
            "grant_type": "client_credentials",
            "client_id": self._client_id,
            "scope": self._scope,
        }
        if self._client_secret:
            payload["client_secret"] = self._client_secret

        with httpx.Client(verify=self._verify_ssl) as client:
            response = client.post(
                token_url,
                data=payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )

        if response.status_code != 200:
            raise AuthenticationError(
                f"OAuth client credentials grant failed: {response.text}",
                status_code=response.status_code,
                response_body=response.text,
            )

        return self._process_token_response(response.json())

    def _refresh_with_token_sync(self, token_url: str) -> str:
        payload = {
            "grant_type": "refresh_token",
            "refresh_token": self._refresh_token,
            "client_id": self._client_id,
        }
        if self._client_secret:
            payload["client_secret"] = self._client_secret

        with httpx.Client(verify=self._verify_ssl) as client:
            response = client.post(
                token_url,
                data=payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )

        if response.status_code != 200:
            self._refresh_token = None
            return self._client_credentials_grant_sync(token_url)

        return self._process_token_response(response.json())

    @staticmethod
    def generate_pkce() -> tuple[str, str]:
        """Generate PKCE code_verifier and code_challenge pair."""
        code_verifier = secrets.token_urlsafe(96)[:128]
        digest = hashlib.sha256(code_verifier.encode("ascii")).digest()
        code_challenge = urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
        return code_verifier, code_challenge
