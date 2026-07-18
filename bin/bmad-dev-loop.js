#!/usr/bin/env node
// bmad-dev-loop CLI
//
// Subcommands:
//   install [--target DIR] [--scope project|global]   Copy skills/bmad-dev-loop to .opencode/ or ~/.config/opencode/
//   uninstall [--target DIR] [--scope project|global] Remove a previously-installed copy
//   validate                                          Structural checks on the skill (frontmatter, steps, customize.toml)
//   --version | -v                                    Print version
//   --help    | -h                                    Print usage
//
// Zero runtime dependencies — Node 18+ built-ins only.

import { existsSync, statSync, readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { dirname, resolve, join, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const PKG_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const SKILL_SRC = join(PKG_DIR, 'skills', 'bmad-dev-loop');

const BANNER = `bmad-dev-loop  v${readPackageVersion()}
automated multi-story delivery orchestrator (dev \u2192 review \u2192 PR \u2192 CI \u2192 merge)`;

function readPackageVersion() {
  try {
    const pkg = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

const HELP = `Usage:
  node bin/bmad-dev-loop.js install [--target DIR] [--scope <project|global>]
  node bin/bmad-dev-loop.js uninstall [--target DIR] [--scope <project|global>]
  node bin/bmad-dev-loop.js validate
  node bin/bmad-dev-loop.js --version
  node bin/bmad-dev-loop.js --help

Subcommands:
  install       Copy skills/bmad-dev-loop into the target's skill folder.
                Default scope=project writes to ./.opencode/skills/bmad-dev-loop/.
                Default scope=global writes to ~/.config/opencode/skills/bmad-dev-loop/.
                --target DIR overrides the parent directory.
  uninstall     Reverse of install.
  validate      Run structural checks on the source skill in this package.

Exit codes:
  0  success
  1  validation failed / install error
  2  usage error
`;

function parseArgs(argv) {
  const out = { subcommand: null, opts: {}, flags: new Set() };
  let i = 0;
  if (argv[i] && !argv[i].startsWith('-')) {
    out.subcommand = argv[i];
    i += 1;
  }
  for (; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '-h' || a === '--help') {
      out.flags.add('help');
      continue;
    }
    if (a === '-v' || a === '--version') {
      out.flags.add('version');
      continue;
    }
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq >= 0) {
        out.opts[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const key = a.slice(2);
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith('--') && !isFlag(next)) {
          out.opts[key] = next;
          i += 1;
        } else {
          out.opts[key] = true;
        }
      }
    }
  }
  return out;
}

function isFlag(s) {
  return s === '-h' || s === '--help' || s === '-v' || s === '--version';
}

function die(code, msg) {
  process.stderr.write(`bmad-dev-loop: ${msg}\n`);
  process.exit(code);
}

function info(msg) {
  process.stdout.write(`${msg}\n`);
}

function resolveScope(opts) {
  const scope = opts.scope ?? 'project';
  if (scope !== 'project' && scope !== 'global') {
    die(2, `--scope must be 'project' or 'global' (got: ${scope})`);
  }
  let base;
  if (opts.target) {
    base = resolve(process.cwd(), String(opts.target));
  } else if (scope === 'global') {
    const home = process.env.HOME || process.env.USERPROFILE;
    if (!home) die(2, 'cannot determine HOME; pass --target DIR');
    base = join(home, '.config', 'opencode', 'skills');
  } else {
    base = resolve(process.cwd(), '.opencode', 'skills');
  }
  return { scope, base };
}

function cmdInstall(opts) {
  if (!existsSync(SKILL_SRC)) {
    die(1, `source skill not found at ${SKILL_SRC} (this package looks broken)`);
  }
  const { scope, base } = resolveScope(opts);
  const dest = join(base, 'bmad-dev-loop');

  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
    info(`removed existing ${relative(process.cwd(), dest)}`);
  }
  mkdirSync(dest, { recursive: true });
  cpSync(SKILL_SRC, dest, { recursive: true });

  info('');
  info(`installed bmad-dev-loop to ${dest}`);
  info(`scope:   ${scope}`);
  info(`invoke:  /bmad-dev-loop <story-keys>`);
  info('');
}

function cmdUninstall(opts) {
  const { scope, base } = resolveScope(opts);
  const dest = join(base, 'bmad-dev-loop');
  if (!existsSync(dest)) {
    info(`nothing to remove at ${dest}`);
    return;
  }
  rmSync(dest, { recursive: true, force: true });
  info(`removed ${relative(process.cwd(), dest)}`);
}

function extractFrontmatter(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  const block = text.slice(3, end).trim();
  const out = {};
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

async function cmdValidate() {
  const errors = [];
  const ok = (msg) => info(`  ok    ${msg}`);
  const fail = (msg) => { errors.push(msg); info(`  FAIL  ${msg}`); };

  info('validating skills/bmad-dev-loop/');
  info('');

  // 1. Required files
  for (const f of ['SKILL.md', 'customize.toml', 'LICENSE', 'README.md']) {
    const p = join(SKILL_SRC, f);
    if (existsSync(p) && statSync(p).isFile()) ok(f);
    else fail(`missing required file: ${f}`);
  }

  // 2. SKILL.md frontmatter
  const skillPath = join(SKILL_SRC, 'SKILL.md');
  if (existsSync(skillPath)) {
    const text = await readFile(skillPath, 'utf8');
    const fm = extractFrontmatter(text);
    if (!fm) {
      fail('SKILL.md missing YAML frontmatter');
    } else {
      if (fm.name === 'bmad-dev-loop') ok('SKILL.md frontmatter name = "bmad-dev-loop"');
      else fail(`SKILL.md name should be "bmad-dev-loop", got "${fm.name}"`);

      if (fm.name && NAME_RE.test(fm.name)) ok(`SKILL.md name matches ${NAME_RE}`);
      else fail(`SKILL.md name "${fm.name}" does not match ${NAME_RE}`);

      if (fm.description && fm.description.length >= 1 && fm.description.length <= 1024) {
        ok(`SKILL.md description length ok (${fm.description.length} chars)`);
      } else {
        fail(`SKILL.md description must be 1-1024 chars (got ${fm.description?.length ?? 0})`);
      }
    }
  }

  // 3. steps/ referenced from SKILL.md
  const stepsDir = join(SKILL_SRC, 'steps');
  if (existsSync(stepsDir) && statSync(stepsDir).isDirectory()) {
    const stepFiles = readdirSync(stepsDir).filter((f) => f.endsWith('.md'));
    if (stepFiles.length >= 1) ok(`steps/ contains ${stepFiles.length} file(s): ${stepFiles.join(', ')}`);
    else fail('steps/ contains no .md files');

    // step-01 must reference step-02 (chain integrity)
    const step1 = join(stepsDir, 'step-01-ingest-input.md');
    const step2 = join(stepsDir, 'step-02-execute-loop.md');
    if (existsSync(step1) && existsSync(step2)) {
      const s1 = await readFile(step1, 'utf8');
      if (s1.includes('step-02-execute-loop.md')) ok('step-01 references step-02');
      else fail('step-01 does not reference step-02-execute-loop.md');
    }
  } else {
    fail('steps/ directory missing');
  }

  // 4. customize.toml — minimal TOML sanity (no full parser; structural checks)
  const customizePath = join(SKILL_SRC, 'customize.toml');
  if (existsSync(customizePath)) {
    const c = await readFile(customizePath, 'utf8');
    if (/^\s*\[workflow\]\s*$/m.test(c)) ok('customize.toml has [workflow] section');
    else fail('customize.toml missing [workflow] section');

    const requiredKeys = [
      'activation_steps_prepend',
      'activation_steps_append',
      'persistent_facts',
      'on_complete',
      'review_model_override',
      'merge_strategy',
      'ci_poll_interval_seconds',
      'ci_max_retries',
    ];
    for (const k of requiredKeys) {
      if (new RegExp(`^${k}\\s*=`,'m').test(c)) ok(`customize.toml defines ${k}`);
      else fail(`customize.toml missing key: ${k}`);
    }
  }

  // 5. examples/ presence
  const examplesDir = join(SKILL_SRC, 'examples');
  if (existsSync(examplesDir) && statSync(examplesDir).isDirectory()) {
    const files = readdirSync(examplesDir);
    if (files.includes('sample-sprint-status.yaml')) ok('examples/sample-sprint-status.yaml present');
    else fail('examples/sample-sprint-status.yaml missing');
    if (files.includes('sample-loop-status.yaml')) ok('examples/sample-loop-status.yaml present');
    else fail('examples/sample-loop-status.yaml missing');
  } else {
    fail('examples/ directory missing');
  }

  info('');
  if (errors.length === 0) {
    info('validation passed.');
    process.exit(0);
  } else {
    info(`validation failed: ${errors.length} error(s)`);
    process.exit(1);
  }
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    process.stdout.write(`${BANNER}\n\n${HELP}`);
    process.exit(0);
  }
  const { subcommand, opts, flags } = parseArgs(argv);

  if (flags.has('help')) {
    process.stdout.write(`${BANNER}\n\n${HELP}`);
    process.exit(0);
  }
  if (flags.has('version')) {
    process.stdout.write(`bmad-dev-loop v${readPackageVersion()}`);
    process.exit(0);
  }

  switch (subcommand) {
    case 'install':
      cmdInstall(opts);
      break;
    case 'uninstall':
      cmdUninstall(opts);
      break;
    case 'validate':
      await cmdValidate();
      break;
    default:
      process.stderr.write(`bmad-dev-loop: unknown subcommand: ${subcommand ?? '(none)'}\n\n${HELP}`);
      process.exit(2);
  }
}

main().catch((err) => {
  process.stderr.write(`bmad-dev-loop: unexpected error: ${err?.stack || err}\n`);
  process.exit(1);
});
