"""Basic authentication provider — exchanges username/password for a JWT."""

from __future__ import annotations

import time

import httpx

from domino_skill.auth.base import AuthProvider
from domino_skill.http.errors import AuthenticationError


class BasicAuthProvider(AuthProvider):
    """Authenticates via POST /api/v1/auth with Domino credentials.

    The Domino REST API returns a JWT bearer token which is then used
    for all subsequent requests.
    """

    def __init__(
        self,
        base_url: str,
        username: str,
        password: str,
        scope: str = "$DATA",
        verify_ssl: bool = True,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._username = username
        self._password = password
        self._scope = scope
        self._verify_ssl = verify_ssl
        self._token: str | None = None
        self._token_expiry: float = 0.0

    @property
    def is_expired(self) -> bool:
        if self._token is None:
            return True
        return time.time() >= self._token_expiry

    async def get_token(self) -> str:
        if not self.is_expired and self._token is not None:
            return self._token
        return await self.refresh()

    async def refresh(self) -> str:
        async with httpx.AsyncClient(verify=self._verify_ssl) as client:
            response = await client.post(
                f"{self._base_url}/api/v1/auth",
                json={
                    "username": self._username,
                    "password": self._password,
                    "scope": self._scope,
                },
                headers={"Content-Type": "application/json"},
            )

        if response.status_code != 200:
            raise AuthenticationError(
                f"Basic auth failed: {response.text}",
                status_code=response.status_code,
                response_body=response.text,
            )

        data = response.json()
        self._token = data.get("bearer", "")
        # Default token lifetime: 60 minutes, refresh at 55 min
        self._token_expiry = time.time() + 55 * 60
        return self._token  # type: ignore[return-value]

    def get_token_sync(self) -> str:
        if not self.is_expired and self._token is not None:
            return self._token
        return self._refresh_sync()

    def _refresh_sync(self) -> str:
        with httpx.Client(verify=self._verify_ssl) as client:
            response = client.post(
                f"{self._base_url}/api/v1/auth",
                json={
                    "username": self._username,
                    "password": self._password,
                    "scope": self._scope,
                },
                headers={"Content-Type": "application/json"},
            )

        if response.status_code != 200:
            raise AuthenticationError(
                f"Basic auth failed: {response.text}",
                status_code=response.status_code,
                response_body=response.text,
            )

        data = response.json()
        self._token = data.get("bearer", "")
        self._token_expiry = time.time() + 55 * 60
        return self._token  # type: ignore[return-value]
