# End-to-end demo

A walkthrough of running the loop on the sample data, with the chat-style output you would see.

## Setup

```bash
$ node /tmp/bmad-dev-loop/bin/bmad-dev-loop.js install
installed bmad-dev-loop to ./.opencode/skills/bmad-dev-loop
scope:   project
invoke:  /bmad-dev-loop <story-keys>

$ mkdir -p _bmad-output/implementation-artifacts
$ cp .opencode/skills/bmad-dev-loop/examples/sample-sprint-status.yaml \
     _bmad-output/implementation-artifacts/sprint-status.yaml
$ cp .opencode/skills/bmad-dev-loop/examples/sample-story.md \
     _bmad-output/implementation-artifacts/4-1-dry-run-mode.md
$ cp .opencode/skills/bmad-dev-loop/examples/sample-story.md \
     _bmad-output/implementation-artifacts/4-2-posix-compliant-cli.md
$ cp .opencode/skills/bmad-dev-loop/examples/sample-story.md \
     _bmad-output/implementation-artifacts/4-3-ide-extension-socket.md
```

## Step 01 — Ingest

```
$ /bmad-dev-loop epic-4

Loop Plan (3 stories):

  [1/3] 4-1 — dry-run-mode          (ready-for-dev)
  [2/3] 4-2 — posix-compliant-cli   (ready-for-dev)
  [3/3] 4-3 — ide-extension-socket  (ready-for-dev)

Ready to start the loop? This will process 3 stories sequentially.
> y
```

After confirmation, `_bmad-output/implementation-artifacts/loop-status.yaml` is initialized with three `pending` stories.

## Step 02 — Story 4-1

### DEV

```
[1/3] 4-1 — dry-run-mode
  → dev-in-progress
  [dev subagent] running bmad-dev-story against 4-1-dry-run-mode.md
  [dev subagent] ... 8m 12s elapsed ...
  [dev subagent] summary: Added --dry-run flag with synthetic tool-call interception and per-call savings tally.
  [dev subagent] files: cmd/server/run.go, internal/proxy/dryrun.go, internal/proxy/dryrun_test.go, internal/metrics/savings.go, README.md
  [dev subagent] commit: 8f1c2d3
  → dev-done
```

### REVIEW

```
  → review-in-progress
  [review subagent] running bmad-code-review
  [review subagent] summary: Looks good. Two nit comments addressed inline.
  [review subagent] severity: high=0 medium=0 low=2
  → review-done
```

### BRANCH + PR

```
  → pr-in-progress
  $ git checkout -b story/4-1-dry-run-mode
  $ git add -A
  $ git commit -m "feat(4-1): add --dry-run flag with synthetic tool-call interception"
  $ git push origin story/4-1-dry-run-mode
  $ gh pr create --title "Story 4-1: dry-run-mode" --base main
  → pr-created (PR #247)
```

### CI

```
  → ci-in-progress
  [ci] attempt 1/3
  [ci] gh pr checks 247 → "All checks were successful" (after 184s)
  → ci-passed
```

### MERGE

```
  → merge-in-progress
  $ gh pr merge 247 --squash --delete-branch
  → merged
```

## Step 02 — Story 4-2

Identical flow, no CI retries. Wall-clock: ~13m 22s. PR #248.

## Step 02 — Story 4-3 (with CI retry)

```
[3/3] 4-3 — ide-extension-socket
  → dev-in-progress → dev-done → review-in-progress → review-done
  → pr-in-progress → pr-created (PR #249)
  → ci-in-progress
  [ci] attempt 1/3
  [ci] gh pr checks 249 → contains "fail" (golangci-lint)
  → ci fix subagent dispatched
  [ci fix] cause: ineffectual assignment in socket.go:42
  [ci fix] fix: removed unused variable, removed dead branch
  $ git commit -m "fix(4-3): address CI failure (attempt 1/3)"
  $ git push origin story/4-3-ide-extension-socket
  [ci] attempt 2/3
  [ci] gh pr checks 249 → "All checks were successful" (after 198s)
  → ci-passed
  → merge-in-progress → merged (squash, --delete-branch)
```

## After all stories

```
Loop Complete — 3 stories processed:

  4-1 — PR #247: merged, all CI passed
  4-2 — PR #248: merged, all CI passed
  4-3 — PR #249: merged, all CI passed (after 1 CI retry)

Total time: ~36m
```

The `loop-status.yaml` now matches the [sample output](/examples/sample-output). Three merged PRs, one CI retry, ~36 minutes end-to-end.

## What "good" looks like

A clean loop run has:

- `status: done` at the top.
- All stories at `merged`.
- `total_ci_failures` small relative to `total_prs_merged` (one retry out of three stories is fine).
- `total_review_issues.high = 0` (high-severity issues should have triggered a HALT, not made it through).
- A rollup summary that matches the per-story totals.

If any of those don't hold, dig into the per-story `ci_failures` and `review_summary` fields before re-running.
