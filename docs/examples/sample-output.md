# Sample output — loop-status.yaml

This is what `loop-status.yaml` looks like after the loop completes successfully on the sample input. The full source is at [`skills/bmad-dev-loop/examples/sample-loop-status.yaml`](https://github.com/mmornati/bmad-dev-loop/blob/main/skills/bmad-dev-loop/examples/sample-loop-status.yaml).

## The file

```yaml
# Loop Status
started: "2026-07-18T19:18:24.933Z"
finished: "2026-07-18T19:54:11.120Z"
status: done
total_stories: 3
current_index: 3
dry_run: false

stories:
  - key: "4-1"
    title: dry-run-mode
    path: "_bmad-output/implementation-artifacts/4-1-dry-run-mode.md"
    status: merged
    started_at: "2026-07-18T19:18:40.000Z"
    merged_at: "2026-07-18T19:31:12.000Z"
    branch: "story/4-1-dry-run-mode"
    pr_number: 247
    pr_url: "https://github.com/mmornati/leanproxy-mcp/pull/247"
    commit: "8f1c2d3"
    files_changed:
      - cmd/server/run.go
      - internal/proxy/dryrun.go
      - internal/proxy/dryrun_test.go
      - internal/metrics/savings.go
      - README.md
    review_summary: "Looks good. Two nit comments addressed inline."
    high_count: 0
    medium_count: 0
    low_count: 2
    ci_attempts: 1
    ci_total_seconds: 184
    merge_strategy: squash

  - key: "4-2"
    title: posix-compliant-cli
    path: "_bmad-output/implementation-artifacts/4-2-posix-compliant-cli.md"
    status: merged
    started_at: "2026-07-18T19:31:30.000Z"
    merged_at: "2026-07-18T19:44:08.000Z"
    branch: "story/4-2-posix-compliant-cli"
    pr_number: 248
    pr_url: "https://github.com/mmornati/leanproxy-mcp/pull/248"
    commit: "a2b4c5d"
    files_changed:
      - cmd/leanproxy-mcp/main.go
      - internal/cli/flags.go
      - internal/cli/flags_test.go
    review_summary: "Clean implementation, AC1-AC3 met."
    high_count: 0
    medium_count: 1
    low_count: 0
    ci_attempts: 1
    ci_total_seconds: 210
    merge_strategy: squash

  - key: "4-3"
    title: ide-extension-socket
    path: "_bmad-output/implementation-artifacts/4-3-ide-extension-socket.md"
    status: merged
    started_at: "2026-07-18T19:44:20.000Z"
    merged_at: "2026-07-18T19:54:11.120Z"
    branch: "story/4-3-ide-extension-socket"
    pr_number: 249
    pr_url: "https://github.com/mmornati/leanproxy-mcp/pull/249"
    commit: "e9f8a7b"
    files_changed:
      - cmd/server/socket.go
      - internal/server/socket.go
      - internal/server/socket_test.go
    review_summary: "Approved after CI fix; see attempt 2 notes."
    high_count: 0
    medium_count: 0
    low_count: 1
    ci_attempts: 2
    ci_total_seconds: 412
    ci_failures:
      - attempt: 1
        cause: "golangci-lint: ineffectual assignment in socket.go:42"
        fix: "Removed unused variable, removed dead branch."
    merge_strategy: squash

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

## What the loop prints at the end

```
Loop Complete — 3 stories processed:

  4-1 — PR #247: merged, all CI passed
  4-2 — PR #248: merged, all CI passed
  4-3 — PR #249: merged, all CI passed (after 1 CI retry)

Total time: ~36m
```

## Reading the rollup

| Field | Value | Meaning |
|---|---|---|
| `total_prs_merged` | 3 | All three stories ended in merged PRs. |
| `total_ci_failures` | 1 | One CI run failed (4-3 first attempt). |
| `total_ci_retries` | 1 | The fix subagent ran once. |
| `total_review_issues.medium` | 1 | One medium-severity review note, addressed before merge. |
| `total_review_issues.low` | 3 | Three low-severity review notes, addressed. |
| `total_files_changed` | 13 | Sum of `files_changed` arrays across stories. |
| `duration_seconds` | 2146 | Wall-clock seconds (~35m 46s). |

## How this maps to the workflow

| Phase | Reflected in `loop-status.yaml` |
|---|---|
| DEV | `dev-in-progress` → `dev-done` transitions, `files_changed`, `commit`. |
| REVIEW | `review-in-progress` → `review-done`, `review_summary`, severity counts. |
| BRANCH | `branch` field set. |
| PR | `pr-in-progress` → `pr-created`, `pr_number`, `pr_url`. |
| CI | `ci-in-progress` → `ci-passed`, `ci_attempts`, `ci_total_seconds`, `ci_failures` array. |
| MERGE | `merge-in-progress` → `merged`, `merge_strategy`, `merged_at`. |

## HALT variant

If a story halts, the top-level `status` becomes `blocked` and the offending story's status is one of:

- `dev-failed` (if the dev subagent failed).
- `ci-failed` (if CI retries exhausted).
- `ci-timeout` (if CI polling exceeded budget).
- `merge-failed` (if `gh pr merge` failed).

The `blocking_condition` is not stored in the YAML — it is the HALT message emitted to the chat. Always copy that message into your incident log.
