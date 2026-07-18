# CLI reference

The `bmad-dev-loop` CLI is the install/uninstall/validate surface for the skill. Zero runtime dependencies, Node 18+.

## Synopsis

```bash
npx bmad-dev-loop <subcommand> [options]
```

## Subcommands

### `install`

Copy `skills/bmad-dev-loop/` into the target's skill folder.

```bash
npx bmad-dev-loop install [--scope <project|global>] [--target DIR]
```

| Flag | Default | Description |
|---|---|---|
| `--scope project` | yes | Write to `./.opencode/skills/` in the current directory. |
| `--scope global` | | Write to `~/.config/opencode/skills/`. |
| `--target DIR` | | Override the parent directory. `--scope` is ignored when this is set. |

Behavior:

- If the destination already exists, it is removed first.
- The folder `bmad-dev-loop/` is recreated from the package's `skills/` source.
- Exit code `0` on success, `1` on error, `2` on usage error.

### `uninstall`

Reverse of `install`.

```bash
npx bmad-dev-loop uninstall [--scope <project|global>] [--target DIR]
```

Same flags as `install`. If the target does not exist, the command exits `0` with a "nothing to remove" message.

### `validate`

Run structural checks on the source skill in this package.

```bash
npx bmad-dev-loop validate
```

Checks:

| Check | What it verifies |
|---|---|
| Required files | `SKILL.md`, `customize.toml`, `LICENSE`, `README.md` exist. |
| SKILL.md frontmatter | `name` equals directory name, matches `^[a-z0-9]+(-[a-z0-9]+)*$`, `description` is 1–1024 chars. |
| `steps/` | At least one step file. `step-01` references `step-02`. |
| `customize.toml` | Has `[workflow]` section and all required keys. |
| `examples/` | `sample-sprint-status.yaml` and `sample-loop-status.yaml` exist. |

Exit code `0` on success, `1` on any failure.

## Flags

| Flag | Effect |
|---|---|
| `-v`, `--version` | Print `bmad-dev-loop v<version>` and exit. |
| `-h`, `--help` | Print usage and exit. |

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | Validation failed or install error |
| `2` | Usage error (bad flag, unknown subcommand) |

## Programmatic API

`scripts/install.js` exports an `installSkill({ target, scope })` function for embedding the install in your own tooling.

```js
import { installSkill } from 'bmad-dev-loop/scripts/install.js';

const dest = installSkill({ scope: 'project' });
console.log('installed to', dest);
```

## Examples

```bash
# Install into the current project
npx bmad-dev-loop install

# Install globally
npx bmad-dev-loop install --scope global

# Install into a specific directory
npx bmad-dev-loop install --target ./work/.opencode/skills

# Uninstall
npx bmad-dev-loop uninstall

# Validate the source package
npx bmad-dev-loop validate
```
