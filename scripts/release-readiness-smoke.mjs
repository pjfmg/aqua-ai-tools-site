import assert from 'node:assert/strict';
import { evaluateReleaseReadiness } from './release-readiness.mjs';

function jsonResponse(body, status = 200) {
  const traceId = body?.meta?.traceId || 'trace-release-test';
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Trace-Id': traceId,
    },
  });
}

const healthyFetch = async (url) => {
  if (String(url).endsWith('/v1/health/live')) {
    return jsonResponse({
      data: { service: 'aqua-ai-tools-site', release: 'abc1234', status: 'ok' },
      meta: { traceId: 'trace-live-test' },
      errors: [],
    });
  }
  if (String(url).endsWith('/v1/health/ready')) {
    return jsonResponse({
      data: {
        service: 'aqua-ai-tools-site',
        release: 'abc1234',
        status: 'ready',
        checks: [
          { name: 'configuration', status: 'ok' },
          { name: 'data-platform', status: 'ok', latencyMs: 10 },
          { name: 'commerce', status: 'ok', latencyMs: 12 },
        ],
      },
      meta: { traceId: 'trace-ready-test' },
      errors: [],
    });
  }
  return jsonResponse({
    data: { records: [{ id: 'tool-1' }], nextCursor: null },
    meta: { traceId: 'trace-catalog-test' },
    errors: [],
  });
};

const healthy = await evaluateReleaseReadiness({
  baseUrl: 'https://tools.example.test',
  expectedRelease: 'abc1234',
  fetchImpl: healthyFetch,
});
assert.equal(healthy.ok, true);
assert.equal(healthy.checks.length, 3);
assert.ok(healthy.checks.every((item) => item.ok));

const notReady = await evaluateReleaseReadiness({
  baseUrl: 'https://tools.example.test',
  expectedRelease: 'abc1234',
  checkCatalog: false,
  fetchImpl: async (url) => {
    if (String(url).endsWith('/live')) return healthyFetch(url);
    return jsonResponse({
      data: {
        service: 'aqua-ai-tools-site',
        release: 'abc1234',
        status: 'not_ready',
        checks: [
          { name: 'configuration', status: 'fail' },
          { name: 'commerce', status: 'fail', latencyMs: 0 },
        ],
      },
      meta: { traceId: 'trace-not-ready-test' },
      errors: [{ code: 'SERVICE_NOT_READY' }],
    }, 503);
  },
});
assert.equal(notReady.ok, false);
assert.ok(notReady.checks.find((item) => item.name === 'readiness').errors.includes('commerce is fail'));

await assert.rejects(
  () => evaluateReleaseReadiness({ baseUrl: 'http://public.example.test', fetchImpl: healthyFetch }),
  /must use HTTPS/,
);

console.log('Release readiness smoke tests passed');
