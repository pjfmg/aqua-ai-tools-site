import assert from 'node:assert/strict';
import { evaluateTrustPlatformReadiness } from './trust-platform-readiness.mjs';

const bundle = [
  'aqua-advertising-authorization-v1',
  'policy.default-deny',
  'cmp.not-configured',
  'request-ad',
].join(';');

function response(body, {
  status = 200,
  contentType = 'text/plain',
  headers = {},
} = {}) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': contentType,
      ...headers,
    },
  });
}

const healthyFetch = async (url) => {
  const value = String(url);
  if (value.endsWith('/')) {
    return response('<script type="module" src="/assets/index-trust.js"></script>', {
      contentType: 'text/html',
      headers: {
        'Strict-Transport-Security': 'max-age=63072000',
        'Content-Security-Policy': "frame-ancestors 'none'; script-src googletagmanager.com clarity.ms googlesyndication.com",
      },
    });
  }
  if (value.endsWith('/assets/index-trust.js')) return response(bundle, { contentType: 'application/javascript' });
  if (value.endsWith('/ads.txt')) return response('google.com, pub-8295677733502537, DIRECT, f08c47fec0942fa0\n');
  if (value.endsWith('/v1/health/live')) {
    return response(JSON.stringify({
      data: { service: 'aqua-ai-tools-site', release: 'trust-test', status: 'ok' },
      meta: { traceId: 'trace-live-trust' },
      errors: [],
    }), {
      contentType: 'application/json',
      headers: { 'Cache-Control': 'no-store', 'X-Trace-Id': 'trace-live-trust' },
    });
  }
  if (value.endsWith('/v1/health/ready')) {
    return response(JSON.stringify({
      data: {
        service: 'aqua-ai-tools-site',
        release: 'trust-test',
        status: 'ready',
        checks: [{ name: 'configuration', status: 'ok' }],
      },
      meta: { traceId: 'trace-ready-trust' },
      errors: [],
    }), {
      contentType: 'application/json',
      headers: { 'Cache-Control': 'no-store', 'X-Trace-Id': 'trace-ready-trust' },
    });
  }
  return response('not found', { status: 404 });
};

const browserEvidence = {
  tcfApiType: 'function',
  cmpStatus: 'loaded',
  tcStringStatus: 'present',
  eventStatus: 'useractioncomplete',
  adScriptsBeforeChoice: 0,
  analyticsScriptsBeforeChoice: 0,
};

const ready = await evaluateTrustPlatformReadiness({
  baseUrl: 'https://tools.example.test',
  browserEvidence,
  fetchImpl: healthyFetch,
});
assert.equal(ready.ok, true);
assert.equal(ready.checks.length, 5);

const missingCmp = await evaluateTrustPlatformReadiness({
  baseUrl: 'https://tools.example.test',
  browserEvidence: {
    ...browserEvidence,
    tcfApiType: 'undefined',
    cmpStatus: 'not-observed',
    tcStringStatus: 'not-observed',
    eventStatus: 'not-observed',
  },
  fetchImpl: healthyFetch,
});
assert.equal(missingCmp.ok, false);
assert.ok(missingCmp.checks.find((check) => check.name === 'cmp-and-tcf-browser-evidence').errors.includes('__tcfapi is not available'));

const leakingEvidence = await evaluateTrustPlatformReadiness({
  baseUrl: 'https://tools.example.test',
  browserEvidence: { ...browserEvidence, tcString: 'must-not-be-recorded' },
  fetchImpl: healthyFetch,
});
assert.equal(leakingEvidence.ok, false);
assert.ok(leakingEvidence.checks.find((check) => check.name === 'cmp-and-tcf-browser-evidence').errors.includes('browser evidence must not contain the TCF string'));

console.log('Trust Platform readiness smoke tests passed');
