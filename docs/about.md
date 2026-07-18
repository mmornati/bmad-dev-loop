# About bmad-dev-loop

## What it is

A standalone, installable **OpenCode skill** (also compatible with Claude and any agent runtime that supports the `SKILL.md` discovery convention) that turns a list of story keys into merged PRs — with no human in the loop except for the single confirmation checkpoint at the start.

## What it isn't

- **Not a planner.** Stories must already exist as files on disk, and `sprint-status.yaml` must already reflect their statuses.
- **Not a CI runner.** It uses the GitHub CLI (`gh`) to drive PRs and CI; it does not configure or replace your CI.
- **Not a replacement for `bmad-dev-story`.** It *invokes* `bmad-dev-story` as a synchronous subagent per story. The skill's whole point is to compose the existing BMAD skills into a pipeline.

## Origin

The state machine was first delivered as the **`bmad-loop`** skill inside the [leanproxy-mcp](https://github.com/mmornati/leanproxy-mcp) monorepo via [PR #245](https://github.com/mmornati/leanproxy-mcp/pull/245). It worked there. This repository is the standalone, distributable packaging of that skill — same phases, same edge case handling, with the following additions:

| Improvement | Why it matters |
|---|---|
| Skill renamed `bmad-loop` → `bmad-dev-loop` | Clearer about what it does (it loops the dev pipeline) |
| Pluggable artifact paths | No longer hard-wired to `_bmad/` layouts |
| `branch_prefix` exposed in `customize.toml` | Previously a hardcoded `story/` |
| `ci_timeout_minutes` exposed | Previous version silently stalled forever |
| `dry_run` mode | Preview a run without doing anything |
| Resume semantics documented | Re-runs pick up at first non-`merged` story |
| Sample input + sample output shipped | See [Examples](/examples/sample-sprint) |
| `npx bmad-dev-loop install` | Zero-friction installation |

## Design principles

1. **Boring is good.** No clever orchestration, no DAGs, no speculative parallelism. A `for` loop over validated stories.
2. **Subagents are synchronous.** A backgrounded subagent never hands control back; the loop would stall. Every subagent call is launch → wait → continue.
3. **Status files over memory.** The single source of truth for "where am I" is `loop-status.yaml`. Re-running the skill reads it and resumes.
4. **HALT, don't fail.** Every error path terminates with a typed `status` and a `blocking_condition`. Nothing silently exits.
5. **Customization by TOML.** Three-layer merge: defaults (`customize.toml`) → team (`_bmad/custom/bmad-dev-loop.toml`) → user (`_bmad/custom/bmad-dev-loop.user.toml`).

## Status

This project is in the 0.1.x series. The skill is feature-complete relative to its origin; the standalone repo's surface (CLI, VitePress site, sample data) is actively being polished.

## License

MIT. See the [LICENSE](https://github.com/mmornati/bmad-dev-loop/blob/main/LICENSE) file.
