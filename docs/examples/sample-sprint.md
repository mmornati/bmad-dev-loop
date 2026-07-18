# Sample input — sprint-status.yaml

This is the file the loop reads at step-01 to validate story keys and expand epic references. The full source is at [`skills/bmad-dev-loop/examples/sample-sprint-status.yaml`](https://github.com/mmornati/bmad-dev-loop/blob/main/skills/bmad-dev-loop/examples/sample-sprint-status.yaml).

## The file

```yaml
generated: "2026-07-18T19:00:00Z"
project: Sample Project
tracking_system: local-files

development_status:
  "4-1-dry-run-mode": ready-for-dev
  "4-2-posix-compliant-cli": ready-for-dev
  "4-3-ide-extension-socket": ready-for-dev
  "4-4-cost-attribution-report": in-progress
  "5-1-token-savings-calculator": review
  "5-2-cost-budget-alerts": done

epics:
  - id: 4
    title: Dry-run & CLI hardening
    stories:
      - key: "4-1"
        title: dry-run-mode
        status: ready-for-dev
        file: "4-1-dry-run-mode.md"
      - key: "4-2"
        title: posix-compliant-cli
        status: ready-for-dev
        file: "4-2-posix-compliant-cli.md"
      - key: "4-3"
        title: ide-extension-socket
        status: ready-for-dev
        file: "4-3-ide-extension-socket.md"
      - key: "4-4"
        title: cost-attribution-report
        status: in-progress
        file: "4-4-cost-attribution-report.md"

  - id: 5
    title: Token economics
    stories:
      - key: "5-1"
        title: token-savings-calculator
        status: review
        file: "5-1-token-savings-calculator.md"
      - key: "5-2"
        title: cost-budget-alerts
        status: done
        file: "5-2-cost-budget-alerts.md"
```

## How the loop interprets it

| Input | Behavior |
|---|---|
| `/bmad-dev-loop 4-1 4-2 4-3` | Validate each against `epics[4].stories`. All three are `ready-for-dev` → include. |
| `/bmad-dev-loop epic-4` | Expand to `4-1 4-2 4-3 4-4` based on `epics[4].stories`. Only stories with `status: ready-for-dev` are kept → `4-1 4-2 4-3`. |
| `/bmad-dev-loop 4-1 5-1` | `4-1` is `ready-for-dev` → include. `5-1` is `review` → skip with warning. |
| `/bmad-dev-loop epic-5` | No `ready-for-dev` stories in epic 5 → HALT `no ready-for-dev stories in input list`. |

## What the loop prints

When you invoke `/bmad-dev-loop epic-4` against the sample data:

```
Loop Plan (3 stories):

  [1/3] 4-1 — dry-run-mode          (ready-for-dev)
  [2/3] 4-2 — posix-compliant-cli   (ready-for-dev)
  [3/3] 4-3 — ide-extension-socket  (ready-for-dev)

Ready to start the loop? This will process 3 stories sequentially.
```

You confirm once, and the loop starts.

## What the loop writes

After confirmation, `_bmad-output/implementation-artifacts/loop-status.yaml` looks like:

```yaml
# Loop Status
started: "2026-07-18T19:18:24.933Z"
status: in_progress
total_stories: 3
current_index: 0
dry_run: false

stories:
  - key: "4-1"
    status: pending
  - key: "4-2"
    status: pending
  - key: "4-3"
    status: pending
```

From this point the loop writes to this file on every transition. The final state is shown on the [sample output](/examples/sample-output) page.
