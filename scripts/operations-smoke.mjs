import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fetchAquaOs, resetAquaOsCircuitsForTests } from '../aquaOsRuntime.mjs';
import { healthSnapshot } from '../operations.mjs';

const request = { headers: { 'x-trace-id': 'trace-operations-test' } };
const live = await healthSnapshot(request, 'live', {});
assert.equal(live.status, 200);
assert.equal(live.traceId, 'trace-operations-test');
const gitRelease = await healthSnapshot(request, 'live', {
  AQUA_RELEASE: 'stale-release',
  VERCEL_GIT_COMMIT_SHA: 'current-git-release',
});
assert.equal(gitRelease.data.release, 'current-git-release');

const readyEnv = {
  AQUA_OS_DATA_URL: 'https://data.aqua.test', AQUA_OS_COMMERCE_URL: 'https://commerce.aqua.test', AQUA_OS_PRODUCT_KEY: 'product',
  SUPABASE_URL: 'https://auth.aqua.test', SUPABASE_ANON_KEY: 'anon', AQUA_RELEASE: 'test-release',
};
const probed = [];
const ready = await healthSnapshot(request, 'ready', readyEnv, async (url) => { probed.push(String(url)); return new Response('{}', { status: 200 }); });
assert.equal(ready.status, 200);
assert.deepEqual(probed.sort(), ['https://commerce.aqua.test/v1/health/ready', 'https://data.aqua.test/v1/health/ready']);
assert.equal((await healthSnapshot(request, 'ready', {}, async () => new Response('{}'))).status, 503);

resetAquaOsCircuitsForTests();
let getAttempts = 0;
const retried = await fetchAquaOs('https://data.aqua.test/v1/catalog/tools', {}, { fetchImpl: async () => {
  getAttempts += 1; return new Response('{}', { status: getAttempts === 1 ? 503 : 200 });
} });
assert.equal(retried.status, 200);
assert.equal(getAttempts, 2, 'idempotent GET should retry once');

let postAttempts = 0;
await fetchAquaOs('https://data.aqua.test/v1/catalog/submissions', { method: 'POST' }, { fetchImpl: async () => {
  postAttempts += 1; return new Response('{}', { status: 503 });
} });
assert.equal(postAttempts, 1, 'non-idempotent POST must not retry');

const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
assert.ok(vercel.rewrites.some((item) => item.source === '/v1/health/live'));
assert.ok(vercel.rewrites.some((item) => item.source === '/v1/health/ready'));
assert.ok(fs.readFileSync('api/v1/gateway.mjs', 'utf8').includes('Server-Timing'));
console.log('Operations smoke tests passed');
