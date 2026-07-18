# Troubleshooting

Common problems and how to debug them.

## `validation failed: ...` on `node /tmp/bmad-dev-loop/bin/bmad-dev-loop.js validate`

The validator checks the skill structure. Run it locally and read the output:

```bash
node /tmp/bmad-dev-loop/bin/bmad-dev-loop.js validate
```

Failures are usually one of:

- **Missing `SKILL.md` / `customize.toml` / `LICENSE` / `README.md`** — these are required.
- **`SKILL.md` frontmatter `name` mismatch** — must equal the directory name (`bmad-dev-loop`) and match `^[a-z0-9]+(-[a-z0-9]+)*$`.
- **Missing keys in `customize.toml`** — every key listed in `docs/guide/customization` is required.
- **`step-01` doesn't reference `step-02`** — the chain is broken; restore the chain integrity.

## "no valid story keys found"

Your invocation prompt has no `N-N` or `epic-N` tokens after the skill name. Examples of valid invocations:

```
/bmad-dev-loop 4-1 4-2 4-3
/bmad-dev-loop epic-4
/bmad-dev-loop 4-1
```

Anything else (a sentence, a sentence with story names but no keys) will not match.

## "no ready-for-dev stories in input list"

All stories in the input were filtered out. Common causes:

- All stories have status `review`, `done`, or `blocked` in `sprint-status.yaml`.
- The story files don't exist at `{implementation_artifacts}/{key}.md`.
- The sprint status file path is wrong.

Check by running:

```bash
cat _bmad-output/implementation-artifacts/sprint-status.yaml
ls _bmad-output/implementation-artifacts/*.md
```

## Dev subagent fails immediately

The subagent prompt instructs it to verify:

- `git rev-parse --abbrev-ref HEAD` — current branch.
- `gh auth status` — authenticated.
- `git status --porcelain` — empty working tree.

If any of these fail, the subagent surfaces the failure. Common causes:

- **Not authenticated with `gh`** — run `gh auth login`.
- **Dirty working tree** — commit, stash, or `git checkout -- .` first.
- **Detached HEAD** — `git checkout main`.

## CI loop never finishes

Either:

- **CI is genuinely slow**: increase `ci_timeout_minutes` and `ci_poll_interval_seconds`.
- **A check is stuck in pending**: cancel it in the GitHub UI, then re-invoke the loop (the resume will pick up at this story).

The loop emits status updates to `loop-status.yaml` on every transition, so you can inspect the live state:

```bash
watch -n 5 cat _bmad-output/implementation-artifacts/loop-status.yaml
```

## Merge fails with conflicts

The most common cause: the base branch (`main`) moved while the story was in flight. To recover:

1. The loop HALTs with `merge failed for story {key}`.
2. Manually rebase the story branch onto `main`:
   ```bash
   git checkout story/{key}-{title}
   git rebase main
   git push --force
   ```
3. Re-invoke the loop. Resume semantics will continue from this story.

## "gh: command not found"

Install the GitHub CLI: <https://cli.github.com/>. The skill is hard-wired to `gh`; it does not fall back to curl + token auth.

## After a HALT, do I lose progress?

No. `loop-status.yaml` is the source of truth. Every status transition is recorded. Re-invoke the skill and it resumes at the first non-`merged` story.

To start over from the top, delete the file:

```bash
rm _bmad-output/implementation-artifacts/loop-status.yaml
```

## Where do I find logs?

The skill does not emit structured logs. The two diagnostic artifacts are:

- `_bmad-output/implementation-artifacts/loop-status.yaml` — the loop's state machine output.
- The PR comments and CI logs in your GitHub repo — per-story work artifacts.

For a full audit trail, attach your agent's transcript to the loop run.
