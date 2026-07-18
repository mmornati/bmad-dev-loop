# loop-status.yaml schema

The loop-status file is the persistent state of a loop run. The skill reads it on every invocation (for resume) and writes it on every transition.

## Top-level shape

```yaml
---
# Loop Status
started: "2026-07-18T19:18:24.933Z"     # ISO 8601, set at loop start
finished: "2026-07-18T19:54:11.120Z"     # ISO 8601, set when status = done
status: done                              # pending | in_progress | done | blocked | halted_dry_run
total_stories: 3                          # integer
current_index: 3                          # 0-based index of next story to process
dry_run: false                            # boolean, true if loop ran in dry-run mode
---

stories:
  - key: "4-1"
    title: dry-run-mode
    # ... per-story record (see below)

summary:
  # ... aggregate stats (see below)
```

## Per-story record

| Field | Type | When set | Description |
|---|---|---|---|
| `key` | string | step-01 | Story key (e.g. `4-1`). |
| `title` | string | step-01 | Story title (e.g. `dry-run-mode`). |
| `path` | string | step-01 | Path to the story file. |
| `status` | enum | every transition | One of: `pending`, `dev-in-progress`, `dev-done`, `review-in-progress`, `review-done`, `pr-in-progress`, `pr-created`, `ci-in-progress`, `ci-passed`, `merge-in-progress`, `merged`, `blocked`. |
| `started_at` | timestamp | on first transition | When the story was first picked up. |
| `merged_at` | timestamp | on merge | When the PR was merged. |
| `branch` | string | phase 3 | Local + remote branch name. |
| `pr_number` | integer | phase 3 | GitHub PR number. |
| `pr_url` | string | phase 3 | GitHub PR URL. |
| `commit` | string | phase 3 | HEAD commit hash on the story branch. |
| `files_changed` | array of strings | phase 1 | Files created or modified by the dev subagent. |
| `review_summary` | string | phase 2 | Short summary from the review subagent. |
| `high_count` / `medium_count` / `low_count` | integer | phase 2 | Severity counts. |
| `ci_attempts` | integer | phase 4 | Number of CI attempts including the first. |
| `ci_total_seconds` | integer | phase 4 | Wall-clock seconds spent polling CI. |
| `ci_failures` | array of objects | phase 4 | Per-attempt failure records (see below). |
| `merge_strategy` | string | phase 5 | The strategy used (mirror of `workflow.merge_strategy`). |

### `ci_failures` entry

```yaml
ci_failures:
  - attempt: 1
    cause: "golangci-lint: ineffectual assignment in socket.go:42"
    fix: "Removed unused variable, removed dead branch."
```

## Rollup summary

After all stories are processed, a `summary` block is appended:

```yaml
summary:
  total_prs_merged: 3
  total_ci_failures: 1
  total_ci_retries: 1
  total_review_issues:
    high: 0
    medium: 1
    low: 3
  total_files_changed: 13
  duration_seconds: 2146
```

## Dry-run marker

When `workflow.dry_run = true`, the loop-status file is written with:

- A `# DRY RUN` comment near the top.
- `dry_run: true` in the top-level YAML.
- All story statuses set to `pending`.
- No `summary` block.
- The loop HALTs with status `halted_dry_run`.

## Resume algorithm

When the skill starts:

1. If `{loop_status_file}` does not exist, behave as if `current_index: 0` and `status: pending`.
2. If it exists, read `current_index` from the frontmatter.
3. Find the first story at index ≥ `current_index` whose `status` is not `merged`.
4. Process from that index to the end of `{validated_stories}`.

To start over: delete the file, or set `current_index: 0` and reset all stories to `pending`.

## Full example

See the [sample output](/examples/sample-output) for a complete end-to-end trace.
