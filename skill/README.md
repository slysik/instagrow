# domino-skill

**The first Python SDK for the HCL Domino REST API (DRAPI)**

A comprehensive Python SDK for building HCL Domino applications via the REST API, with dual async/sync support, FTS-powered eval framework, and CLI tools.

---

## Architecture Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           YOUR APPLICATION                                      │
│                                                                                 │
│   from domino_skill import DominoClient                                         │
│   client = DominoClient(base_url="...", username="...", password="...")          │
└───────────────────────────────────┬─────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          DominoClient (client.py)                               │
│                     Single entry point — wires everything                       │
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  .documents   │  │  .views      │  │  .agents     │  │  .scopes     │       │
│  │  .bulk        │  │  .query      │  │  .richtext   │  │  .design     │       │
│  │  .attachments │  │  .pim        │  │  .admin      │  │  .evals      │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                  │                  │                  │               │
│         └──────────────────┴──────────────────┴──────────────────┘               │
│                                    │                                             │
└────────────────────────────────────┼─────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       HTTP Transport (http/transport.py)                         │
│                                                                                 │
│   ┌─────────────┐    ┌──────────────────┐    ┌─────────────────────┐           │
│   │  Async       │    │  Retry Logic     │    │  Token Injection    │           │
│   │  httpx.Async │    │  429/503 backoff │    │  Authorization:     │           │
│   │  Client      │    │  max 3 retries   │    │  Bearer <token>     │           │
│   └──────┬──────┘    └────────┬─────────┘    └──────────┬──────────┘           │
│          │                    │                          │                       │
│          └────────────────────┴──────────────────────────┘                       │
│                                    │                                             │
│                          Auto-refresh on 401                                     │
│                                    │                                             │
└────────────────────────────────────┼─────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      Authentication (auth/)                                      │
│                                                                                 │
│   ┌────────────────────────┐          ┌────────────────────────────┐            │
│   │   BasicAuthProvider    │          │    OAuthProvider            │            │
│   │                        │          │                            │            │
│   │  POST /api/v1/auth     │          │  Client Credentials Grant  │            │
│   │  username + password   │          │  OIDC Discovery            │            │
│   │  → JWT bearer token    │          │  Token Refresh             │            │
│   │  Auto-refresh on       │          │  PKCE Support              │            │
│   │  expiry                │          │  → JWT bearer token        │            │
│   └────────────────────────┘          └────────────────────────────┘            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                    ┌──────────────────────────────┐
                    │  HCL Domino REST API Server   │
                    │  https://domino:8880/api/v1   │
                    │                               │
                    │  ┌─────────┐  ┌──────────┐   │
                    │  │ Basis   │  │ Setup    │   │
                    │  │ API     │  │ API      │   │
                    │  ├─────────┤  ├──────────┤   │
                    │  │ Admin   │  │ PIM      │   │
                    │  │ API     │  │ API      │   │
                    │  └─────────┘  └──────────┘   │
                    └──────────────────────────────┘
```

---

## Eval Framework Flow (Autoresearch-Style)

Inspired by [karpathy/autoresearch](https://github.com/karpathy/autoresearch) — autonomous experimentation with keep-or-discard scoring.

```
┌──────────────────────────────────────────────────────────────────┐
│                    program.md (Agent Guide)                       │
│         Defines: goals, constraints, experiment types            │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  EvalRunner Loop    │ ◄──── Time Budget (e.g. 30min)
            │                     │
            │  for each experiment│
            └─────────┬───────────┘
                      │
         ┌────────────┼────────────────────────┐
         │            │                        │
         ▼            ▼                        ▼
  ┌──────────┐  ┌──────────────┐    ┌─────────────────┐
  │ Modify   │  │  Evaluate    │    │  Score & Decide  │
  │ Domino   │  │              │    │                  │
  │ Asset    │  │  ┌─────────┐ │    │  improved?       │
  │          │  │  │Response │ │    │  ┌─────┐ ┌────┐ │
  │ doc/view │  │  │Eval 40% │ │    │  │ YES │ │ NO │ │
  │ /query/  │  │  ├─────────┤ │    │  │KEEP │ │ROLL│ │
  │ schema   │  │  │Search   │ │    │  │     │ │BACK│ │
  │          │  │  │Eval 30% │ │    │  └──┬──┘ └─┬──┘ │
  │          │  │  ├─────────┤ │    │     │      │    │
  │          │  │  │Latency  │ │    └─────┼──────┼────┘
  │          │  │  │Eval 20% │ │          │      │
  │          │  │  ├─────────┤ │          ▼      ▼
  │          │  │  │Error    │ │    ┌──────────────────┐
  │          │  │  │Eval 10% │ │    │ experiment_log   │
  │          │  │  └─────────┘ │    │ .jsonl           │
  └──────────┘  └──────────────┘    │                  │
                                    │ {score, baseline │
         FTS Scoring Engine         │  kept, timestamp}│
  ┌──────────────────────────┐      └──────────────────┘
  │  BM25 + TF-IDF Hybrid   │
  │                          │      IR Metrics
  │  score = 0.7*BM25        │  ┌──────────────────────┐
  │        + 0.3*TF-IDF      │  │ Precision@K          │
  │                          │  │ Recall / F1          │
  │  Corpus indexing         │  │ NDCG@K               │
  │  Document frequency      │  │ MRR                  │
  │  Term frequency          │  │ MAP                  │
  └──────────────────────────┘  └──────────────────────┘
```

---

## Resource ↔ Endpoint Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│                    BASIS API (v1)                                │
│                                                                 │
│  documents ──► POST/GET/PUT/PATCH/DELETE /api/v1/document       │
│  bulk      ──► POST /api/v1/bulk/{create,update,delete,unid}   │
│  views     ──► GET  /api/v1/lists, /api/v1/lists/{name}        │
│  query     ──► POST /api/v1/query, /api/v1/run/formula         │
│  agents    ──► POST /api/v1/run/agent{,WithContext,Async}       │
│  richtext  ──► GET  /api/v1/richtext/{html,md,mime,plain}      │
│  attachments─► GET/POST /api/v1/attachments/{unid}             │
├─────────────────────────────────────────────────────────────────┤
│                    SETUP API (setup-v1)                          │
│                                                                 │
│  scopes    ──► GET/POST/PUT/DELETE /api/setup-v1/admin/scope    │
│  design    ──► GET /api/setup-v1/design/{type}/{name}           │
├─────────────────────────────────────────────────────────────────┤
│                    ADMIN API (admin-v1)                          │
│                                                                 │
│  admin     ──► GET/PUT /api/admin-v1/acl                        │
│            ──► DELETE  /api/admin-v1/acl/roles/{role}           │
│            ──► DELETE  /api/admin-v1/cache                      │
├─────────────────────────────────────────────────────────────────┤
│                    PIM API (pim-v1)                              │
│                                                                 │
│  pim       ──► GET  /api/pim-v1/{inbox,calendar,contacts,tasks}│
│            ──► POST /api/pim-v1/calendar                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Features

- **50+ API operations** across Basis, Setup, Admin, and PIM endpoint groups
- **Dual auth**: Basic (username/password -> JWT) and OAuth 2.0 / OIDC
- **Async + sync**: Every method available in both async and sync variants
- **Type-safe**: Pydantic v2 models for all request/response types
- **FTS eval framework**: BM25/TF-IDF scoring, NDCG, MRR, Precision@K (inspired by [karpathy/autoresearch](https://github.com/karpathy/autoresearch))
- **CLI tool**: Quick testing from the command line
- **Zero official Python SDK exists** -- this fills the gap alongside the official [Node.js](https://github.com/HCL-TECH-SOFTWARE/domino-rest-sdk-node) and [Go](https://github.com/HCL-TECH-SOFTWARE/domino-rest-sdk-go) SDKs

---

## Installation

```bash
pip install domino-skill
```

Or from source:

```bash
git clone https://github.com/slysik/databricks-domino-skill.git
cd databricks-domino-skill
pip install -e ".[dev]"
```

---

## Step-by-Step Implementation Guide

### Step 1: Environment Setup

```bash
# Clone the repo
git clone https://github.com/slysik/databricks-domino-skill.git
cd databricks-domino-skill

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install with dev dependencies
pip install -e ".[dev]"
```

### Step 2: Configure Your Domino Server Connection

Copy the example env file and fill in your server details:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
DOMINO_BASE_URL=https://your-domino-server:8880
DOMINO_AUTH_TYPE=basic
DOMINO_USERNAME=your-username
DOMINO_PASSWORD=your-password
DOMINO_SCOPE=$DATA
```

For OAuth 2.0 / OIDC:

```bash
DOMINO_AUTH_TYPE=oauth
DOMINO_CLIENT_ID=your-client-id
DOMINO_CLIENT_SECRET=your-client-secret
DOMINO_OAUTH_TOKEN_URL=https://your-idp/token   # optional if OIDC discovery works
```

### Step 3: Verify Connection

```bash
# Test authentication
domino auth test

# List available scopes
domino scopes list
```

### Step 4: Basic Usage (Sync)

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

### Step 5: Async Usage

```python
import asyncio
from domino_skill import DominoClient

async def main():
    async with DominoClient(
        base_url="https://domino.example.com:8880",
        username="admin",
        password="secret",
    ) as client:
        # All methods are async by default
        doc = await client.documents.get("mydb", "UNID123")
        views = await client.views.list_all("mydb")
        results = await client.query.execute_dql("mydb", "Form = 'Contact'")

asyncio.run(main())
```

### Step 6: Environment Variables (Zero-Config)

```bash
export DOMINO_BASE_URL=https://domino.example.com:8880
export DOMINO_AUTH_TYPE=basic
export DOMINO_USERNAME=admin
export DOMINO_PASSWORD=secret
```

```python
# Auto-loads from environment
client = DominoClient()
```

### Step 7: Bulk Operations

```python
# Create many documents at once
docs = [
    {"Form": "Contact", "FirstName": "Alice"},
    {"Form": "Contact", "FirstName": "Bob"},
]
results = client.bulk.create_many_sync("mydb", docs)

# Delete many
client.bulk.delete_many_sync("mydb", ["UNID1", "UNID2", "UNID3"])
```

### Step 8: Setup & Admin Operations

```python
# List all scopes
scopes = client.scopes.list_all_sync()

# Create a new scope
client.scopes.create_sync({
    "apiName": "myapp",
    "schemaName": "myschema",
    "nsfPath": "mydb.nsf",
})

# Get design elements
forms = client.design.list_forms_sync("mydb")
views = client.design.list_views_sync("mydb")

# Admin: clear API cache
client.admin.clear_cache_sync()

# Admin: get ACL
acl = client.admin.get_acl_sync("mydb")
```

### Step 9: Run Evaluations

```python
from domino_skill.evals import FTSScorer, EvalRunner

# FTS scoring
scorer = FTSScorer(corpus=["doc about cats", "doc about dogs", "doc about birds"])
results = scorer.rank_documents("cats and birds", top_k=2)
for r in results:
    print(f"  Score: {r.score:.3f} -- {r.document}")

# IR metrics
from domino_skill.evals import precision_at_k, ndcg_at_k, mrr

p = precision_at_k(["d1", "d2", "d3"], {"d1", "d3"}, k=3)
n = ndcg_at_k(["d1", "d2"], {"d1": 3, "d2": 1}, k=2)
m = mrr([["d2", "d1"]], [{"d1"}])

# Autoresearch-style experiment
runner = EvalRunner()
result = runner.run_experiment(
    "optimize_view",
    modification=lambda: {"added_column": "Email"},
    evaluate=lambda: 0.85,
)
print(f"Score: {result.score}, Kept: {result.kept}")
```

### Step 10: Use the CLI

```bash
# Configuration
domino config                            # Show configuration

# Authentication
domino auth test                         # Test connection

# Documents
domino doc get <scope> <unid>            # Fetch a document
domino doc create <scope> --form Contact # Create a document

# Views
domino views list <scope>                # List all views/folders

# Agents
domino agent run <scope> ProcessDocs     # Execute an agent

# Scopes
domino scopes list                       # List all scopes

# Admin
domino admin clear-cache                 # Clear DRAPI cache

# Eval framework
domino eval run tests/eval_suite.json    # Run eval suite
domino eval log                          # View experiment history
```

---

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

---

## Project Structure

```
domino-skill/
├── pyproject.toml                        # Package config
├── program.md                            # Autoresearch-style agent guide
├── .env.example                          # Environment template
├── src/domino_skill/
│   ├── __init__.py                       # Public API
│   ├── client.py                         # DominoClient entry point
│   ├── config.py                         # Configuration (env vars)
│   ├── cli.py                            # CLI tool
│   ├── auth/
│   │   ├── base.py                       # AuthProvider ABC
│   │   ├── basic.py                      # Basic auth (user/pass -> JWT)
│   │   └── oauth.py                      # OAuth 2.0 / OIDC
│   ├── http/
│   │   ├── errors.py                     # Exception hierarchy
│   │   └── transport.py                  # httpx async/sync transport
│   ├── models/
│   │   ├── document.py, view.py          # Pydantic data models
│   │   ├── database.py, agent.py         #   for all API resources
│   │   ├── admin.py, auth.py, common.py  #
│   ├── resources/
│   │   ├── documents.py, bulk.py         # API resource clients
│   │   ├── views.py, query.py            #   each wrapping HTTP
│   │   ├── agents.py, richtext.py        #   transport calls
│   │   ├── attachments.py, scopes.py     #
│   │   ├── design.py, admin.py, pim.py   #
│   └── evals/
│       ├── scorer.py                     # BM25 + TF-IDF engine
│       ├── metrics.py                    # IR metrics (NDCG, MRR, P@K)
│       ├── response_eval.py             # API response grading
│       ├── agent_eval.py                # Agent decision grading
│       ├── search_eval.py               # Search relevance grading
│       └── runner.py                    # Experiment loop runner
└── tests/                               # 62 tests, 100% passing
    ├── conftest.py
    ├── test_auth.py, test_client.py
    ├── test_documents.py, test_bulk.py
    ├── test_views.py, test_query.py
    ├── test_agents.py, test_scopes.py
    ├── test_admin.py, test_evals.py
```

---

## Architecture Reference

Modeled after the official HCL SDKs ([Node.js](https://github.com/HCL-TECH-SOFTWARE/domino-rest-sdk-node), [Go](https://github.com/HCL-TECH-SOFTWARE/domino-rest-sdk-go)):

| Official SDK Component | Python Equivalent |
|------------------------|------------------|
| DominoAccess | `auth/basic.py`, `auth/oauth.py` |
| DominoServer | Auto-discovery in `client.py` |
| DominoConnector | `http/transport.py` |
| DominoBasisSession | `resources/documents.py`, `resources/views.py`, etc. |
| DominoSetupSession | `resources/scopes.py`, `resources/design.py` |

---

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests (62 tests)
pytest tests/ -v

# Type checking
mypy src/domino_skill/
```

---

## References

- [HCL Domino REST API Documentation](https://opensource.hcltechsw.com/Domino-rest-api/index.html)
- [Official Node.js SDK](https://github.com/HCL-TECH-SOFTWARE/domino-rest-sdk-node)
- [Official Go SDK](https://github.com/HCL-TECH-SOFTWARE/domino-rest-sdk-go)
- [Domino REST API Tutorials](https://github.com/HCL-TECH-SOFTWARE/domino-keep-tutorials)
- [karpathy/autoresearch](https://github.com/karpathy/autoresearch) (eval framework inspiration)

## License

Apache-2.0
