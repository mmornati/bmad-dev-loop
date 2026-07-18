# Contributing

Thanks for your interest in `bmad-dev-loop`. This is a small, dependency-free project. The contribution flow is intentionally lightweight.

## Quick contribution flow

1. Fork the repository.
2. Create a branch: `git checkout -b feat/your-change`.
3. Make your changes. **Skill edits go under `skills/bmad-dev-loop/`** — that folder is the source of truth; the docs site renders from there.
4. Validate locally: `node /tmp/bmad-dev-loop/bin/bmad-dev-loop.js validate`.
5. Build the docs site locally: `pnpm install && pnpm docs:build`.
6. Open a PR. The CI workflow will run `validate` and a markdown-link check.
7. After review, a maintainer will tag a release.

## Where to make changes

| Want to change... | Edit... |
|---|---|
| What the skill does | `skills/bmad-dev-loop/SKILL.md` and/or `skills/bmad-dev-loop/steps/*.md` |
| Configuration defaults | `skills/bmad-dev-loop/customize.toml` |
| The CLI | `bin/bmad-dev-loop.js` and `scripts/install.js` |
| User-facing docs | `docs/**` |
| Site theme/colors | `docs/.vitepress/theme/custom.css` and `docs/.vitepress/config.ts` |

## Conventions

- **LF line endings** — enforced by `.gitattributes`.
- **No new runtime dependencies** — `package.json` `dependencies` must remain empty. The CLI is plain Node ESM, VitePress is a devDependency.
- **No code comments unless they explain *why*** — self-documenting names win.
- **Skill name is `bmad-dev-loop`** — keep it that way across all references (frontmatter, package.json `bin`, CLI banner, README badges).
- **Skill `name` regex** — must match `^[a-z0-9]+(-[a-z0-9]+)*$`. The validator enforces this.

## Validation

```bash
node bin/bmad-dev-loop.js validate
```

Should report `validation passed.` before opening a PR.

## Code of conduct

Be kind. We're all here to ship stories, not to win arguments.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
