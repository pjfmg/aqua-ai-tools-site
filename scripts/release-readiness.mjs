import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_TIMEOUT_MS = 5_000;

function parseArguments(argv) {
  const options = {
    baseUrl: String(process.env.AQUA_RELEASE_BASE_URL || '').trim(),
    expectedRelease: String(process.env.EXPECTED_AQUA_RELEASE || '').trim(),
    evidencePath: '',
    timeoutMs: DEFAULT_TIMEOUT_MS,
    checkCatalog: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === '--base-url' && value) {
      options.baseUrl = value;
      index += 1;
    } else if (argument === '--expected-release' && value) {
      options.expectedRelease = value;
      index += 1;
    } else if (argument === '--evidence' && value) {
      options.evidencePath = value;
      index += 1;
    } else if (argument === '--timeout-ms' && value) {
      options.timeoutMs = Number(value);
      index += 1;
    } else if (argument === '--skip-catalog') {
      options.checkCatalog = false;
    } else if (argument === '--help') {
      options.help = true;
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }
  return options;
}

function normalizeBaseUrl(value) {
  const url = new URL(String(value || ''));
  const local = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) {
    throw new Error('Release targets must use HTTPS; HTTP is allowed only for local validation.');
  }
  url.pathname = url.pathname.replace(/\/+$/, '');
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/+$/, '');
}

function releaseMatches(observed, expected) {
  if (!expected) return true;
  return observed === expected || observed.startsWith(expected) || expected.startsWith(observed);
}

async function requestJson(fetchImpl, url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    const text = await response.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
    return {
      status: response.status,
      body,
      headers: {
        cacheControl: response.headers.get('cache-control') || '',
        contentType: response.headers.get('content-type') || '',
        traceId: response.headers.get('x-trace-id') || '',
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

function envelopeErrors(result, { requireNoStore = true } = {}) {
  if (!result.body || typeof result.body !== 'object') return ['response is not valid JSON'];
  if (!result.body.meta?.traceId) return ['response envelope is missing meta.traceId'];
  if (result.headers.traceId && result.headers.traceId !== result.body.meta.traceId) {
    return ['X-Trace-Id does not match meta.traceId'];
  }
  if (requireNoStore && !result.headers.cacheControl.toLowerCase().includes('no-store')) {
    return ['Cache-Control must include no-store'];
  }
  if (!result.headers.contentType.toLowerCase().includes('application/json')) {
    return ['Content-Type must be application/json'];
  }
  return [];
}

function check(name, result, errors, detail = {}) {
  return {
    name,
    ok: errors.length === 0,
    status: result?.status ?? 0,
    traceId: result?.body?.meta?.traceId || result?.headers?.traceId || '',
    errors,
    ...detail,
  };
}

export async function evaluateReleaseReadiness({
  baseUrl,
  expectedRelease = '',
  timeoutMs = DEFAULT_TIMEOUT_MS,
  checkCatalog = true,
  fetchImpl = fetch,
} = {}) {
  const target = normalizeBaseUrl(baseUrl);
  if (!Number.isFinite(timeoutMs) || timeoutMs < 250 || timeoutMs > 30_000) {
    throw new Error('timeoutMs must be between 250 and 30000.');
  }

  const evidence = {
    schemaVersion: 1,
    target,
    checkedAt: new Date().toISOString(),
    expectedRelease,
    observedRelease: '',
    ok: false,
    checks: [],
  };

  try {
    const live = await requestJson(fetchImpl, `${target}/v1/health/live`, timeoutMs);
    const liveErrors = envelopeErrors(live);
    if (live.status !== 200) liveErrors.push(`expected HTTP 200, received ${live.status}`);
    if (live.body?.data?.service !== 'aqua-ai-tools-site') liveErrors.push('unexpected service identity');
    if (live.body?.data?.status !== 'ok') liveErrors.push('liveness status is not ok');
    const observedRelease = String(live.body?.data?.release || '');
    evidence.observedRelease = observedRelease;
    if (!observedRelease || observedRelease === 'development') liveErrors.push('release identity is missing or development');
    if (!releaseMatches(observedRelease, expectedRelease)) {
      liveErrors.push(`release mismatch: expected ${expectedRelease}, observed ${observedRelease}`);
    }
    evidence.checks.push(check('liveness', live, liveErrors, { release: observedRelease }));

    const ready = await requestJson(fetchImpl, `${target}/v1/health/ready`, timeoutMs);
    const readyErrors = envelopeErrors(ready);
    if (ready.status !== 200) readyErrors.push(`expected HTTP 200, received ${ready.status}`);
    if (ready.body?.data?.status !== 'ready') readyErrors.push('readiness status is not ready');
    const dependencyChecks = Array.isArray(ready.body?.data?.checks) ? ready.body.data.checks : [];
    if (!dependencyChecks.length) readyErrors.push('readiness dependency checks are missing');
    for (const dependency of dependencyChecks) {
      if (dependency?.status !== 'ok') readyErrors.push(`${dependency?.name || 'unknown dependency'} is ${dependency?.status || 'unknown'}`);
    }
    evidence.checks.push(check('readiness', ready, readyErrors, { dependencies: dependencyChecks }));

    if (checkCatalog) {
      const catalog = await requestJson(fetchImpl, `${target}/v1/tools?pageSize=1`, timeoutMs);
      const catalogErrors = envelopeErrors(catalog, { requireNoStore: false });
      if (catalog.status !== 200) catalogErrors.push(`expected HTTP 200, received ${catalog.status}`);
      const records = catalog.body?.data?.records;
      if (!Array.isArray(records) || records.length < 1) catalogErrors.push('catalog did not return at least one published record');
      evidence.checks.push(check('catalog', catalog, catalogErrors, {
        recordCount: Array.isArray(records) ? records.length : 0,
      }));
    }
  } catch (error) {
    evidence.checks.push({
      name: 'request',
      ok: false,
      status: 0,
      traceId: '',
      errors: [error?.name === 'AbortError' ? `request timed out after ${timeoutMs}ms` : String(error?.message || error)],
    });
  }

  evidence.ok = evidence.checks.length >= (checkCatalog ? 3 : 2) && evidence.checks.every((item) => item.ok);
  return evidence;
}

async function writeEvidence(file, evidence) {
  if (!file) return;
  const resolved = path.resolve(file);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.writeFile(resolved, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
}

function usage() {
  return [
    'Usage: node scripts/release-readiness.mjs --base-url <url> [options]',
    '',
    'Options:',
    '  --expected-release <id>  Require the deployed release/commit identifier.',
    '  --evidence <file>         Save a redacted JSON evidence record.',
    '  --timeout-ms <number>     Per-request timeout (250–30000, default 5000).',
    '  --skip-catalog            Skip the public catalog probe.',
  ].join('\n');
}

async function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    console.error(usage());
    process.exitCode = 2;
    return;
  }
  if (options.help) {
    console.log(usage());
    return;
  }
  if (!options.baseUrl) {
    console.error('A release base URL is required.');
    console.error(usage());
    process.exitCode = 2;
    return;
  }

  let evidence;
  try {
    evidence = await evaluateReleaseReadiness(options);
  } catch (error) {
    evidence = {
      schemaVersion: 1,
      target: String(options.baseUrl),
      checkedAt: new Date().toISOString(),
      expectedRelease: options.expectedRelease,
      observedRelease: '',
      ok: false,
      checks: [{ name: 'configuration', ok: false, status: 0, traceId: '', errors: [String(error.message || error)] }],
    };
  }
  await writeEvidence(options.evidencePath, evidence);
  console.log(JSON.stringify(evidence, null, 2));
  if (!evidence.ok) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) await main();
