# Quickstart

This guide walks through running the loop on the shipped sample data. By the end you will have seen a full pipeline run — input file, plan display, lifecycle trace, sample output file.

## Before you start

Confirm the prerequisites:

```bash
node --version        # >= 18
git --version
gh --version && gh auth status
```

All three should report healthy versions. The `gh auth status` line should show your account as logged in.

## 1. Install the skill

From the project where you want to use it:

```bash
node /tmp/bmad-dev-loop/bin/bmad-dev-loop.js install
```

Expected output:

```
installed bmad-dev-loop to /your/project/.opencode/skills/bmad-dev-loop
scope:   project
invoke:  /bmad-dev-loop <story-keys>
```

## 2. Drop the sample data into your project

The skill ships sample data inside the skill folder. To try the loop on it:

```bash
mkdir -p _bmad-output/implementation-artifacts
cp .opencode/skills/bmad-dev-loop/examples/sample-sprint-status.yaml \
   _bmad-output/implementation-artifacts/sprint-status.yaml
cp .opencode/skills/bmad-dev-loop/examples/sample-story.md \
   _bmad-output/implementation-artifacts/4-1-dry-run-mode.md
cp .opencode/skills/bmad-dev-loop/examples/sample-story.md \
   _bmad-output/implementation-artifacts/4-2-posix-compliant-cli.md
cp .opencode/skills/bmad-dev-loop/examples/sample-story.md \
   _bmad-output/implementation-artifacts/4-3-ide-extension-socket.md
```

## 3. Try the dry-run first

Before dispatching real subagents, preview what the loop would do:

```bash
/bmad-dev-loop epic-4
```

With `workflow.dry_run = true` set, the skill will:

1. Parse `epic-4` → expand to `4-1`, `4-2`, `4-3`.
2. Validate each against `sprint-status.yaml`.
3. Print the plan.
4. Write `_bmad-output/implementation-artifacts/loop-status.yaml` with all three stories set to `pending` plus a `# DRY RUN` marker.
5. HALT with status `halted_dry_run`.

The plan will look like:

```
Loop Plan (3 stories):

  [1/3] 4-1 — dry-run-mode          (ready-for-dev)
  [2/3] 4-2 — posix-compliant-cli   (ready-for-dev)
  [3/3] 4-3 — ide-extension-socket  (ready-for-dev)
```

To set dry-run, add to your `_bmad/custom/bmad-dev-loop.toml`:

```toml
[workflow]
dry_run = true
```

## 4. Run the loop for real

When you're ready to dispatch real subagents:

```bash
/bmad-dev-loop 4-1 4-2 4-3
```

You will be asked once:

```
Ready to start the loop? This will process 3 stories sequentially.
```

Confirm. The skill then iterates through the stories. For each one it:

1. Dispatches a **dev subagent** running `bmad-dev-story`.
2. Dispatches a **review subagent** running `bmad-code-review`.
3. Creates a branch, commits, pushes, opens a PR.
4. Polls CI; auto-fixes on transient failures (up to `ci_max_retries`).
5. Merges the PR with the configured strategy (default: squash).
6. Moves on to the next story.

## 5. Inspect the output

After the loop finishes, open:

```bash
cat _bmad-output/implementation-artifacts/loop-status.yaml
```

You should see something like the [sample output](/examples/sample-output). Every story's status transitions are recorded, plus a rollup summary at the bottom.

## What it looked like on the leanproxy-mcp origin run

| Phase | 4-1 (dry-run-mode) | 4-2 (posix-cli) | 4-3 (ide-socket) |
|---|---|---|---|
| DEV | 8m 12s | 7m 58s | 6m 02s |
| REVIEW | 1m 14s | 1m 30s | 1m 11s |
| PR | 0m 22s | 0m 18s | 0m 25s |
| CI (attempt 1) | 3m 04s ✅ | 3m 30s ✅ | 3m 18s ❌ lint |
| CI (attempt 2) | — | — | 3m 34s ✅ |
| MERGE | 0m 06s | 0m 06s | 0m 07s |
| **Total** | **12m 58s** | **13m 22s** | **14m 37s** |

Run wall-clock for the whole loop: **~36 minutes**, mostly human-waiting on CI.

## Next step

Continue to [The workflow](/guide/workflow) for a deeper look at each phase.
