"""Shared types used across the Domino REST API SDK."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class PaginationParams(BaseModel):
    """Common pagination parameters for list endpoints."""

    count: int = Field(default=100, description="Number of entries to return")
    start: int = Field(default=0, description="Starting index for pagination")


class ApiResponse(BaseModel):
    """Generic wrapper for API responses with metadata."""

    status: int = Field(description="HTTP status code")
    message: str | None = Field(default=None, description="Response message")
    data: Any = Field(default=None, description="Response payload")


class ErrorResponse(BaseModel):
    """Domino REST API error response structure."""

    status: int
    message: str
    errorId: int | None = None
    details: str | None = None
