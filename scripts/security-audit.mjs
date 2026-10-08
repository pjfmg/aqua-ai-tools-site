import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SEVERITY = new Map([
  ['info', 0],
  ['low', 1],
  ['moderate', 2],
  ['high', 3],
  ['critical', 4],
]);

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(target) : [target];
  });
}

export function exceptionConditionErrors(exception, sources = []) {
  const errors = [];
  if (exception?.conditions?.applicationMode !== 'browser-spa') {
    errors.push(`advisory ${exception?.advisorySource} is not restricted to browser-spa`);
  }
  for (const pattern of exception?.conditions?.forbiddenSourcePatterns || []) {
    if (sources.some(({ content }) => content.includes(pattern))) {
      errors.push(`advisory ${exception.advisorySource} cannot be excepted while source contains ${pattern}`);
    }
  }
  return errors;
}

export function evaluateAuditReport(report, policy, {
  now = new Date(),
  sources = [],
} = {}) {
  const errors = [];
  const accepted = [];
  const threshold = SEVERITY.get(policy?.threshold);
  if (policy?.schemaVersion !== 1 || threshold === undefined) {
    return { ok: false, errors: ['invalid security audit policy'], accepted };
  }

  const exceptions = new Map();
  for (const exception of policy.exceptions || []) {
    const source = String(exception?.advisorySource || '');
    if (!source || exceptions.has(source)) {
      errors.push(`duplicate or missing advisory source: ${source || 'unknown'}`);
      continue;
    }
    if (!Number.isFinite(Date.parse(exception.expiresAt)) || new Date(exception.expiresAt) < now) {
      errors.push(`security exception ${source} expired at ${exception.expiresAt || 'unknown'}`);
    }
    errors.push(...exceptionConditionErrors(exception, sources));
    exceptions.set(source, exception);
  }

  const vulnerabilities = report?.vulnerabilities || {};
  const memo = new Map();
  function vulnerabilityAllowed(name, stack = new Set()) {
    if (memo.has(name)) return memo.get(name);
    if (stack.has(name)) return false;
    const vulnerability = vulnerabilities[name];
    if (!vulnerability) return false;
    if ((SEVERITY.get(vulnerability.severity) ?? 99) < threshold) return true;
    const nextStack = new Set(stack).add(name);
    const via = Array.isArray(vulnerability.via) ? vulnerability.via : [];
    const allowed = via.length > 0 && via.every((item) => {
      if (typeof item === 'string') return vulnerabilityAllowed(item, nextStack);
      const exception = exceptions.get(String(item?.source || ''));
      if (!exception || !exception.packages?.includes(name)) return false;
      const maximum = SEVERITY.get(exception.maximumSeverity);
      const actual = SEVERITY.get(item?.severity || vulnerability.severity);
      return maximum !== undefined && actual !== undefined && actual <= maximum;
    });
    memo.set(name, allowed);
    return allowed;
  }

  for (const [name, vulnerability] of Object.entries(vulnerabilities)) {
    if ((SEVERITY.get(vulnerability?.severity) ?? 99) < threshold) continue;
    if (vulnerabilityAllowed(name)) accepted.push(name);
    else errors.push(`unapproved ${vulnerability?.severity || 'unknown'} vulnerability: ${name}`);
  }
  return { ok: errors.length === 0, errors, accepted: [...new Set(accepted)].sort() };
}

function readSources(directory) {
  if (!fs.existsSync(directory)) return [];
  return sourceFiles(directory)
    .filter((filename) => /\.(?:js|jsx|mjs|ts|tsx)$/.test(filename))
    .map((filename) => ({ filename, content: fs.readFileSync(filename, 'utf8') }));
}

function main() {
  const policy = JSON.parse(fs.readFileSync('security/audit-exceptions.json', 'utf8'));
  const audit = spawnSync('npm', ['audit', '--json'], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  let report;
  try {
    report = JSON.parse(audit.stdout || '{}');
  } catch {
    console.error('npm audit did not return valid JSON');
    process.exitCode = 2;
    return;
  }
  const result = evaluateAuditReport(report, policy, {
    sources: readSources('src'),
  });
  console.log(JSON.stringify({
    event: 'security.audit.completed',
    ok: result.ok,
    acceptedExceptions: result.accepted,
    vulnerabilityCounts: report?.metadata?.vulnerabilities || null,
    errors: result.errors,
  }));
  if (!result.ok) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) main();
