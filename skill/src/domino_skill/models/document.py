"""Document-related models for Domino REST API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class Document(BaseModel):
    """Represents a Domino document returned by the REST API."""

    unid: str = Field(alias="@unid", default="", description="Universal ID of the document")
    form: str = Field(alias="Form", default="", description="Form name used by the document")
    etag: str | None = Field(alias="@etag", default=None, description="ETag for conflict detection")
    created: str | None = Field(alias="@created", default=None)
    modified: str | None = Field(alias="@modified", default=None)
    revision: str | None = Field(alias="@revision", default=None)
    note_id: str | None = Field(alias="@noteid", default=None)
    fields: dict[str, Any] = Field(default_factory=dict, description="Document field values")

    model_config = {"populate_by_name": True, "extra": "allow"}

    def __init__(self, **data: Any) -> None:
        # Collect non-system fields into 'fields'
        system_keys = {
            "@unid", "@etag", "@created", "@modified", "@revision", "@noteid",
            "Form", "fields", "unid", "form", "etag", "created", "modified",
            "revision", "note_id",
        }
        extra_fields = {k: v for k, v in data.items() if k not in system_keys}
        if extra_fields and "fields" not in data:
            data["fields"] = extra_fields
        super().__init__(**data)


class DocumentCreate(BaseModel):
    """Payload for creating a new document."""

    Form: str = Field(description="Form name")
    fields: dict[str, Any] = Field(default_factory=dict, description="Field name-value pairs")

    def to_api_payload(self) -> dict[str, Any]:
        """Flatten to the API format: Form + fields at top level."""
        payload: dict[str, Any] = {"Form": self.Form}
        payload.update(self.fields)
        return payload


class DocumentUpdate(BaseModel):
    """Payload for updating an existing document."""

    fields: dict[str, Any] = Field(description="Field name-value pairs to update")
    etag: str | None = Field(default=None, description="ETag for optimistic locking")

    def to_api_payload(self) -> dict[str, Any]:
        return dict(self.fields)


class DocumentMetadata(BaseModel):
    """Document metadata returned by /docmeta endpoint."""

    unid: str = Field(alias="@unid", default="")
    created: str | None = Field(alias="@created", default=None)
    modified: str | None = Field(alias="@modified", default=None)
    revision: str | None = Field(alias="@revision", default=None)
    note_id: str | None = Field(alias="@noteid", default=None)
    size: int | None = Field(default=None, description="Document size in bytes")
    form: str | None = Field(alias="Form", default=None)
    note_class: str | None = Field(alias="@noteclass", default=None)

    model_config = {"populate_by_name": True, "extra": "allow"}


class RichTextContent(BaseModel):
    """Rich text content from a document field."""

    content: str = Field(description="Rich text content in the requested format")
    format: str = Field(description="Format: html, mime, markdown, or plain")


class Attachment(BaseModel):
    """File attachment on a Domino document."""

    name: str = Field(description="Attachment filename")
    size: int | None = Field(default=None, description="File size in bytes")
    content_type: str | None = Field(default=None, description="MIME content type")
    data: bytes | None = Field(default=None, description="Binary content (when downloaded)")
