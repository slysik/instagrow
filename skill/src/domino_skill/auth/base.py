"""Abstract base class for authentication providers."""

from __future__ import annotations

from abc import ABC, abstractmethod


class AuthProvider(ABC):
    """Base interface for Domino REST API authentication.

    Implementations handle obtaining and refreshing tokens for either
    Basic (username/password → JWT) or OAuth 2.0 / OIDC flows.
    """

    @abstractmethod
    async def get_token(self) -> str:
        """Return a valid bearer token, obtaining or refreshing as needed."""

    @abstractmethod
    async def refresh(self) -> str:
        """Force-refresh the token and return the new one."""

    @abstractmethod
    def get_token_sync(self) -> str:
        """Synchronous variant of get_token."""

    @property
    @abstractmethod
    def is_expired(self) -> bool:
        """Check if the current token has expired."""
