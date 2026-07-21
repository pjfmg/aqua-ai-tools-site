import airtableHandler from '../airtable.mjs';
import submitHandler from '../submit.mjs';
import rateHandler from '../rate.mjs';
import ratingsHandler from '../ratings.mjs';
import previewHandler from '../preview.mjs';
import imageHandler from '../img.mjs';
import checkoutHandler from '../billing/checkout.mjs';
import sessionStatusHandler from '../billing/session-status.mjs';
import subscriptionHandler from '../billing/subscription.mjs';
import portalHandler from '../billing/portal.mjs';
import newsletterHandler from '../../newsletterHandler.mjs';
import { authenticateRequest } from '../../authSession.mjs';
import { apiEnvelope, auditApiEvent, enforceApiGovernance } from '../../apiGovernance.mjs';

const ROUTES = {
  tools: { operation: 'tools', handler: airtableHandler },
  'tool-submissions': { operation: 'tool-submissions', handler: submitHandler, auth: true },
  'tool-ratings-read': { operation: 'tool-ratings-read', handler: ratingsHandler },
  'tool-ratings-write': { operation: 'tool-ratings-write', handler: rateHandler },
  'site-previews': { operation: 'site-previews', handler: previewHandler, binary: true },
  images: { operation: 'images', handler: imageHandler, binary: true },
  'billing-checkout': { operation: 'billing-checkout', handler: checkoutHandler },
  'billing-status': { operation: 'billing-status', handler: sessionStatusHandler },
  entitlements: { operation: 'entitlements', handler: subscriptionHandler },
  'billing-portal': { operation: 'billing-portal', handler: portalHandler, auth: true },
  'newsletter-subscriptions': { operation: 'newsletter-subscriptions', handler: newsletterHandler },
};

function capturedResponse() {
  const headers = new Map();
  const chunks = [];
  return {
    statusCode: 200,
    setHeader(name, value) { headers.set(String(name).toLowerCase(), value); },
    getHeader(name) { return headers.get(String(name).toLowerCase()); },
    writeHead(status, values = {}) {
      this.statusCode = status;
      for (const [name, value] of Object.entries(values)) this.setHeader(name, value);
    },
    write(chunk) { if (chunk != null) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); },
    end(chunk) { if (chunk != null) this.write(chunk); this.finished = true; },
    result() { return { status: this.statusCode, headers, body: Buffer.concat(chunks) }; },
  };
}

function send(res, status, headers, body) {
  res.statusCode = status;
  for (const [name, value] of headers) res.setHeader(name, value);
  res.end(body);
}

export default async function handler(req, res) {
  const started = Date.now();
  let route = ROUTES[String(req.query?.operation || '')];
  if (route?.operation === 'tool-ratings-read' && req.method === 'POST') route = ROUTES['tool-ratings-write'];
  if (!route) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ data: null, meta: {}, errors: [{ code: 'ROUTE_NOT_FOUND' }] }));
  }
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Trace-Id');
    return res.end();
  }

  const governance = await enforceApiGovernance(req, route.operation);
  const commonHeaders = new Map(Object.entries(governance.headers));
  commonHeaders.set('Cache-Control', 'no-store');
  commonHeaders.set('Content-Type', 'application/json; charset=utf-8');

  if (!governance.allowed) {
    commonHeaders.set('Retry-After', governance.headers['RateLimit-Reset']);
    await auditApiEvent({ request: req, operation: route.operation, traceId: governance.traceId, principal: governance.principal, status: 429, durationMs: Date.now() - started });
    return send(res, 429, commonHeaders, JSON.stringify(apiEnvelope(429, { error: 'RATE_LIMIT_EXCEEDED' }, governance.traceId)));
  }

  if (route.auth) {
    const auth = await authenticateRequest(req);
    if (!auth.ok) {
      await auditApiEvent({ request: req, operation: route.operation, traceId: governance.traceId, principal: governance.principal, status: auth.status, durationMs: Date.now() - started });
      return send(res, auth.status, commonHeaders, JSON.stringify(apiEnvelope(auth.status, { error: auth.error }, governance.traceId)));
    }
  }

  const capture = capturedResponse();
  let result;
  try {
    const tracedHeaders = { ...(req.headers || {}), 'x-trace-id': governance.traceId };
    const governedRequest = new Proxy(req, {
      get(target, property) {
        if (property === 'headers') return tracedHeaders;
        const value = Reflect.get(target, property, target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
    await route.handler(governedRequest, capture);
    result = capture.result();
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', event: 'api.request.failed', traceId: governance.traceId, operation: route.operation, code: 'UNHANDLED_HANDLER_ERROR' }));
    capture.statusCode = 500;
    capture.setHeader('Content-Type', 'application/json; charset=utf-8');
    capture.end(JSON.stringify({ error: 'INTERNAL_ERROR' }));
    result = capture.result();
  }
  for (const [name, value] of result.headers) commonHeaders.set(name, value);
  for (const [name, value] of Object.entries(governance.headers)) commonHeaders.set(name, value);
  commonHeaders.set('Server-Timing', `app;dur=${Math.max(0, Date.now() - started)}`);

  let body = result.body;
  const contentType = String(commonHeaders.get('content-type') || '');
  if (!route.binary || contentType.includes('json')) {
    let parsed;
    try { parsed = JSON.parse(body.toString('utf8') || 'null'); } catch { parsed = { error: 'INVALID_HANDLER_RESPONSE' }; }
    body = Buffer.from(JSON.stringify(apiEnvelope(result.status, parsed, governance.traceId)));
    commonHeaders.set('Content-Type', 'application/json; charset=utf-8');
  }

  await auditApiEvent({ request: req, operation: route.operation, traceId: governance.traceId, principal: governance.principal, status: result.status, durationMs: Date.now() - started });
  return send(res, result.status, commonHeaders, body);
}
