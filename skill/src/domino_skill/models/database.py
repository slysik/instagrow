"""Database, scope, and schema models for Domino REST API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class Scope(BaseModel):
    """A Domino REST API scope — defines access to a database schema."""

    apiName: str = Field(description="Scope name used as dataSource parameter")
    schemaName: str = Field(default="", description="Associated schema name")
    nsfPath: str = Field(default="", description="Path to the NSF database file")
    description: str = Field(default="", description="Human-readable description")
    icon: str = Field(default="", description="Icon identifier")
    iconName: str = Field(default="", description="Icon display name")
    isActive: bool = Field(default=True, description="Whether scope is enabled")
    maximumAccessLevel: str = Field(default="", description="Max ACL level for this scope")
    server: str = Field(default="", description="Server hosting the database")

    model_config = {"extra": "allow"}


class ScopeCreate(BaseModel):
    """Payload for creating a new scope."""

    apiName: str = Field(description="Scope name (used as dataSource)")
    schemaName: str = Field(description="Schema to expose")
    nsfPath: str = Field(description="Database file path, e.g. 'mydb.nsf'")
    description: str = Field(default="")
    icon: str = Field(default="Base")
    iconName: str = Field(default="")
    isActive: bool = Field(default=True)
    maximumAccessLevel: str = Field(default="Manager")
    server: str = Field(default="*", description="Server name, '*' for all")


class Schema(BaseModel):
    """Database schema — defines which design elements are exposed."""

    name: str = Field(description="Schema name")
    nsfPath: str = Field(default="", description="NSF database path")
    description: str = Field(default="")
    forms: list[SchemaForm] = Field(default_factory=list)
    views: list[SchemaView] = Field(default_factory=list)
    agents: list[str] = Field(default_factory=list, description="Exposed agent names")

    model_config = {"extra": "allow"}


class SchemaForm(BaseModel):
    """A form definition within a schema."""

    name: str = Field(description="Form name")
    alias: str = Field(default="", description="Form alias")
    modes: list[SchemaMode] = Field(default_factory=list)

    model_config = {"extra": "allow"}


class SchemaMode(BaseModel):
    """Access mode for a form — controls which fields are readable/writable."""

    name: str = Field(description="Mode name (e.g. 'default', 'readonly')")
    fields: list[SchemaField] = Field(default_factory=list)
    readAccessFormula: str = Field(default="@True")
    writeAccessFormula: str = Field(default="@True")
    deleteAccessFormula: str = Field(default="@False")

    model_config = {"extra": "allow"}


class SchemaField(BaseModel):
    """Field definition within a form mode."""

    name: str = Field(description="Field name")
    type: str = Field(default="string", description="Field data type")
    readOnly: bool = Field(default=False)
    format: str = Field(default="", description="Display format")

    model_config = {"extra": "allow"}


class SchemaView(BaseModel):
    """A view definition within a schema."""

    name: str = Field(description="View name")
    alias: str = Field(default="")
    columns: list[dict[str, Any]] = Field(default_factory=list)

    model_config = {"extra": "allow"}
