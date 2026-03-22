"""domino-skill — Python SDK for HCL Domino REST API (DRAPI).

The first Python SDK for the HCL Domino REST API, providing comprehensive
coverage of Basis, Setup, Admin, and PIM APIs with both sync and async support.

Quick start:
    from domino_skill import DominoClient

    client = DominoClient(
        base_url="https://domino:8880",
        username="admin",
        password="secret",
    )
    doc = client.documents.get_sync("mydb", "UNID123")
"""

from domino_skill.client import DominoClient
from domino_skill.config import DominoConfig
from domino_skill.http.errors import (
    AuthenticationError,
    ConflictError,
    DominoAPIError,
    ForbiddenError,
    NotFoundError,
    RateLimitError,
    ServerError,
    ValidationError,
)

__version__ = "0.1.0"

__all__ = [
    "AuthenticationError",
    "ConflictError",
    "DominoAPIError",
    "DominoClient",
    "DominoConfig",
    "ForbiddenError",
    "NotFoundError",
    "RateLimitError",
    "ServerError",
    "ValidationError",
    "__version__",
]
