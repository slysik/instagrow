# domino-skill

**The first Python SDK for the HCL Domino REST API (DRAPI)**

A comprehensive Python SDK for building HCL Domino applications via the REST API, with dual async/sync support, FTS-powered eval framework, and CLI tools.

## Features

- **50+ API operations** across Basis, Setup, Admin, and PIM endpoint groups
- **Dual auth**: Basic (username/password → JWT) and OAuth 2.0 / OIDC
- **Async + sync**: Every method available in both async and sync variants
- **Type-safe**: Pydantic v2 models for all request/response types
- **FTS eval framework**: BM25/TF-IDF scoring, NDCG, MRR, Precision@K (inspired by [karpathy/autoresearch](https://github.com/karpathy/autoresearch))
- **CLI tool**: Quick testing from the command line
- **Zero official Python SDK exists** — this fills the gap alongside the official [Node.js](https://github.com/HCL-TECH-SOFTWARE/domino-rest-sdk-node) and [Go](https://github.com/HCL-TECH-SOFTWARE/domino-rest-sdk-go) SDKs

## Installation

```bash
pip install domino-skill
```

Or from source:

```bash
git clone <repo-url>
cd domino-skill
pip install -e ".[dev]"
```

## Quick Start

### Sync Usage

```python
from domino_skill import DominoClient

client = DominoClient(
    base_url="https://domino.example.com:8880",
    username="admin",
    password="secret",
)

# Get a document
doc = client.documents.get_sync("mydb", "UNID123")
print(doc.form, doc.fields)

# Create a document
new_doc = client.documents.create_sync(
    "mydb", "Contact", {"FirstName": "John", "LastName": "Doe"}
)

# List views
views = client.views.list_all_sync("mydb")
for v in views:
    print(v.name)

# Run a query
results = client.query.execute_dql_sync("mydb", "Form = 'Contact'")

# Run an agent
result = client.agents.run_sync("mydb", "ProcessDocs")

client.close_sync()
```

### Async Usage

```python
import asyncio
from domino_skill import DominoClient

async def main():
    async with DominoClient(
        base_url="https://domino.example.com:8880",
        username="admin",
        password="secret",
    ) as client:
        doc = await client.documents.get("mydb", "UNID123")
        print(doc.form, doc.fields)

asyncio.run(main())
```

### OAuth 2.0 / OIDC

```python
client = DominoClient(
    base_url="https://domino.example.com:8880",
    auth_type="oauth",
    client_id="my-app",
    client_secret="my-secret",
    oauth_token_url="https://idp.example.com/token",  # optional, auto-discovered via OIDC
)
```

### Environment Variables

```bash
export DOMINO_BASE_URL=https://domino.example.com:8880
export DOMINO_AUTH_TYPE=basic
export DOMINO_USERNAME=admin
export DOMINO_PASSWORD=secret

# Then just:
client = DominoClient()  # auto-loads from env
```

## API Coverage

### Basis API (Documents, Views, Queries)

| Resource | Operations |
|----------|-----------|
| `client.documents` | create, get, update, patch, delete, get_metadata |
| `client.bulk` | create_many, update_many, delete_many, get_many, set_etags |
| `client.views` | list_all, get_entries, get_pivot |
| `client.query` | execute_dql, execute_qrp, run_formula |
| `client.agents` | run, run_with_context, run_async, get_async_status, cancel_async |
| `client.richtext` | get_processors, get_as_html, get_as_markdown, get_as_mime, get_as_plain |
| `client.attachments` | download, upload |

### Setup API (Scopes, Design)

| Resource | Operations |
|----------|-----------|
| `client.scopes` | list_all, get, create, update, delete |
| `client.design` | get_element, list_forms, list_views, list_agents, list_folders |

### Admin API

| Resource | Operations |
|----------|-----------|
| `client.admin` | clear_cache, get_acl, update_acl, delete_role |

### PIM API (Mail, Calendar, Contacts)

| Resource | Operations |
|----------|-----------|
| `client.pim` | get_mail, get_calendar_entries, create_calendar_entry, get_contacts, get_tasks |

## Eval Framework

Inspired by [karpathy/autoresearch](https://github.com/karpathy/autoresearch) — autonomous experimentation with FTS scoring.

### FTS Scoring

```python
from domino_skill.evals import FTSScorer

scorer = FTSScorer(corpus=["doc about cats", "doc about dogs", "doc about birds"])
results = scorer.rank_documents("cats and birds", top_k=2)
for r in results:
    print(f"  Score: {r.score:.3f} — {r.document}")
```

### IR Metrics

```python
from domino_skill.evals import precision_at_k, ndcg_at_k, mrr

p = precision_at_k(["d1", "d2", "d3"], {"d1", "d3"}, k=3)
n = ndcg_at_k(["d1", "d2"], {"d1": 3, "d2": 1}, k=2)
m = mrr([["d2", "d1"]], [{"d1"}])
```

### Autoresearch-Style Experiments

```python
from domino_skill.evals import EvalRunner

runner = EvalRunner()
result = runner.run_experiment(
    "optimize_view",
    modification=lambda: {"added_column": "Email"},
    evaluate=lambda: 0.85,
)
print(f"Score: {result.score}, Kept: {result.kept}")
```

## CLI

```bash
domino config                          # Show configuration
domino auth test                       # Test authentication
domino doc get <scope> <unid>          # Get a document
domino doc create <scope> --form X     # Create a document
domino views list <scope>              # List views
domino agent run <scope> <agent>       # Run an agent
domino scopes list                     # List all scopes
domino admin clear-cache               # Clear server cache
domino eval run suite.json             # Run eval suite
domino eval log                        # Show experiment history
```

## Architecture

Modeled after the official HCL SDKs ([Node.js](https://github.com/HCL-TECH-SOFTWARE/domino-rest-sdk-node), [Go](https://github.com/HCL-TECH-SOFTWARE/domino-rest-sdk-go)):

| Official SDK Component | Python Equivalent |
|------------------------|------------------|
| DominoAccess | `auth/basic.py`, `auth/oauth.py` |
| DominoServer | Auto-discovery in `client.py` |
| DominoConnector | `http/transport.py` |
| DominoBasisSession | `resources/documents.py`, `resources/views.py`, etc. |
| DominoSetupSession | `resources/scopes.py`, `resources/design.py` |

## Development

```bash
pip install -e ".[dev]"
pytest tests/
```

## License

Apache-2.0
