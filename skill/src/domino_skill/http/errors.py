"""Custom exception hierarchy for Domino REST API errors."""

from __future__ import annotations


class DominoAPIError(Exception):
    """Base exception for all Domino REST API errors."""

    def __init__(
        self,
        message: str,
        status_code: int | None = None,
        response_body: dict | str | None = None,
    ) -> None:
        self.status_code = status_code
        self.response_body = response_body
        super().__init__(message)


class AuthenticationError(DominoAPIError):
    """Raised on 401 Unauthorized — invalid or expired credentials/token."""


class ForbiddenError(DominoAPIError):
    """Raised on 403 Forbidden — insufficient permissions or ACL denied."""


class NotFoundError(DominoAPIError):
    """Raised on 404 Not Found — document, view, scope, or endpoint doesn't exist."""


class ConflictError(DominoAPIError):
    """Raised on 409 Conflict — ETag mismatch or concurrent modification."""


class RateLimitError(DominoAPIError):
    """Raised on 429 Too Many Requests — rate limit exceeded."""


class ValidationError(DominoAPIError):
    """Raised when request data fails server-side validation."""


class ServerError(DominoAPIError):
    """Raised on 5xx server errors."""


def raise_for_status(status_code: int, body: dict | str | None = None) -> None:
    """Raise the appropriate DominoAPIError subclass for an HTTP error status."""
    if 200 <= status_code < 300:
        return

    msg = f"HTTP {status_code}"
    if isinstance(body, dict):
        msg = body.get("message", body.get("errorMessage", msg))
    elif isinstance(body, str) and body:
        msg = body

    error_map: dict[int, type[DominoAPIError]] = {
        401: AuthenticationError,
        403: ForbiddenError,
        404: NotFoundError,
        409: ConflictError,
        429: RateLimitError,
    }

    exc_cls = error_map.get(status_code)
    if exc_cls is None:
        exc_cls = ServerError if status_code >= 500 else DominoAPIError

    raise exc_cls(msg, status_code=status_code, response_body=body)
