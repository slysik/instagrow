"""Configuration management for Domino REST API SDK."""

from __future__ import annotations

import os
from typing import Literal

from dotenv import load_dotenv
from pydantic import BaseModel, Field


class DominoConfig(BaseModel):
    """Configuration for connecting to an HCL Domino REST API server."""

    base_url: str = Field(
        description="Base URL of the Domino REST API server, e.g. https://domino.example.com:8880"
    )
    auth_type: Literal["basic", "oauth"] = Field(
        default="basic",
        description="Authentication type: 'basic' (username/password) or 'oauth' (OAuth 2.0 / OIDC)",
    )

    # Basic auth credentials
    username: str | None = Field(default=None, description="Username for basic auth")
    password: str | None = Field(default=None, description="Password for basic auth")

    # OAuth 2.0 / OIDC credentials
    oauth_token_url: str | None = Field(
        default=None,
        description="OAuth token endpoint URL. If not set, discovered via .well-known/openid-configuration",
    )
    client_id: str | None = Field(default=None, description="OAuth client ID")
    client_secret: str | None = Field(default=None, description="OAuth client secret")
    oauth_scope: str = Field(
        default="$DATA", description="OAuth scope to request"
    )

    # Connection settings
    scope: str = Field(
        default="$DATA",
        description="Default Domino scope (dataSource) for API operations",
    )
    verify_ssl: bool = Field(default=True, description="Verify SSL certificates")
    timeout: float = Field(default=30.0, description="Request timeout in seconds")
    max_retries: int = Field(
        default=3, description="Maximum retries on 429/503 responses"
    )

    @classmethod
    def from_env(cls, dotenv_path: str | None = None) -> DominoConfig:
        """Load configuration from environment variables and optional .env file."""
        load_dotenv(dotenv_path)
        return cls(
            base_url=os.environ.get("DOMINO_BASE_URL", "http://localhost:8880"),
            auth_type=os.environ.get("DOMINO_AUTH_TYPE", "basic"),  # type: ignore[arg-type]
            username=os.environ.get("DOMINO_USERNAME"),
            password=os.environ.get("DOMINO_PASSWORD"),
            oauth_token_url=os.environ.get("DOMINO_OAUTH_TOKEN_URL"),
            client_id=os.environ.get("DOMINO_CLIENT_ID"),
            client_secret=os.environ.get("DOMINO_CLIENT_SECRET"),
            oauth_scope=os.environ.get("DOMINO_OAUTH_SCOPE", "$DATA"),
            scope=os.environ.get("DOMINO_SCOPE", "$DATA"),
            verify_ssl=os.environ.get("DOMINO_VERIFY_SSL", "true").lower() == "true",
            timeout=float(os.environ.get("DOMINO_TIMEOUT", "30.0")),
            max_retries=int(os.environ.get("DOMINO_MAX_RETRIES", "3")),
        )
