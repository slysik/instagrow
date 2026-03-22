"""CLI tool for the Domino REST API SDK — quick testing and eval commands."""

from __future__ import annotations

import json
import sys

import click

from domino_skill.config import DominoConfig


@click.group()
@click.version_option(package_name="domino-skill")
def cli() -> None:
    """Domino Skill — CLI for HCL Domino REST API."""


# --- Config ---


@cli.command()
def config() -> None:
    """Show current configuration (from env vars)."""
    try:
        cfg = DominoConfig.from_env()
        click.echo(cfg.model_dump_json(indent=2))
    except Exception as e:
        click.echo(f"Error loading config: {e}", err=True)
        sys.exit(1)


# --- Auth ---


@cli.group()
def auth() -> None:
    """Authentication commands."""


@auth.command("test")
def auth_test() -> None:
    """Test authentication against the configured Domino server."""
    from domino_skill.client import DominoClient

    try:
        client = DominoClient()
        token = client._auth.get_token_sync()
        click.echo(f"Authentication successful. Token: {token[:20]}...")
        client.close_sync()
    except Exception as e:
        click.echo(f"Authentication failed: {e}", err=True)
        sys.exit(1)


# --- Documents ---


@cli.group("doc")
def doc() -> None:
    """Document operations."""


@doc.command("get")
@click.argument("scope")
@click.argument("unid")
def doc_get(scope: str, unid: str) -> None:
    """Get a document by UNID."""
    from domino_skill.client import DominoClient

    client = DominoClient()
    try:
        document = client.documents.get_sync(scope, unid)
        click.echo(document.model_dump_json(indent=2))
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    finally:
        client.close_sync()


@doc.command("create")
@click.argument("scope")
@click.option("--form", required=True, help="Form name")
@click.option("--field", "-f", multiple=True, help="Field in key=value format")
def doc_create(scope: str, form: str, field: tuple[str, ...]) -> None:
    """Create a new document."""
    from domino_skill.client import DominoClient

    fields = {}
    for f in field:
        if "=" in f:
            k, v = f.split("=", 1)
            fields[k] = v

    client = DominoClient()
    try:
        document = client.documents.create_sync(scope, form, fields)
        click.echo(document.model_dump_json(indent=2))
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    finally:
        client.close_sync()


# --- Views ---


@cli.group("views")
def views() -> None:
    """View operations."""


@views.command("list")
@click.argument("scope")
def views_list(scope: str) -> None:
    """List all views and folders."""
    from domino_skill.client import DominoClient

    client = DominoClient()
    try:
        view_list = client.views.list_all_sync(scope)
        for v in view_list:
            click.echo(f"  {v.name}")
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    finally:
        client.close_sync()


@views.command("entries")
@click.argument("scope")
@click.argument("name")
@click.option("--count", default=20, help="Number of entries")
def views_entries(scope: str, name: str, count: int) -> None:
    """Get entries from a view."""
    from domino_skill.client import DominoClient

    client = DominoClient()
    try:
        entries = client.views.get_entries_sync(scope, name, count=count)
        for entry in entries:
            click.echo(json.dumps({"unid": entry.unid, **entry.values}))
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    finally:
        client.close_sync()


# --- Agents ---


@cli.group("agent")
def agent() -> None:
    """Agent operations."""


@agent.command("run")
@click.argument("scope")
@click.argument("agent_name")
def agent_run(scope: str, agent_name: str) -> None:
    """Run a Domino agent."""
    from domino_skill.client import DominoClient

    client = DominoClient()
    try:
        result = client.agents.run_sync(scope, agent_name)
        click.echo(result.model_dump_json(indent=2))
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    finally:
        client.close_sync()


# --- Scopes ---


@cli.group("scopes")
def scopes() -> None:
    """Scope management."""


@scopes.command("list")
def scopes_list() -> None:
    """List all configured scopes."""
    from domino_skill.client import DominoClient

    client = DominoClient()
    try:
        scope_list = client.scopes.list_all_sync()
        for s in scope_list:
            active = "active" if s.isActive else "inactive"
            click.echo(f"  {s.apiName} -> {s.nsfPath} [{active}]")
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    finally:
        client.close_sync()


# --- Admin ---


@cli.group("admin")
def admin() -> None:
    """Admin operations."""


@admin.command("clear-cache")
def admin_clear_cache() -> None:
    """Clear the Domino REST API scope/schema cache."""
    from domino_skill.client import DominoClient

    client = DominoClient()
    try:
        client.admin.clear_cache_sync()
        click.echo("Cache cleared successfully.")
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    finally:
        client.close_sync()


# --- Eval ---


@cli.group("eval")
def eval_cmd() -> None:
    """Evaluation and experiment commands."""


@eval_cmd.command("run")
@click.argument("suite_path")
@click.option("--type", "eval_type", default="all", help="Eval type: all, response, agent, search")
def eval_run(suite_path: str, eval_type: str) -> None:
    """Run an evaluation suite from a JSON file."""
    from domino_skill.evals.runner import EvalRunner

    runner = EvalRunner()
    try:
        report = runner.load_and_run(suite_path)
        click.echo(runner.export_report(report))
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)


@eval_cmd.command("report")
@click.argument("run_id", default="last")
@click.option("--format", "fmt", default="json", help="Output format: json or html")
def eval_report(run_id: str, fmt: str) -> None:
    """Export an evaluation report."""
    from domino_skill.evals.runner import EvalRunner

    runner = EvalRunner()
    history = runner.get_experiment_history()
    if not history:
        click.echo("No experiments found.")
        return

    click.echo(f"Found {len(history)} experiments:")
    for exp in history[-10:]:
        status = "KEPT" if exp.kept else "DISCARDED"
        click.echo(f"  [{status}] {exp.name}: {exp.score:.3f} (baseline: {exp.baseline:.3f})")


@eval_cmd.command("log")
def eval_log() -> None:
    """Show experiment history."""
    from domino_skill.evals.runner import EvalRunner

    runner = EvalRunner()
    history = runner.get_experiment_history()
    if not history:
        click.echo("No experiments logged yet.")
        return

    for exp in history:
        status = "KEPT" if exp.kept else "DISCARDED"
        click.echo(
            f"  {exp.timestamp} [{status}] {exp.name}: "
            f"score={exp.score:.3f} baseline={exp.baseline:.3f} "
            f"improvement={exp.improvement:+.3f}"
        )


if __name__ == "__main__":
    cli()
