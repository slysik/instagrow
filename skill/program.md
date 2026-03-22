# Domino Skill — Agent Program

> Inspired by [karpathy/autoresearch](https://github.com/karpathy/autoresearch).
> This file guides the AI agent's autonomous experimentation on Domino assets.

## Goal

Autonomously optimize Domino database assets (documents, views, queries, schemas)
by iteratively modifying them, evaluating with FTS scoring, and keeping improvements.

## Constraints

- **Only modify Domino assets** via the REST API — never touch server config directly.
- **One metric**: composite FTS score (BM25 relevance + response quality + search precision).
- **Time budget**: each experiment gets a fixed window (default 5 minutes).
- **Keep or discard**: if score improves, keep the change. Otherwise, rollback.
- **Log everything**: every experiment is appended to `experiment_log.jsonl`.

## Experiment Types

1. **Document optimization**: Adjust field values, rich text formatting, form design.
2. **View tuning**: Modify view columns, selection formulas, sort orders.
3. **Query refinement**: Optimize DQL queries for better precision/recall.
4. **Schema configuration**: Add/remove exposed forms, views, agents from scopes.
5. **Agent scheduling**: Test different agent execution strategies (sync vs async, batch sizes).

## Evaluation

After each modification, the agent runs the eval suite:

```
score = 0.4 * response_completeness
       + 0.3 * search_relevance (BM25/NDCG)
       + 0.2 * latency_score
       + 0.1 * error_handling_score
```

## How to Run

```bash
# Start an experiment loop with 30-minute budget
domino eval experiment --budget 30m

# Check experiment history
domino eval log

# Export results
domino eval report last --format html
```

## Agent Instructions

1. Read this file to understand the goal and constraints.
2. Examine the current Domino database state via the SDK.
3. Propose a modification (document, view, query, or schema change).
4. Apply the modification via the Domino REST API.
5. Run the eval suite to measure impact.
6. If score improved: keep. Otherwise: rollback.
7. Log the result and repeat until budget exhausted.
