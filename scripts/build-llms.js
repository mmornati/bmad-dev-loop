// scripts/build-llms.js
//
// Post-build script: scans the built site and emits
//   dist/llms.txt        — concise index (llmstxt.org standard)
//   dist/llms-full.txt   — all doc content concatenated as Markdown
//
// Run with: node scripts/build-llms.js [dist-dir]
// Default dist-dir: docs/.vitepress/dist
//
// Intentionally zero-dependency: walks the filesystem, reads
// frontmatter, and writes the two files. No plugin, no bundler
// integration.

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, relative, basename, extname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST = process.argv[2] || join(PKG_ROOT, 'docs', '.vitepress', 'dist');
const BASE = '/bmad-dev-loop';

const SKIP_PATHS = new Set(['/', '/404', '/index']);
const SKIP_FILES = new Set(['404.html']);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function parseFrontmatter(src) {
  if (!src.startsWith('---')) return { data: {}, body: src };
  const end = src.indexOf('\n---', 3);
  if (end < 0) return { data: {}, body: src };
  const block = src.slice(3, end).trim();
  const body = src.slice(end + 4).replace(/^\r?\n/, '');
  const data = {};
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    data[m[1]] = v;
  }
  return { data, body };
}

function htmlFileToPath(absPath) {
  const rel = relative(DIST, absPath);
  const noExt = rel.replace(/\.html$/, '');
  if (noExt === 'index') return '/';
  return '/' + noExt.replace(/\\/g, '/');
}

function deriveTitle(html, data) {
  if (data.title) return data.title;
  if (data.hero) {
    try {
      const hero = JSON.parse(data.hero.replace(/^'|'$/g, '').replace(/^"|"$/g, ''));
      if (hero.name) return hero.name;
    } catch {}
  }
  const m = html.match(/<title>([^<]+)<\/title>/);
  if (m) return m[1].replace(/ — bmad-dev-loop$/, '').trim();
  return basename(html, extname(html));
}

function deriveDescription(html, data) {
  if (data.description) {
    const d = clean(data.description);
    if (d && d.length > 20) return d;
  }
  const start = html.search(/<h1\b/i);
  const after = start >= 0 ? html.slice(start) : html;
  const p = after.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  if (p) {
    const text = clean(p[1].replace(/<[^>]+>/g, ''));
    if (text && text.length > 20 && !text.startsWith('Skip to')) return text;
  }
  return '';
}

function stripHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '')
    .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');
}

function htmlToMarkdown(html) {
  let s = html;
  s = s.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  s = s.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  s = s.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  s = s.replace(/<h4\b[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');
  s = s.replace(/<h5\b[^>]*>([\s\S]*?)<\/h5>/gi, '\n##### $1\n');
  s = s.replace(/<h6\b[^>]*>([\s\S]*?)<\/h6>/gi, '\n###### $1\n');
  s = s.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n\n');
  s = s.replace(/<strong\b[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  s = s.replace(/<b\b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  s = s.replace(/<em\b[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  s = s.replace(/<i\b[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  s = s.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
  s = s.replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  s = s.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  s = s.replace(/<\/?(ul|ol|div|section|article|main|body|html|head|span|figure|figcaption|table|thead|tbody|tr|td|th)\b[^>]*>/gi, '');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<[^>]+>/g, '');
  s = s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

function clean(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function urlFor(pagePath) {
  if (pagePath === '/') return `${BASE}/`;
  return `${BASE}${pagePath}.html`;
}

function main() {
  if (!existsSync(DIST)) {
    console.error(`build-llms: dist directory not found: ${DIST}`);
    process.exit(1);
  }

  const files = walk(DIST).filter((p) => p.endsWith('.html'));
  const pages = [];

  for (const f of files) {
    const path = htmlFileToPath(f);
    if (SKIP_PATHS.has(path) || SKIP_FILES.has(basename(f))) continue;
    const raw = readFileSync(f, 'utf8');
    const { data, body } = parseFrontmatter(raw);
    const title = clean(deriveTitle(raw, data));
    const description = clean(deriveDescription(raw, data));
    const cleaned = stripHtml(body);
    const md = htmlToMarkdown(cleaned);
    pages.push({ path, title, description, md });
  }

  pages.sort((a, b) => a.path.localeCompare(b.path));

  const llmsTxt = buildLlmsTxt(pages);
  const llmsFullTxt = buildLlmsFullTxt(pages);

  writeFileSync(join(DIST, 'llms.txt'), llmsTxt);
  writeFileSync(join(DIST, 'llms-full.txt'), llmsFullTxt);

  console.log(`build-llms: ${pages.length} pages, ${llmsTxt.length} + ${llmsFullTxt.length} bytes`);
}

function buildLlmsTxt(pages) {
  const out = [];
  out.push('# bmad-dev-loop');
  out.push('');
  out.push(
    'Automated multi-story delivery orchestrator: dev \u2192 review \u2192 PR \u2192 CI \u2192 merge.',
  );
  out.push('An OpenCode / Claude skill, installable from source.');
  out.push('');
  out.push(
    'The bmad-dev-loop skill turns a list of story keys into merged PRs by running the full delivery pipeline for each story in turn: a synchronous dev subagent implements the story, a synchronous review subagent validates it, a branch is cut, a PR is opened, CI is polled and auto-fixed on failure, and the PR is merged before moving on. The original version of this skill shipped as bmad-loop inside leanproxy-mcp via PR #245; this is the standalone, hardened, distributable packaging.',
  );
  out.push('');
  out.push('## Installation');
  out.push('');
  out.push('```bash');
  out.push('git clone https://github.com/mmornati/bmad-dev-loop.git /tmp/bmad-dev-loop');
  out.push('node /tmp/bmad-dev-loop/bin/bmad-dev-loop.js install');
  out.push('```');
  out.push('');
  out.push('## Invocation');
  out.push('');
  out.push('```');
  out.push('/bmad-dev-loop 4-1 4-2 4-3');
  out.push('/bmad-dev-loop epic-4');
  out.push('```');
  out.push('');
  out.push('## Documentation');
  out.push('');
  for (const p of pages) {
    const url = urlFor(p.path);
    out.push(`- [${p.title}](${url})${p.description ? ` — ${p.description}` : ''}`);
  }
  out.push('');
  out.push('## Optional');
  out.push('');
  out.push(
    `- [Full documentation as a single file](${BASE}/llms-full.txt): all pages concatenated as Markdown.`,
  );
  out.push('');
  return out.join('\n');
}

function buildLlmsFullTxt(pages) {
  const out = [];
  out.push('# bmad-dev-loop — full documentation');
  out.push('');
  out.push('> Generated from the docs site at build time. Each section is the rendered Markdown of a single doc page, in the canonical navigation order. URLs point to the deployed site.');
  out.push('');
  for (const p of pages) {
    out.push('---');
    out.push('');
    out.push(`# ${p.title}`);
    out.push('');
    out.push(`> Source: ${urlFor(p.path)}`);
    out.push('');
    out.push(p.md);
    out.push('');
  }
  return out.join('\n');
}

main();
