"""Admin and ACL models for Domino REST API."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ACLEntry(BaseModel):
    """An entry in the database Access Control List."""

    name: str = Field(description="User, group, or server name")
    level: str = Field(description="Access level: NoAccess, Depositor, Reader, Author, Editor, Designer, Manager")
    roles: list[str] = Field(default_factory=list, description="Assigned roles")
    can_create_documents: bool = Field(default=False, alias="canCreateDocuments")
    can_delete_documents: bool = Field(default=False, alias="canDeleteDocuments")
    can_create_private_agents: bool = Field(default=False, alias="canCreatePrivateAgents")
    can_create_shared_agents: bool = Field(default=False, alias="canCreateSharedAgents")
    can_create_private_folders: bool = Field(default=False, alias="canCreatePrivateFolders")
    can_create_shared_folders: bool = Field(default=False, alias="canCreateSharedFolders")
    can_replicate_or_copy: bool = Field(default=False, alias="canReplicateOrCopy")
    is_public_reader: bool = Field(default=False, alias="isPublicReader")
    is_public_writer: bool = Field(default=False, alias="isPublicWriter")

    model_config = {"populate_by_name": True, "extra": "allow"}


class ACL(BaseModel):
    """Full Access Control List for a Domino database."""

    entries: list[ACLEntry] = Field(default_factory=list)
    roles: list[str] = Field(default_factory=list, description="All defined roles")
    administration_server: str = Field(default="", alias="administrationServer")

    model_config = {"populate_by_name": True, "extra": "allow"}


class ServerInfo(BaseModel):
    """Domino server information."""

    server_name: str = Field(default="", description="Server name")
    version: str = Field(default="", description="Domino version")
    drapi_version: str = Field(default="", description="Domino REST API version")

    model_config = {"extra": "allow"}
