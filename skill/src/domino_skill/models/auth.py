"""Authentication-related models."""

from __future__ import annotations

from pydantic import BaseModel, Field


class TokenResponse(BaseModel):
    """JWT token response from Domino REST API auth endpoint."""

    bearer: str = Field(description="JWT bearer token")
    lepiqueToken: str | None = Field(default=None, description="Legacy LTPA token")
    claims: dict | None = Field(default=None, description="Decoded JWT claims")


class OAuthTokenResponse(BaseModel):
    """Standard OAuth 2.0 token response."""

    access_token: str
    token_type: str = "Bearer"
    expires_in: int | None = None
    refresh_token: str | None = None
    scope: str | None = None


class Credentials(BaseModel):
    """User credentials for authentication."""

    username: str
    password: str
