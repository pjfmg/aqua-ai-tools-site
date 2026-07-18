import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const requiredFiles = [
  'CHANGELOG.md', 'SECURITY.md', 'CONTRIBUTING.md', 'README.md', '.env.example',
  'docs/architecture.md', 'docs/api-v1.openapi.yaml', 'docs/foundation-compliance-matrix.md',
  'docs/technical-debt-register.md', 'docs/deployment-checklist.md', 'docs/operations-runbook.md',
  'docs/releases/0.1.0-review.md', 'public/_headers', 'public/_redirects', 'vercel.json',
  '.github/workflows/quality.yml', '.github/dependabot.yml',
];
for (const file of requiredFiles) assert.ok(fs.existsSync(file), `required release artifact missing: ${file}`);

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
assert.match(pkg.version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
assert.equal(lock.version, pkg.version, 'package-lock version must match package version');
assert.equal(lock.packages?.['']?.version, pkg.version, 'root lock package version must match');

const envExample = fs.readFileSync('.env.example', 'utf8');
const gitignore = fs.readFileSync('.gitignore', 'utf8');
assert.match(gitignore, /^\.env$/m, '.gitignore must exclude .env');
assert.match(gitignore, /^\.env\.\*$/m, '.gitignore must exclude environment variants');
for (const line of envExample.split(/\r?\n/)) {
  if (!line || line.trimStart().startsWith('#')) continue;
  const [key, ...parts] = line.split('=');
  const value = parts.join('=').trim();
  if (/(KEY|SECRET|TOKEN|PASSWORD)/i.test(key)) assert.equal(value, '', `${key} must be empty in .env.example`);
}

const ignored = new Set(['node_modules', 'dist', '.git']);
function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    if (entry.name === '.env' || (entry.name.startsWith('.env.') && entry.name !== '.env.example')) return [];
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(target) : [target];
  });
}
const secretPatterns = [
  /sk_live_[0-9A-Za-z]{16,}/,
  /rk_live_[0-9A-Za-z]{16,}/,
  /sb_secret_[0-9A-Za-z._-]{16,}/,
  /pat[A-Za-z0-9._-]{32,}/,
];
for (const file of sourceFiles('.')) {
  if (!/\.(?:js|mjs|jsx|json|md|yaml|yml|html|txt|env|example)$/.test(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of secretPatterns) assert.ok(!pattern.test(content), `possible credential in ${file}`);
}

const initialHtml = fs.readFileSync('index.html', 'utf8');
for (const tracker of ['googletagmanager.com/gtag', 'clarity.ms/tag', 'pagead2.googlesyndication.com/pagead']) {
  assert.ok(!initialHtml.includes(tracker), `initial HTML must not preload ${tracker}`);
}
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
for (const route of ['/v1/health/live', '/v1/health/ready']) assert.ok(vercel.rewrites.some((item) => item.source === route), `missing ${route}`);
assert.ok(pkg.scripts?.check, 'package must expose a check command');
console.log(JSON.stringify({ event: 'release.check.completed', version: pkg.version, status: 'candidate', artifacts: requiredFiles.length }));
