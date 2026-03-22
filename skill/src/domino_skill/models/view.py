"""View and folder models for Domino REST API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ViewInfo(BaseModel):
    """Metadata about a view or folder."""

    name: str = Field(description="View or folder name")
    alias: list[str] = Field(default_factory=list, description="View aliases")
    unid: str = Field(default="", description="Design element UNID")
    is_folder: bool = Field(default=False, alias="@isFolder")
    column_count: int | None = Field(default=None, description="Number of columns")

    model_config = {"populate_by_name": True, "extra": "allow"}


class ViewEntry(BaseModel):
    """A single entry (row) in a view."""

    unid: str = Field(alias="@unid", default="", description="Document UNID")
    position: str | None = Field(default=None, description="Row position in view")
    note_id: str | None = Field(alias="@noteid", default=None)
    index: str | None = Field(alias="@index", default=None)
    values: dict[str, Any] = Field(default_factory=dict, description="Column values")

    model_config = {"populate_by_name": True, "extra": "allow"}

    def __init__(self, **data: Any) -> None:
        system_keys = {"@unid", "@noteid", "@index", "unid", "position", "note_id", "index", "values"}
        extra_fields = {k: v for k, v in data.items() if k not in system_keys}
        if extra_fields and "values" not in data:
            data["values"] = extra_fields
        super().__init__(**data)


class ViewEntryList(BaseModel):
    """Response from a view entries request."""

    entries: list[ViewEntry] = Field(default_factory=list)
    count: int = Field(default=0, description="Total entries returned")

    model_config = {"extra": "allow"}


class PivotEntry(BaseModel):
    """A pivoted view entry grouping."""

    category: str = Field(default="", description="Category/group key")
    count: int = Field(default=0, description="Number of entries in group")
    values: dict[str, Any] = Field(default_factory=dict, description="Aggregated values")

    model_config = {"extra": "allow"}
