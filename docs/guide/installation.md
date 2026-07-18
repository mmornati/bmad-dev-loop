# Installation

Pick the path that fits how you use the skill.

## From a local clone (recommended)

```bash
git clone https://github.com/mmornati/bmad-dev-loop.git /tmp/bmad-dev-loop
node /tmp/bmad-dev-loop/bin/bmad-dev-loop.js install
```

This copies `skills/bmad-dev-loop/` from the package into `./.opencode/skills/bmad-dev-loop/` in the current directory. Run it from the project root where you want the skill available.

To install globally instead (so it's available in every project):

```bash
node /tmp/bmad-dev-loop/bin/bmad-dev-loop.js install --scope global
```

This targets `~/.config/opencode/skills/bmad-dev-loop/`.

To install into a custom directory:

```bash
node /tmp/bmad-dev-loop/bin/bmad-dev-loop.js install --target ./my-project/.opencode/skills
```

## Manual copy

If you prefer not to use the CLI at all:

```bash
git clone https://github.com/mmornati/bmad-dev-loop.git
cp -R bmad-dev-loop/skills/bmad-dev-loop /your/project/.opencode/skills/
```

> **Why no `npm install`?** This project is a skill, not a library. `package.json` exists for CLI metadata (version, scripts, entry points) — not for registry publishing. Install from source.

## Verify

Run the structural validator on the source package to confirm everything is in order:

```bash
node /tmp/bmad-dev-loop/bin/bmad-dev-loop.js validate
```

You should see `validation passed.`

## Discoverable skill paths

OpenCode (and Claude-compatible agents) discover skills from these locations:

| Path | Scope |
|---|---|
| `./.opencode/skills/bmad-dev-loop/SKILL.md` | Project |
| `./.claude/skills/bmad-dev-loop/SKILL.md` | Project (Claude convention) |
| `./.agents/skills/bmad-dev-loop/SKILL.md` | Project (agent convention) |
| `~/.config/opencode/skills/bmad-dev-loop/SKILL.md` | Global |
| `~/.claude/skills/bmad-dev-loop/SKILL.md` | Global (Claude) |
| `~/.agents/skills/bmad-dev-loop/SKILL.md` | Global (agent) |

The `install` command targets `./.opencode/skills/` by default. After copying, you can move the folder to any of the other locations — the skill works identically.

## Uninstall

```bash
node /tmp/bmad-dev-loop/bin/bmad-dev-loop.js uninstall
```

Or:

```bash
node /tmp/bmad-dev-loop/bin/bmad-dev-loop.js uninstall --scope global
```

## Requirements

- **Node.js 18+** for the CLI (only used by the installer).
- **GitHub CLI (`gh`) authenticated** with permission to push and create PRs in your target repo. Run `gh auth status` to verify.
- **Git** configured with your user.name and user.email.
- **Working tree clean** at the start of a run. The skill does not stash or commit user changes.

## Next step

Continue to the [Quickstart](/guide/quickstart) to run the loop end-to-end on the sample data.
