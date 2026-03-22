"""Resource clients for all Domino REST API endpoint groups."""

from domino_skill.resources.admin import AdminResource
from domino_skill.resources.agents import AgentsResource
from domino_skill.resources.attachments import AttachmentsResource
from domino_skill.resources.bulk import BulkResource
from domino_skill.resources.design import DesignResource
from domino_skill.resources.documents import DocumentsResource
from domino_skill.resources.pim import PIMResource
from domino_skill.resources.query import QueryResource
from domino_skill.resources.richtext import RichTextResource
from domino_skill.resources.scopes import ScopesResource
from domino_skill.resources.views import ViewsResource

__all__ = [
    "AdminResource",
    "AgentsResource",
    "AttachmentsResource",
    "BulkResource",
    "DesignResource",
    "DocumentsResource",
    "PIMResource",
    "QueryResource",
    "RichTextResource",
    "ScopesResource",
    "ViewsResource",
]
