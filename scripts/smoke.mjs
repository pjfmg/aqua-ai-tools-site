import assert from 'node:assert/strict';
import fs from 'node:fs';
import vercelBillingPortalHandler from '../api/billing/portal.mjs';
import vercelBillingCheckoutHandler from '../api/billing/checkout.mjs';
import { onRequest as cloudflareBillingPortalHandler } from '../functions/billing/portal.js';
import { authenticateRequest } from '../authSession.mjs';
import { apiEnvelope, enforceApiGovernance } from '../apiGovernance.mjs';
import vercelV1Gateway from '../api/v1/gateway.mjs';

function assertContains(value, expected, label) {
  assert.ok(String(value).includes(expected), `${label} should include ${expected}`);
}

const indexHtml = fs.readFileSync('index.html', 'utf8');
assertContains(indexHtml, 'google-adsense-account', 'index.html');
assertContains(indexHtml, 'ca-pub-8295677733502537', 'index.html');

const adsTxt = fs.readFileSync('public/ads.txt', 'utf8');
assertContains(adsTxt, 'google.com, pub-8295677733502537, DIRECT', 'ads.txt');

const authEnv = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'public-anon-key',
};
let authFetchCalls = 0;
const missingAuth = await authenticateRequest({ headers: {} }, authEnv, async () => {
  authFetchCalls += 1;
  return new Response();
});
assert.equal(missingAuth.status, 401);
assert.equal(missingAuth.error, 'AUTH_REQUIRED');
assert.equal(authFetchCalls, 0, 'missing bearer token must be rejected before calling Supabase');

const validAuth = await authenticateRequest(
  { headers: { authorization: 'Bearer signed-session-token' } },
  authEnv,
  async (url, options) => {
    authFetchCalls += 1;
    assert.equal(url, 'https://example.supabase.co/auth/v1/user');
    assert.equal(options.headers.apikey, 'public-anon-key');
    assert.equal(options.headers.Authorization, 'Bearer signed-session-token');
    return new Response(JSON.stringify({ id: 'user-123', email: 'Person@Example.com' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
);
assert.deepEqual(validAuth, { ok: true, user: { id: 'user-123', email: 'person@example.com' } });

const invalidAuth = await authenticateRequest(
  { headers: new Headers({ Authorization: 'Bearer invalid-token' }) },
  authEnv,
  async () => new Response(JSON.stringify({ message: 'invalid JWT' }), { status: 401 }),
);
assert.equal(invalidAuth.status, 401);
assert.equal(invalidAuth.error, 'AUTH_INVALID');

const successEnvelope = apiEnvelope(200, { ok: true }, 'trace-test');
assert.deepEqual(successEnvelope, { data: { ok: true }, meta: { traceId: 'trace-test' }, errors: [] });
const errorEnvelope = apiEnvelope(401, { error: 'AUTH_REQUIRED' }, 'trace-test');
assert.equal(errorEnvelope.data, null);
assert.equal(errorEnvelope.errors[0].code, 'AUTH_REQUIRED');

let lastRate;
for (let i = 0; i < 6; i += 1) {
  lastRate = await enforceApiGovernance(
    { method: 'POST', url: 'https://example.com/v1/billing/portal-sessions', headers: { authorization: 'Bearer rate-limit-test-token' } },
    'billing-portal',
    {},
  );
}
assert.equal(lastRate.allowed, false, 'sixth portal request must be rate limited');
assert.equal(lastRate.headers['RateLimit-Limit'], '5');
assert.ok(lastRate.traceId, 'governed requests must have a trace id');

const previousDirectoryEnv = {
  AQUA_OS_DATA_URL: process.env.AQUA_OS_DATA_URL,
  AQUA_OS_PRODUCT_KEY: process.env.AQUA_OS_PRODUCT_KEY,
};
process.env.AQUA_OS_DATA_URL = 'https://data.aqua.test';
process.env.AQUA_OS_PRODUCT_KEY = 'product-key-test';
const fetchBeforeGatewayTest = globalThis.fetch;
globalThis.fetch = async (url, options = {}) => {
  assertContains(url, 'https://data.aqua.test/v1/catalog/tools', 'v1 tools upstream');
  assert.equal(options.headers['X-AQUA-Product-Key'], 'product-key-test');
  return new Response(JSON.stringify({ data: { tools: [{ id: 'tool-1', legacyKey: 'rec-1', name: 'AQUA', status: 'published' }], nextCursor: null }, meta: { traceId: 'data-trace' }, errors: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
try {
  let gatewayBody = '';
  const gatewayHeaders = new Map();
  const gatewayResponse = {
    statusCode: 0,
    setHeader(name, value) { gatewayHeaders.set(String(name).toLowerCase(), value); },
    end(value = '') { gatewayBody = Buffer.isBuffer(value) ? value.toString('utf8') : String(value); },
  };
  await vercelV1Gateway(
    { method: 'GET', url: '/v1/tools?pageSize=1', query: { operation: 'tools', pageSize: '1' }, headers: { host: 'tools.example.com', 'x-forwarded-for': '192.0.2.44' } },
    gatewayResponse,
  );
  const gatewayEnvelope = JSON.parse(gatewayBody);
  assert.equal(gatewayResponse.statusCode, 200, gatewayBody);
  assert.equal(gatewayEnvelope.data.records[0].id, 'tool-1');
  assert.equal(gatewayEnvelope.data.records[0].fields.ID_Unico, 'rec-1');
  assert.equal(gatewayEnvelope.errors.length, 0);
  assert.equal(gatewayHeaders.get('x-trace-id'), gatewayEnvelope.meta.traceId);
  assert.equal(gatewayHeaders.get('ratelimit-limit'), '120');
} finally {
  globalThis.fetch = fetchBeforeGatewayTest;
  for (const [name, value] of Object.entries(previousDirectoryEnv)) {
    if (typeof value === 'undefined') delete process.env[name]; else process.env[name] = value;
  }
}

for (const file of ['api/airtable.mjs', 'api/submit.mjs', 'api/rate.mjs', 'api/ratings.mjs', 'functions/airtable.js', 'functions/submit.js', 'functions/rate.js', 'functions/ratings.js']) {
  assertContains(fs.readFileSync(file, 'utf8'), 'AquaOsData', `${file} AQUA Data Platform integration`);
}
for (const file of ['api/airtable.mjs', 'api/submit.mjs', 'api/rate.mjs', 'api/ratings.mjs', 'functions/airtable.js', 'functions/submit.js', 'functions/rate.js', 'functions/ratings.js', 'proxy/server.mjs']) {
  assert.ok(!fs.readFileSync(file, 'utf8').includes('api.airtable.com'), `${file} must not access Airtable at runtime`);
}

for (const file of [
  'api/billing/checkout.mjs',
  'api/billing/session-status.mjs',
  'api/billing/subscription.mjs',
  'functions/billing/checkout.js',
  'functions/billing/session-status.js',
  'functions/billing/subscription.js',
]) {
  assertContains(fs.readFileSync(file, 'utf8'), 'callAquaOsCommerce', `${file} AQUA OS integration`);
}
for (const file of ['api/rate.mjs', 'functions/rate.js']) {
  const source = fs.readFileSync(file, 'utf8');
  assertContains(source, 'authenticateRequest', `${file} identity guard`);
  assertContains(source, "features?.includes('personal_ratings')", `${file} Pro entitlement guard`);
}

const billingClientSource = fs.readFileSync('src/lib/billing.js', 'utf8');
assertContains(billingClientSource, '/v1/', 'billing client versioned API');
assert.ok(!billingClientSource.includes("searchParams.set('email'"), 'billing client must not send identity in the query');
assert.ok(!billingClientSource.includes('JSON.stringify({ email'), 'billing client must not send identity in the body');
const ratingsClientSource = fs.readFileSync('src/lib/ratings.js', 'utf8');
assertContains(ratingsClientSource, '/v1/tool-ratings', 'ratings client versioned API');
assert.ok(!ratingsClientSource.includes('userEmail:'), 'ratings client must not declare user identity');
const newsletterClientSource = fs.readFileSync('src/lib/newsletter.js', 'utf8');
assertContains(newsletterClientSource, '/v1/newsletter-subscriptions', 'newsletter client versioned API');
assertContains(fs.readFileSync('newsletterHandler.mjs', 'utf8'), '/v1/marketing/newsletter-subscriptions', 'newsletter Data Platform integration');
assertContains(fs.readFileSync('functions/newsletter.js', 'utf8'), '/v1/marketing/newsletter-subscriptions', 'Cloudflare newsletter Data Platform integration');
assertContains(fs.readFileSync('proxy/server.mjs', 'utf8'), '/v1/newsletter-subscriptions', 'local newsletter route');

const previousCommerceEnv = {
  AQUA_OS_COMMERCE_URL: process.env.AQUA_OS_COMMERCE_URL,
  AQUA_OS_PRODUCT_KEY: process.env.AQUA_OS_PRODUCT_KEY,
};
process.env.AQUA_OS_COMMERCE_URL = 'https://commerce.aqua.test';
process.env.AQUA_OS_PRODUCT_KEY = 'product-key-test';

let commerceRequest;
const fetchBeforeCheckoutTest = globalThis.fetch;
globalThis.fetch = async (url, options = {}) => {
  if (String(url) === 'https://commerce.aqua.test/v1/billing/checkout') {
    commerceRequest = options;
    return new Response(JSON.stringify({
      data: { id: 'cs_test', url: 'https://checkout.stripe.test/session' },
      meta: { traceId: 'trace-test' },
      errors: [],
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  throw new Error(`Unexpected URL: ${url}`);
};

try {
  let checkoutBody = '';
  const checkoutResponse = {
    statusCode: 0,
    setHeader() {},
    end(value) {
      checkoutBody = value;
    },
  };
  await vercelBillingCheckoutHandler(
    {
      method: 'POST',
      headers: { authorization: 'Bearer signed-session-token', host: 'tools.example.com' },
    },
    checkoutResponse,
  );
  assert.equal(checkoutResponse.statusCode, 201, checkoutBody);
  assert.equal(JSON.parse(checkoutBody).id, 'cs_test');
  assert.equal(commerceRequest.headers.Authorization, 'Bearer signed-session-token');
  assert.equal(commerceRequest.headers['X-AQUA-Product-Key'], 'product-key-test');
  assert.equal(commerceRequest.body, undefined);
} finally {
  globalThis.fetch = fetchBeforeCheckoutTest;
  for (const [name, value] of Object.entries(previousCommerceEnv)) {
    if (typeof value === 'undefined') delete process.env[name];
    else process.env[name] = value;
  }
}

let stripeCalls = 0;
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => {
  stripeCalls += 1;
  throw new Error('Stripe must not be called while the billing portal is suspended');
};

try {
  let vercelBody = '';
  const vercelResponse = {
    statusCode: 0,
    setHeader() {},
    end(value) {
      vercelBody = value;
    },
  };
  await vercelBillingPortalHandler({ method: 'POST' }, vercelResponse);
  assert.equal(vercelResponse.statusCode, 503);
  assert.equal(JSON.parse(vercelBody).error, 'BILLING_PORTAL_SUSPENDED');

  const cloudflareResponse = await cloudflareBillingPortalHandler({
    request: new Request('https://example.com/billing/portal', { method: 'POST' }),
  });
  assert.equal(cloudflareResponse.status, 503);
  assert.equal((await cloudflareResponse.json()).error, 'BILLING_PORTAL_SUSPENDED');

  const proxySource = fs.readFileSync('proxy/server.mjs', 'utf8');
  assert.ok(!proxySource.includes('/v1/billing_portal/sessions'), 'local proxy must not create Stripe portal sessions');
  assert.equal(stripeCalls, 0, 'suspended billing portal must not call Stripe');
} finally {
  globalThis.fetch = originalFetch;
}

console.log('Smoke tests passed');
