---
layout: home

hero:
  name: bmad-dev-loop
  text: Stories in, merged PRs out.
  tagline: An unattended orchestrator that runs the full delivery pipeline for every story in your sprint — dev, review, PR, CI, merge — without you in the loop.
  actions:
    - theme: brand
      text: Get started
      link: /guide/installation
    - theme: alt
      text: View on GitHub
      link: https://github.com/mmornati/bmad-dev-loop
    - theme: alt
      text: Quickstart
      link: /guide/quickstart

features:
  - title: Unattended delivery
    icon: 🚀
    details: >
      One invocation, many stories. The skill walks your list, dispatches a
      subagent to implement each story, ships a PR, waits on CI, and merges —
      then moves on. You only step in if something genuinely blocks.
  - title: Subagent-native
    icon: 🤖
    details: >
      Built on synchronous subagents. The dev and review phases invoke your
      existing `bmad-dev-story` and `bmad-code-review` skills — no duplicated
      logic, no extra prompts to maintain.
  - title: CI auto-fix
    icon: 🛠️
    details: >
      When CI fails, the loop dispatches a focused fix subagent, commits the
      patch, and re-polls. You set how many retries before it gives up.
  - title: Pluggable
    icon: 🧩
    details: >
      TOML-based customization, three merge strategies, configurable branch
      prefix, model overrides for review and CI-fix subagents. Drop a
      `bmad-dev-loop.toml` in `_bmad/custom/` and you're overriding.
  - title: Dry-run mode
    icon: 👀
    details: >
      Preview the whole loop before anything happens. The skill validates
      story keys, expands epic refs, prints the plan, then halts. No branches,
      no PRs, no risk.
  - title: Resumable
    icon: ♻️
    details: >
      The `loop-status.yaml` file is the source of truth for resume. Re-run
      after a crash and the loop picks up at the first non-`merged` story.
---

## The pipeline, at a glance

```mermaid
flowchart LR
    A[Story list] --> B[Validate]
    B --> C[Confirm]
    C --> D[Dev subagent]
    D --> E[Review subagent]
    E --> F{Issues?}
    F -- yes --> D
    F -- no --> G[Branch]
    G --> H[PR]
    H --> I{CI passing?}
    I -- no, retries left --> J[CI fix subagent]
    J --> H
    I -- no, out of retries --> K[HALT]
    I -- yes --> L[Merge]
    L --> M{More stories?}
    M -- yes --> B
    M -- no --> N[Done]
```

## Provenance

Originally delivered as **`bmad-loop`** in [leanproxy-mcp#245](https://github.com/mmornati/leanproxy-mcp/pull/245).
This is the standalone, hardened, distributable version — same state machine, same edge case handling, with a 3-layer TOML config, an `npx`-friendly installer, dry-run mode, and full resume semantics.

## License

MIT. © 2026 [Massimo Mornati](https://github.com/mmornati).
