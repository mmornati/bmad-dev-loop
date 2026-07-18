# Safety & HALT

This page documents every way the loop can stop. The principle is: **nothing silently exits.** Every exit goes through the HALT protocol with a typed status and, where applicable, a blocking condition.

## The HALT protocol

When the skill ends a turn (whether by completing or by failing), it:

1. Appends a loop-status entry to `{loop_status_file}`.
2. Runs `python3 {project-root}/_bmad/scripts/resolve_customization.py --skill {skill-root} --key workflow.on_complete` to check for a team-defined terminal hook.
3. If the resolved `on_complete` is non-empty, follows it as the final instruction before exiting.
4. Stops the workflow.

The only sanctioned way to end a turn.

## Terminal statuses

| Status | Meaning | Blocking condition |
|---|---|---|
| `done` | All stories reached `merged`. | n/a |
| `blocked` | An invariant failed. The skill pauses. | always set; see table below |
| `halted_dry_run` | `workflow.dry_run = true`. Plan displayed, no work performed. | n/a |

## Blocking conditions

| Condition | When |
|---|---|
| `no subagents` | The runtime cannot dispatch synchronous subagents. The skill cannot work without them. |
| `no valid story keys found` | Invocation prompt contained no `N-N` or `epic-N` tokens. |
| `no ready-for-dev stories in input list` | All stories were filtered out due to status (none were `ready-for-dev` or `in-progress`). |
| `story dev failed: {key} — {details}` | The dev subagent returned an error or did not complete. |
| `CI failures persisted after {n} retries for story {key} (PR #{n})` | `ci_attempts >= ci_max_retries`. |
| `CI timeout for story {key} (PR #{n})` | Polling exceeded `ci_timeout_minutes`. |
| `merge failed for story {key} (PR #{n})` | `gh pr merge` exited non-zero. Conflicts, branch protection, or auth. |
| `no story keys provided` | (Rare) variant of `no valid story keys found` when prompt was empty. |

## Edge case handling matrix

This is the canonical list of how the loop responds to common issues. Reproduced verbatim from the origin PR.

| Situation | Response |
|---|---|
| Story not in `ready-for-dev` status | Skipped with warning. Loop continues with the next story. |
| DEV subagent fails | HALT (no skip). Operator must inspect and re-run. |
| Review finds blocking issues | Fix subagent dispatched, then re-reviewed. If still failing, HALT. |
| CI fails persistently | HALT after `ci_max_retries`. |
| Merge conflict | HALT with conflict details for manual resolution. |
| Branch already exists locally | Force-deleted and recreated. |
| CI timeout (> `ci_timeout_minutes`) | HALT with timeout condition. |
| `gh` not authenticated | Subagent precondition; will surface as a dev-subagent failure. |
| Working tree dirty | Subagent precondition; will surface as a dev-subagent failure. |

## Resume semantics

Re-running the skill after a HALT is the standard recovery flow:

1. The skill reads `{loop_status_file}`.
2. If `current_index` is present, it resumes from that index.
3. The first story that is not `merged` is the resume target.
4. Already-`merged` stories are not re-processed.

To re-run from scratch, delete `{loop_status_file}` (or set its `current_index: 0` and reset all story statuses to `pending`).

## Dry run as a safety net

`workflow.dry_run = true` is the recommended way to preview any unfamiliar input:

```bash
# In _bmad/custom/bmad-dev-loop.toml
[workflow]
dry_run = true
```

Then invoke normally:

```
/bmad-dev-loop epic-4
```

The skill will:

1. Parse and validate.
2. Display the plan.
3. Write `loop-status.yaml` with all stories `pending` and a `# DRY RUN` marker.
4. HALT with status `halted_dry_run`.

No subagents. No git operations. No PRs.

## Things the skill does NOT do

It will **never**:

- Force-push to `main`.
- Skip stories silently (any skip is logged with a warning).
- Continue after a HALT (status is final; you re-invoke to resume).
- Run subagents in the background.
- Auto-merge if CI is not green.
- Open PRs against the base branch without an explicit `--base` flag (always defaults to `main`).

If you need any of these behaviors, modify the skill — don't expect them.
