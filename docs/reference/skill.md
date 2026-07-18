# SKILL.md reference

The full content of the installable skill, rendered for browsing.

## Frontmatter

```yaml
---
name: bmad-dev-loop
description: 'Iterate over a list of story keys, executing the full delivery pipeline (dev → review → PR → CI → merge) for each one. Use when the user says "loop these stories [list]", "run the dev loop on [story keys]", "ship these stories", or "deliver these epics end-to-end".'
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: bmad
  pipeline: dev-review-pr-ci-merge
---
```

The `name` must equal the directory name. The `description` is the agent-facing "when to use me" string — agents use it to decide whether to load the skill.

## Sections at a glance

| Section | Purpose |
|---|---|
| Goal | One-sentence summary of what the skill does. |
| Your Role | Tells the agent what kind of operator it is. |
| HALT protocol | The mandatory exit pattern. |
| Subagents | The synchronous-subagent rule. |
| Conventions | Path resolution rules (`{skill-root}`, `{project-root}`, etc.). |
| Input resolution | How to parse the invocation prompt. |
| On Activation | The 6-step activation ritual. |
| Paths | Default locations for `sprint_status` and `loop_status_file`. |
| Dry run | Behavior when `workflow.dry_run = true`. |
| First workflow step | Pointer to `steps/step-01-ingest-input.md`. |

The full source lives at `skills/bmad-dev-loop/SKILL.md` in this repo. The version rendered below is the canonical reference for installed copies too.

## Source

<<< @/../skills/bmad-dev-loop/SKILL.md
