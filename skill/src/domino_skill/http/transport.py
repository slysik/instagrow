"""HTTP transport layer — async/sync HTTP client with auth, retry, and error handling."""

from __future__ import annotations

import asyncio
import time
from typing import Any

import httpx

from domino_skill.auth.base import AuthProvider
from domino_skill.config import DominoConfig
from domino_skill.http.errors import AuthenticationError, RateLimitError, raise_for_status


class HttpTransport:
    """Dual async/sync HTTP transport for the Domino REST API.

    Features:
    - Auto-injects Authorization: Bearer header
    - Auto-refreshes token on 401
    - Retries with exponential backoff on 429/503
    - JSON serialization/deserialization
    - Stream support for binary downloads
    """

    def __init__(self, config: DominoConfig, auth: AuthProvider) -> None:
        self._config = config
        self._auth = auth
        self._base_url = config.base_url.rstrip("/")
        self._async_client: httpx.AsyncClient | None = None
        self._sync_client: httpx.Client | None = None

    # --- Async methods ---

    async def request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: Any = None,
        data: Any = None,
        headers: dict[str, str] | None = None,
        files: Any = None,
        stream: bool = False,
    ) -> httpx.Response:
        """Make an authenticated async HTTP request with retry logic."""
        client = await self._get_async_client()
        token = await self._auth.get_token()
        req_headers = {"Authorization": f"Bearer {token}"}
        if headers:
            req_headers.update(headers)

        url = f"{self._base_url}{path}"
        retries = 0

        while True:
            try:
                if stream:
                    # Caller must handle the response context
                    response = await client.request(
                        method, url, params=params, json=json, data=data,
                        headers=req_headers, files=files,
                    )
                else:
                    response = await client.request(
                        method, url, params=params, json=json, data=data,
                        headers=req_headers, files=files,
                    )

                # Handle 401 — refresh token and retry once
                if response.status_code == 401 and retries == 0:
                    token = await self._auth.refresh()
                    req_headers["Authorization"] = f"Bearer {token}"
                    retries += 1
                    continue

                # Handle rate limit and server errors with retry
                if response.status_code in (429, 503) and retries < self._config.max_retries:
                    retries += 1
                    wait = min(2 ** retries, 16)
                    await asyncio.sleep(wait)
                    continue

                # Raise on error status
                if response.status_code >= 400:
                    body = self._parse_error_body(response)
                    raise_for_status(response.status_code, body)

                return response

            except (httpx.ConnectError, httpx.ReadTimeout) as e:
                if retries < self._config.max_retries:
                    retries += 1
                    wait = min(2 ** retries, 16)
                    await asyncio.sleep(wait)
                    continue
                raise

    async def get(self, path: str, **kwargs: Any) -> Any:
        """GET request, returns parsed JSON."""
        response = await self.request("GET", path, **kwargs)
        return response.json() if response.content else None

    async def post(self, path: str, **kwargs: Any) -> Any:
        response = await self.request("POST", path, **kwargs)
        return response.json() if response.content else None

    async def put(self, path: str, **kwargs: Any) -> Any:
        response = await self.request("PUT", path, **kwargs)
        return response.json() if response.content else None

    async def patch(self, path: str, **kwargs: Any) -> Any:
        response = await self.request("PATCH", path, **kwargs)
        return response.json() if response.content else None

    async def delete(self, path: str, **kwargs: Any) -> Any:
        response = await self.request("DELETE", path, **kwargs)
        return response.json() if response.content else None

    async def get_bytes(self, path: str, **kwargs: Any) -> bytes:
        """GET request returning raw bytes (for file downloads)."""
        response = await self.request("GET", path, **kwargs)
        return response.content

    # --- Sync methods ---

    def request_sync(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: Any = None,
        data: Any = None,
        headers: dict[str, str] | None = None,
        files: Any = None,
    ) -> httpx.Response:
        """Make an authenticated sync HTTP request with retry logic."""
        client = self._get_sync_client()
        token = self._auth.get_token_sync()
        req_headers = {"Authorization": f"Bearer {token}"}
        if headers:
            req_headers.update(headers)

        url = f"{self._base_url}{path}"
        retries = 0

        while True:
            try:
                response = client.request(
                    method, url, params=params, json=json, data=data,
                    headers=req_headers, files=files,
                )

                if response.status_code == 401 and retries == 0:
                    token = self._auth.get_token_sync()
                    req_headers["Authorization"] = f"Bearer {token}"
                    retries += 1
                    continue

                if response.status_code in (429, 503) and retries < self._config.max_retries:
                    retries += 1
                    wait = min(2 ** retries, 16)
                    time.sleep(wait)
                    continue

                if response.status_code >= 400:
                    body = self._parse_error_body(response)
                    raise_for_status(response.status_code, body)

                return response

            except (httpx.ConnectError, httpx.ReadTimeout) as e:
                if retries < self._config.max_retries:
                    retries += 1
                    wait = min(2 ** retries, 16)
                    time.sleep(wait)
                    continue
                raise

    def get_sync(self, path: str, **kwargs: Any) -> Any:
        response = self.request_sync("GET", path, **kwargs)
        return response.json() if response.content else None

    def post_sync(self, path: str, **kwargs: Any) -> Any:
        response = self.request_sync("POST", path, **kwargs)
        return response.json() if response.content else None

    def put_sync(self, path: str, **kwargs: Any) -> Any:
        response = self.request_sync("PUT", path, **kwargs)
        return response.json() if response.content else None

    def patch_sync(self, path: str, **kwargs: Any) -> Any:
        response = self.request_sync("PATCH", path, **kwargs)
        return response.json() if response.content else None

    def delete_sync(self, path: str, **kwargs: Any) -> Any:
        response = self.request_sync("DELETE", path, **kwargs)
        return response.json() if response.content else None

    def get_bytes_sync(self, path: str, **kwargs: Any) -> bytes:
        response = self.request_sync("GET", path, **kwargs)
        return response.content

    # --- Client management ---

    async def _get_async_client(self) -> httpx.AsyncClient:
        if self._async_client is None or self._async_client.is_closed:
            self._async_client = httpx.AsyncClient(
                verify=self._config.verify_ssl,
                timeout=self._config.timeout,
            )
        return self._async_client

    def _get_sync_client(self) -> httpx.Client:
        if self._sync_client is None or self._sync_client.is_closed:
            self._sync_client = httpx.Client(
                verify=self._config.verify_ssl,
                timeout=self._config.timeout,
            )
        return self._sync_client

    async def close(self) -> None:
        if self._async_client and not self._async_client.is_closed:
            await self._async_client.aclose()
        if self._sync_client and not self._sync_client.is_closed:
            self._sync_client.close()

    def close_sync(self) -> None:
        if self._sync_client and not self._sync_client.is_closed:
            self._sync_client.close()

    @staticmethod
    def _parse_error_body(response: httpx.Response) -> dict | str | None:
        try:
            return response.json()
        except Exception:
            return response.text or None
