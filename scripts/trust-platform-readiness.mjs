import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_TIMEOUT_MS = 8_000;
const SELLER_LINE = 'google.com, pub-8295677733502537, DIRECT, f08c47fec0942fa0';
const READY_TCF_EVENTS = new Set(['tcloaded', 'useractioncomplete']);

function normalizeBaseUrl(value) {
  const url = new URL(String(value || ''));
  const local = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) {
    throw new Error('Trust Platform targets must use HTTPS; HTTP is allowed only locally.');
  }
  url.pathname = url.pathname.replace(/\/+$/, '');
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/+$/, '');
}

async function requestText(fetchImpl, url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      headers: { Accept: 'text/html, text/plain, application/javascript' },
      cache: 'no-store',
      signal: controller.signal,
    });
    return {
      status: response.status,
      text: await response.text(),
      headers: response.headers,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function result(name, errors, detail = {}) {
  return { name, ok: errors.length === 0, errors, ...detail };
}

function parseHealthResponse(response, endpoint) {
  const errors = [];
  let body = null;
  try {
    body = JSON.parse(response.text);
  } catch {
    errors.push(`${endpoint} response is not valid JSON`);
  }
  if (response.status !== 200) errors.push(`${endpoint} returned HTTP ${response.status}`);
  if (!response.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    errors.push(`${endpoint} Content-Type is not application/json`);
  }
  if (!response.headers.get('cache-control')?.toLowerCase().includes('no-store')) {
    errors.push(`${endpoint} Cache-Control must include no-store`);
  }
  const envelopeTraceId = body?.meta?.traceId || '';
  const headerTraceId = response.headers.get('x-trace-id') || '';
  if (!envelopeTraceId) errors.push(`${endpoint} response is missing meta.traceId`);
  if (headerTraceId && headerTraceId !== envelopeTraceId) {
    errors.push(`${endpoint} X-Trace-Id does not match meta.traceId`);
  }
  return { body, errors };
}

async function evaluatePlatformHealth(fetchImpl, target, timeoutMs) {
  const errors = [];
  const liveResponse = await requestText(fetchImpl, `${target}/v1/health/live`, timeoutMs);
  const live = parseHealthResponse(liveResponse, 'liveness');
  errors.push(...live.errors);
  if (live.body?.data?.service !== 'aqua-ai-tools-site') errors.push('liveness has an unexpected service identity');
  if (live.body?.data?.status !== 'ok') errors.push('liveness status is not ok');
  const observedRelease = String(live.body?.data?.release || '');
  if (!observedRelease || observedRelease === 'development') {
    errors.push('liveness release identity is missing or development');
  }

  const readyResponse = await requestText(fetchImpl, `${target}/v1/health/ready`, timeoutMs);
  const ready = parseHealthResponse(readyResponse, 'readiness');
  errors.push(...ready.errors);
  if (ready.body?.data?.status !== 'ready') errors.push('readiness status is not ready');
  const dependencies = Array.isArray(ready.body?.data?.checks) ? ready.body.data.checks : [];
  if (!dependencies.length) errors.push('readiness dependency checks are missing');
  for (const dependency of dependencies) {
    if (dependency?.status !== 'ok') {
      errors.push(`${dependency?.name || 'unknown dependency'} is ${dependency?.status || 'unknown'}`);
    }
  }

  return { errors, observedRelease };
}

function browserErrors(browserEvidence) {
  if (!browserEvidence || typeof browserEvidence !== 'object') {
    return ['redacted browser evidence is missing'];
  }
  const errors = [];
  if (browserEvidence.tcfApiType !== 'function') errors.push('__tcfapi is not available');
  if (browserEvidence.cmpStatus !== 'loaded') errors.push('CMP status is not loaded');
  if (browserEvidence.tcStringStatus !== 'present') errors.push('TCF proof is not present');
  if (!READY_TCF_EVENTS.has(browserEvidence.eventStatus)) errors.push('TCF event is not ready');
  if (browserEvidence.adScriptsBeforeChoice !== 0) errors.push('advertising loaded before a choice');
  if (browserEvidence.analyticsScriptsBeforeChoice !== 0) errors.push('analytics loaded before a choice');
  if (Object.hasOwn(browserEvidence, 'tcString')) errors.push('browser evidence must not contain the TCF string');
  return errors;
}

export async function evaluateTrustPlatformReadiness({
  baseUrl,
  browserEvidence,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  fetchImpl = fetch,
} = {}) {
  const target = normalizeBaseUrl(baseUrl);
  const evidence = {
    schemaVersion: 1,
    target,
    checkedAt: new Date().toISOString(),
    ok: false,
    checks: [],
  };

  try {
    const home = await requestText(fetchImpl, `${target}/`, timeoutMs);
    const homeErrors = [];
    if (home.status !== 200) homeErrors.push(`homepage returned HTTP ${home.status}`);
    const hsts = home.headers.get('strict-transport-security') || '';
    const maxAge = Number(/max-age=(\d+)/i.exec(hsts)?.[1] || 0);
    if (maxAge < 31_536_000) homeErrors.push('HSTS max-age is below one year');
    const csp = home.headers.get('content-security-policy') || '';
    for (const directive of [
      "frame-ancestors 'none'",
      'googletagmanager.com',
      'clarity.ms',
      'googlesyndication.com',
    ]) {
      if (!csp.includes(directive)) homeErrors.push(`CSP is missing ${directive}`);
    }
    const bundlePath = /<script[^>]+src=["']([^"']*\/assets\/index-[^"']+\.js)["']/i.exec(home.text)?.[1] || '';
    if (!bundlePath) homeErrors.push('production JavaScript bundle was not found');
    evidence.checks.push(result('https-and-security-headers', homeErrors, {
      status: home.status,
      hsts,
      bundlePath,
    }));

    if (bundlePath) {
      const bundleUrl = new URL(bundlePath, `${target}/`).toString();
      const bundle = await requestText(fetchImpl, bundleUrl, timeoutMs);
      const bundleErrors = [];
      if (bundle.status !== 200) bundleErrors.push(`bundle returned HTTP ${bundle.status}`);
      for (const marker of [
        'aqua-advertising-authorization-v1',
        'policy.default-deny',
        'cmp.not-configured',
        'request-ad',
      ]) {
        if (!bundle.text.includes(marker)) bundleErrors.push(`bundle is missing Trust Platform marker: ${marker}`);
      }
      evidence.checks.push(result('deployed-trust-platform-bundle', bundleErrors, {
        status: bundle.status,
        bundlePath,
      }));
    }

    const ads = await requestText(fetchImpl, `${target}/ads.txt`, timeoutMs);
    const adsErrors = [];
    if (ads.status !== 200) adsErrors.push(`ads.txt returned HTTP ${ads.status}`);
    if (!ads.text.split(/\r?\n/).map((line) => line.trim()).includes(SELLER_LINE)) {
      adsErrors.push('authorized Google seller line is missing');
    }
    evidence.checks.push(result('ads.txt', adsErrors, {
      status: ads.status,
      seller: 'google.com/pub-8295677733502537',
    }));

    const platformHealth = await evaluatePlatformHealth(fetchImpl, target, timeoutMs);
    evidence.checks.push(result('platform-readiness', platformHealth.errors, {
      observedRelease: platformHealth.observedRelease,
    }));

    evidence.checks.push(result('cmp-and-tcf-browser-evidence', browserErrors(browserEvidence), {
      evidence: browserEvidence || null,
    }));
  } catch (error) {
    evidence.checks.push(result('request', [
      error?.name === 'AbortError'
        ? `request timed out after ${timeoutMs}ms`
        : String(error?.message || error),
    ]));
  }

  evidence.ok = evidence.checks.length === 5 && evidence.checks.every((check) => check.ok);
  return evidence;
}

function parseArguments(argv) {
  const options = {
    baseUrl: '',
    browserEvidencePath: '',
    evidencePath: '',
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === '--base-url' && value) {
      options.baseUrl = value;
      index += 1;
    } else if (argument === '--browser-evidence' && value) {
      options.browserEvidencePath = value;
      index += 1;
    } else if (argument === '--evidence' && value) {
      options.evidencePath = value;
      index += 1;
    } else if (argument === '--timeout-ms' && value) {
      options.timeoutMs = Number(value);
      index += 1;
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }
  return options;
}

async function writeEvidence(filename, evidence) {
  if (!filename) return;
  const resolved = path.resolve(filename);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.writeFile(resolved, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (!options.baseUrl || !options.browserEvidencePath) {
    throw new Error('Both --base-url and --browser-evidence are required.');
  }
  const browserEvidence = JSON.parse(await fs.readFile(path.resolve(options.browserEvidencePath), 'utf8'));
  const evidence = await evaluateTrustPlatformReadiness({
    baseUrl: options.baseUrl,
    browserEvidence,
    timeoutMs: options.timeoutMs,
  });
  await writeEvidence(options.evidencePath, evidence);
  console.log(JSON.stringify(evidence, null, 2));
  if (!evidence.ok) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 2;
  });
}
