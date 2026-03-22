"""Shared test fixtures for Domino REST API SDK tests."""

from __future__ import annotations

import pytest

from domino_skill.config import DominoConfig


@pytest.fixture
def config() -> DominoConfig:
    """Test configuration pointing to a mock server."""
    return DominoConfig(
        base_url="https://domino.test:8880",
        auth_type="basic",
        username="testuser",
        password="testpass",
        scope="testdb",
        verify_ssl=False,
        timeout=5.0,
    )


@pytest.fixture
def sample_document() -> dict:
    """Sample document response from Domino REST API."""
    return {
        "@unid": "ABC123DEF456",
        "Form": "Contact",
        "@etag": "W/\"etag123\"",
        "@created": "2024-01-15T10:30:00Z",
        "@modified": "2024-06-20T14:22:00Z",
        "FirstName": "John",
        "LastName": "Doe",
        "Email": "john.doe@example.com",
        "Company": "Acme Corp",
    }


@pytest.fixture
def sample_view_entries() -> list[dict]:
    """Sample view entries response."""
    return [
        {
            "@unid": "UNID001",
            "@noteid": "NT001",
            "FirstName": "Alice",
            "LastName": "Smith",
        },
        {
            "@unid": "UNID002",
            "@noteid": "NT002",
            "FirstName": "Bob",
            "LastName": "Jones",
        },
    ]


@pytest.fixture
def sample_scope() -> dict:
    """Sample scope response."""
    return {
        "apiName": "mydb",
        "schemaName": "mydb-schema",
        "nsfPath": "mydb.nsf",
        "description": "Test database",
        "isActive": True,
        "maximumAccessLevel": "Manager",
        "server": "*",
    }
