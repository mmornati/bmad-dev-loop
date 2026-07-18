# Step contracts

Each step is a self-contained Markdown file under `skills/bmad-dev-loop/steps/`. The contract below documents what each step expects, what it produces, and what it may emit as side effects.

## step-01-ingest-input.md

### Frontmatter

```yaml
---
story_keys: []          # input from the invocation prompt
validated_stories: []   # output of this step, consumed by step-02
---
```

### Inputs

- `{story_keys}` — array of strings from the invocation prompt.
- `{sprint_status}` — path to the sprint status YAML.
- `{implementation_artifacts}` — directory containing story files.

### Behavior

1. Parse tokens matching `N-N` or `epic-N`.
2. Expand `epic-N` against the sprint status, picking up `ready-for-dev` stories.
3. For each candidate, validate sprint status and file existence.
4. Display the plan.
5. Confirm with the user (single human checkpoint).
6. Write the initial `{loop_status_file}`.

### Outputs

- `{validated_stories}` — populated in the frontmatter for the next step.
- `{loop_status_file}` — written to disk.
- A printed plan in the chat.

### Failure modes

| Condition | Result |
|---|---|
| Empty story keys | HALT blocked `no valid story keys found` |
| Empty after filtering | HALT blocked `no ready-for-dev stories in input list` |
| User declines | Re-validate or stop |

### Side effects

- Writes `{loop_status_file}`. The skill never overwrites an existing one without confirmation; on resume, it reads `current_index` from the existing file instead of clobbering.

## step-02-execute-loop.md

### Frontmatter

```yaml
---
current_index: 0    # updated as each story completes
---
```

### Inputs

- `{validated_stories}` — produced by step-01.
- `{loop_status_file}` — written and read for resume.
- Customization overrides from `customize.toml`.

### Behavior

Iterates over `{validated_stories}` starting at `current_index`. For each story:

1. **DEV** — dispatch `bmad-dev-story` subagent.
2. **REVIEW** — dispatch `bmad-code-review` subagent (with model override if set).
3. **BRANCH** — `git checkout -b` (force-recreate if exists), commit, push.
4. **PR** — `gh pr create` with assembled body.
5. **CI** — poll `gh pr checks`; auto-fix and retry on failure.
6. **MERGE** — `gh pr merge --{strategy} --delete-branch`.
7. **ADVANCE** — `git checkout main && git pull`, increment `current_index`.

After the loop, print a final summary and write `status: done` to `loop_status_file`.

### Outputs

- All git operations, PR creation, merges.
- Updated `{loop_status_file}` with per-story transitions and a final rollup.

### Failure modes

| Condition | Result |
|---|---|
| DEV subagent fails | HALT blocked `story dev failed: {key} — {details}` |
| CI failures persist | HALT blocked `CI failures persisted after {n} retries for story {key} (PR #{n})` |
| CI timeout | HALT blocked `CI timeout for story {key} (PR #{n})` |
| Merge fails | HALT blocked `merge failed for story {key} (PR #{n})` |

### Side effects

- Creates local branches (`{branch_prefix}{key}-{title}`).
- Creates remote branches via `git push`.
- Creates PRs via `gh pr create`.
- Squash/merge/rebase-merges PRs.
- Writes to `{loop_status_file}` on every transition.

## Subagent invocation contract

For both DEV and REVIEW subagents:

- **Synchronous only.** Never `run_in_background`.
- **Return shape** is documented in the prompt template inside `step-02-execute-loop.md`.
- **Preconditions** verified by the agent: `git rev-parse --abbrev-ref HEAD`, `gh auth status`, clean working tree.

## Where the contracts live

The canonical sources are the step files in the repo:

- `skills/bmad-dev-loop/steps/step-01-ingest-input.md`
- `skills/bmad-dev-loop/steps/step-02-execute-loop.md`

Any change to behavior should land there first; this reference doc is generated from those files.
