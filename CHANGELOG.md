# Changelog

All notable changes to this project are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/) and the project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- VitePress documentation site with hero, guides, reference, and examples.
- Sample input (`sample-sprint-status.yaml`) and sample output (`sample-loop-status.yaml`) bundled with the skill.
- `node bin/bmad-dev-loop.js` CLI with `install`, `uninstall`, and `validate` subcommands (run from a local clone — not published to npm).
- GitHub Pages deploy workflow and CI workflow.

## [0.1.0] — 2026-07-18

### Added

- Initial release of the standalone `bmad-dev-loop` skill, ported from the `bmad-loop` skill originally delivered as part of [leanproxy-mcp#245](https://github.com/mmornati/leanproxy-mcp/pull/245).
- `SKILL.md` with full activation ritual, HALT protocol, and subagent invocation rules.
- `step-01-ingest-input.md` for story key parsing, epic expansion, and validation.
- `step-02-execute-loop.md` for the 6-phase per-story loop body (DEV → REVIEW → BRANCH → PR → CI → MERGE → ADVANCE).
- `customize.toml` with 12 configurable keys covering model overrides, merge strategy, branch prefix, CI polling, and dry-run mode.

[Unreleased]: https://github.com/mmornati/bmad-dev-loop/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/mmornati/bmad-dev-loop/releases/tag/v0.1.0
