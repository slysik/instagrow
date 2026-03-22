"""Tests for authentication providers."""

from __future__ import annotations

import pytest
import respx
from httpx import Response

from domino_skill.auth.basic import BasicAuthProvider
from domino_skill.auth.oauth import OAuthProvider
from domino_skill.http.errors import AuthenticationError


class TestBasicAuth:
    @respx.mock
    @pytest.mark.asyncio
    async def test_basic_auth_success(self) -> None:
        respx.post("https://domino.test:8880/api/v1/auth").mock(
            return_value=Response(200, json={"bearer": "jwt-token-123"})
        )

        auth = BasicAuthProvider(
            base_url="https://domino.test:8880",
            username="admin",
            password="secret",
            verify_ssl=False,
        )

        token = await auth.get_token()
        assert token == "jwt-token-123"
        assert not auth.is_expired

    @respx.mock
    @pytest.mark.asyncio
    async def test_basic_auth_failure(self) -> None:
        respx.post("https://domino.test:8880/api/v1/auth").mock(
            return_value=Response(401, text="Invalid credentials")
        )

        auth = BasicAuthProvider(
            base_url="https://domino.test:8880",
            username="bad",
            password="creds",
            verify_ssl=False,
        )

        with pytest.raises(AuthenticationError):
            await auth.get_token()

    @respx.mock
    def test_basic_auth_sync(self) -> None:
        respx.post("https://domino.test:8880/api/v1/auth").mock(
            return_value=Response(200, json={"bearer": "jwt-sync-456"})
        )

        auth = BasicAuthProvider(
            base_url="https://domino.test:8880",
            username="admin",
            password="secret",
            verify_ssl=False,
        )

        token = auth.get_token_sync()
        assert token == "jwt-sync-456"

    def test_initial_state_expired(self) -> None:
        auth = BasicAuthProvider(
            base_url="https://domino.test:8880",
            username="admin",
            password="secret",
        )
        assert auth.is_expired


class TestOAuth:
    @respx.mock
    @pytest.mark.asyncio
    async def test_client_credentials_grant(self) -> None:
        respx.get("https://domino.test:8880/.well-known/openid-configuration").mock(
            return_value=Response(404)
        )
        respx.post("https://domino.test:8880/oauth/token").mock(
            return_value=Response(
                200,
                json={
                    "access_token": "oauth-token-789",
                    "token_type": "Bearer",
                    "expires_in": 3600,
                },
            )
        )

        auth = OAuthProvider(
            base_url="https://domino.test:8880",
            client_id="my-app",
            client_secret="my-secret",
            verify_ssl=False,
        )

        token = await auth.get_token()
        assert token == "oauth-token-789"
        assert not auth.is_expired

    @respx.mock
    @pytest.mark.asyncio
    async def test_oidc_discovery(self) -> None:
        respx.get("https://domino.test:8880/.well-known/openid-configuration").mock(
            return_value=Response(
                200,
                json={"token_endpoint": "https://idp.test/token"},
            )
        )
        respx.post("https://idp.test/token").mock(
            return_value=Response(
                200,
                json={
                    "access_token": "discovered-token",
                    "token_type": "Bearer",
                    "expires_in": 7200,
                },
            )
        )

        auth = OAuthProvider(
            base_url="https://domino.test:8880",
            client_id="my-app",
            client_secret="my-secret",
            verify_ssl=False,
        )

        token = await auth.get_token()
        assert token == "discovered-token"

    def test_pkce_generation(self) -> None:
        verifier, challenge = OAuthProvider.generate_pkce()
        assert len(verifier) > 40
        assert len(challenge) > 20
        assert verifier != challenge
