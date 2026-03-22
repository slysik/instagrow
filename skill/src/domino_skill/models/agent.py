"""Agent-related models for Domino REST API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class AgentInfo(BaseModel):
    """Information about a Domino agent."""

    name: str = Field(description="Agent name")
    alias: str = Field(default="", description="Agent alias")
    comment: str = Field(default="")
    lastRun: str | None = Field(default=None, description="ISO timestamp of last run")
    isEnabled: bool = Field(default=True)
    isScheduled: bool = Field(default=False)
    trigger: str = Field(default="", description="Agent trigger type")

    model_config = {"extra": "allow"}


class AgentRunRequest(BaseModel):
    """Payload for running an agent."""

    agentName: str = Field(description="Name of the agent to execute")
    note_ids: list[str] | None = Field(
        default=None, alias="noteIds", description="Optional list of note IDs to process"
    )

    model_config = {"populate_by_name": True}


class AgentRunResult(BaseModel):
    """Result from running a Domino agent."""

    status: str = Field(description="Execution status: 'completed', 'processing', 'error'")
    uuid: str | None = Field(default=None, description="Async job UUID for polling")
    result: Any = Field(default=None, description="Agent output data")
    agentName: str = Field(default="", description="Name of the executed agent")

    model_config = {"extra": "allow"}


class AgentContextRequest(BaseModel):
    """Payload for running an agent with document context."""

    agentName: str = Field(description="Agent name")
    unids: list[str] = Field(description="List of document UNIDs to process")
