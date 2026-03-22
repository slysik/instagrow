"""Personal Information Management (PIM) — PIM API."""

from __future__ import annotations

from typing import Any

from domino_skill.http.transport import HttpTransport


class PIMResource:
    """Access mail, calendar, contacts, and tasks via the PIM API.

    Endpoints:
        GET  /api/pim-v1/inbox       — mail inbox
        GET  /api/pim-v1/calendar    — calendar entries
        POST /api/pim-v1/calendar    — create calendar entry
        GET  /api/pim-v1/contacts    — contacts
        GET  /api/pim-v1/tasks       — tasks/to-do items
    """

    def __init__(self, transport: HttpTransport) -> None:
        self._t = transport

    # --- Async ---

    async def get_mail(
        self, *, folder: str = "inbox", count: int = 50, start: int = 0
    ) -> list[dict]:
        """Get mail messages from a folder."""
        params: dict[str, Any] = {"count": count, "start": start}
        data = await self._t.get(f"/api/pim-v1/{folder}", params=params)
        return data if isinstance(data, list) else []

    async def get_calendar_entries(
        self, *, count: int = 50, start: int = 0
    ) -> list[dict]:
        """Get calendar entries."""
        params: dict[str, Any] = {"count": count, "start": start}
        data = await self._t.get("/api/pim-v1/calendar", params=params)
        return data if isinstance(data, list) else []

    async def create_calendar_entry(self, entry: dict[str, Any]) -> dict:
        """Create a new calendar entry."""
        return await self._t.post("/api/pim-v1/calendar", json=entry)

    async def get_contacts(
        self, *, count: int = 100, start: int = 0
    ) -> list[dict]:
        """Get contacts."""
        params: dict[str, Any] = {"count": count, "start": start}
        data = await self._t.get("/api/pim-v1/contacts", params=params)
        return data if isinstance(data, list) else []

    async def get_tasks(
        self, *, count: int = 50, start: int = 0
    ) -> list[dict]:
        """Get task/to-do items."""
        params: dict[str, Any] = {"count": count, "start": start}
        data = await self._t.get("/api/pim-v1/tasks", params=params)
        return data if isinstance(data, list) else []

    # --- Sync ---

    def get_mail_sync(
        self, *, folder: str = "inbox", count: int = 50, start: int = 0
    ) -> list[dict]:
        params: dict[str, Any] = {"count": count, "start": start}
        data = self._t.get_sync(f"/api/pim-v1/{folder}", params=params)
        return data if isinstance(data, list) else []

    def get_calendar_entries_sync(
        self, *, count: int = 50, start: int = 0
    ) -> list[dict]:
        params: dict[str, Any] = {"count": count, "start": start}
        data = self._t.get_sync("/api/pim-v1/calendar", params=params)
        return data if isinstance(data, list) else []

    def create_calendar_entry_sync(self, entry: dict[str, Any]) -> dict:
        return self._t.post_sync("/api/pim-v1/calendar", json=entry)

    def get_contacts_sync(
        self, *, count: int = 100, start: int = 0
    ) -> list[dict]:
        params: dict[str, Any] = {"count": count, "start": start}
        data = self._t.get_sync("/api/pim-v1/contacts", params=params)
        return data if isinstance(data, list) else []

    def get_tasks_sync(
        self, *, count: int = 50, start: int = 0
    ) -> list[dict]:
        params: dict[str, Any] = {"count": count, "start": start}
        data = self._t.get_sync("/api/pim-v1/tasks", params=params)
        return data if isinstance(data, list) else []
