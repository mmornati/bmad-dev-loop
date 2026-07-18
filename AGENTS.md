# AGENTS.md

Notes for AI coding agents working in this repository.

## Repository layout

```
bin/                     npx-installable CLI (install | uninstall | validate)
scripts/install.js       copy-on-install helper used by the CLI
skills/bmad-dev-loop/    the installable skill artifact (one folder, installable)
docs/                    VitePress documentation site
.github/workflows/       CI (ci.yml), docs deploy (docs.yml), npm release (release.yml)
```

## Conventions

- **Skill content is the source of truth.** Edits to behavior happen under `skills/bmad-dev-loop/`, not under `docs/`. The reference docs are rendered from there.
- **CLI is dependency-free.** Do not add `dependencies` to `package.json`. The CLI uses only Node built-ins. VitePress is a devDependency only.
- **Markdown only.** No mdx, no vue components unless strictly necessary. VitePress extends Markdown, that's enough.
- **LF line endings.** Enforced by `.gitattributes`.
- **No code comments unless they explain *why*.** Self-documenting names win.

## Skill editing rules

- The skill frontmatter `name` MUST equal the directory name (`bmad-dev-loop`).
- `name` MUST match `^[a-z0-9]+(-[a-z0-9]+)*$` (OpenCode skill-name rule).
- `description` MUST be 1–1024 chars and specific enough for an agent to choose correctly.
- New step files MUST be referenced from `SKILL.md`'s "First workflow step" line.

## Versioning

- This repo follows semantic versioning for the installable skill (semver).
- A change to a step file under `skills/bmad-dev-loop/steps/` is a MINOR bump if behavioral, PATCH otherwise.
- A change to the CLI is a MINOR bump unless it adds a new subcommand (MAJOR).
- Doc-only changes do not bump the version; they bump the site build.

## Build & test

```bash
node bin/bmad-dev-loop.js validate   # structural validation of the skill
pnpm install                        # only needed for `docs:dev` / `docs:build`
pnpm docs:build                     # build the VitePress site
node --test tests/                  # run unit tests
```

The skill can be installed locally for a smoke test:

```bash
node bin/bmad-dev-loop.js install --target ./.install-target
ls ./.install-target/skills/bmad-dev-loop
```

## Don't

- Don't commit secrets or CI tokens.
- Don't add runtime npm dependencies to `package.json`.
- Don't rename the skill folder without also updating `package.json` `bin`, `keywords`, `bin/bmad-dev-loop.js`, and the docs site URL.
- Don't introduce TypeScript build steps — keep the CLI plain Node ESM.
