# Customization

The skill is configured through a 3-layer TOML system. Place overrides under `_bmad/custom/`.

## Layers

| Layer | Path | Precedence |
|---|---|---|
| Defaults | `skills/bmad-dev-loop/customize.toml` (shipped) | Lowest |
| Team | `_bmad/custom/bmad-dev-loop.toml` | Middle |
| User | `_bmad/custom/bmad-dev-loop.user.toml` | Highest |

Each layer is a partial TOML document. The skill merges them in order. **Scalars override**, **tables deep-merge**, and **arrays of tables** keyed by `code` or `id` replace matching entries (and append new ones); all other arrays append.

## All configurable keys

| Key | Type | Default | Description |
|---|---|---|---|
| `activation_steps_prepend` | array of strings | `[]` | Instructions to run before config load |
| `activation_steps_append` | array of strings | `[]` | Instructions to run after config load, before step 01 |
| `persistent_facts` | array of strings | `[file:**/project-context.md]` | Facts kept in context for the whole run |
| `on_complete` | string | `""` | Final instruction run by HALT |
| `review_model_override` | string | `""` | Model to route the review subagent to |
| `ci_fix_agent_model_override` | string | `""` | Model to route the CI-fix subagent to |
| `merge_strategy` | string | `"squash"` | `squash` \| `merge` \| `rebase` |
| `branch_prefix` | string | `"story/"` | Prefix for per-story branches |
| `ci_poll_interval_seconds` | integer | `30` | Seconds between CI status polls |
| `ci_max_retries` | integer | `3` | Fix attempts before halting on persistent CI failure |
| `ci_timeout_minutes` | integer | `30` | Total CI polling budget before halting |
| `dry_run` | boolean | `false` | If true, plan only — no work is performed |

## Recipe: bigger CI budget

`_bmad/custom/bmad-dev-loop.toml`:

```toml
[workflow]
ci_poll_interval_seconds = 60
ci_max_retries = 5
ci_timeout_minutes = 60
```

## Recipe: route review to a different model

```toml
[workflow]
review_model_override = "claude-sonnet-4-20250514"
```

The review subagent prompt includes a routing instruction at the top. If your runtime ignores the instruction, the override is a no-op.

## Recipe: rebase merge instead of squash

```toml
[workflow]
merge_strategy = "rebase"
```

The `gh pr merge` invocation becomes:

```bash
gh pr merge {pr_number} --rebase --delete-branch
```

## Recipe: switch to a different branch prefix

```toml
[workflow]
branch_prefix = "story/"
```

Or for a different convention:

```toml
[workflow]
branch_prefix = "feat/"
```

Branches become `feat/4-1-dry-run-mode`.

## Recipe: dry-run by default for the team

```toml
[workflow]
dry_run = true
```

When every team member pulls this file, every loop invocation becomes a preview until someone manually flips the flag.

## Recipe: persistent facts beyond project-context

```toml
[workflow]
persistent_facts = [
  "file:{project-root}/**/project-context.md",
  "file:{project-root}/docs/architecture.md",
  "Always run tests before committing.",
]
```

File entries may use globs. Other entries are facts verbatim.

## Merge example

Defaults:

```toml
[workflow]
ci_poll_interval_seconds = 30
ci_max_retries = 3
dry_run = false
```

Team override (`_bmad/custom/bmad-dev-loop.toml`):

```toml
[workflow]
ci_max_retries = 5
dry_run = true
```

Effective merged config:

```toml
[workflow]
ci_poll_interval_seconds = 30   # from default
ci_max_retries = 5              # overridden by team
dry_run = true                  # overridden by team
```

If a user override (`_bmad/custom/bmad-dev-loop.user.toml`) further sets `dry_run = false`, that wins for that user only.

## Schema reference

See [`reference/schema`](/reference/schema) for the full schema of `loop-status.yaml`, the file the skill writes and reads.
