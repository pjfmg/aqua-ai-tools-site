import { onRequest as tools } from '../airtable.js';
import { onRequest as submissions } from '../submit.js';
import { onRequest as rate } from '../rate.js';
import { onRequest as ratings } from '../ratings.js';
import { onRequest as previews } from '../preview.js';
import { onRequest as images } from '../img.js';
import { onRequest as checkout } from '../billing/checkout.js';
import { onRequest as status } from '../billing/session-status.js';
import { onRequest as entitlements } from '../billing/subscription.js';
import { onRequest as portal } from '../billing/portal.js';
import { onRequest as health } from '../health.js';
import { onRequest as newsletter } from '../newsletter.js';
import { authenticateRequest } from '../../authSession.mjs';
import { apiEnvelope, auditApiEvent, enforceApiGovernance } from '../../apiGovernance.mjs';
import { withCors } from '../_utils.js';

const ROUTES = {
  'tools': { operation: 'tools', handler: tools },
  'tool-submissions': { operation: 'tool-submissions', handler: submissions, auth: true },
  'tool-ratings': { operation: 'tool-ratings-read', handler: ratings, method: 'GET' },
  'site-previews': { operation: 'site-previews', handler: previews, binary: true },
  'images': { operation: 'images', handler: images, binary: true },
  'billing/checkout-sessions': { operation: 'billing-checkout', handler: checkout },
  'billing/checkout-sessions/status': { operation: 'billing-status', handler: status },
  'entitlements/me': { operation: 'entitlements', handler: entitlements },
  'billing/portal-sessions': { operation: 'billing-portal', handler: portal, auth: true },
  'newsletter-subscriptions': { operation: 'newsletter-subscriptions', handler: newsletter },
};

function json(statusCode, body, headers = {}) {
  return new Response(JSON.stringify(body), { status: statusCode, headers: withCors({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }) });
}

export async function onRequest(context) {
  const started = Date.now();
  const path = new URL(context.request.url).pathname.replace(/^\/v1\/?/, '').replace(/\/+$/, '');
  if (path === 'health/live' || path === 'health/ready') return health(context);
  let route = ROUTES[path];
  if (path === 'tool-ratings' && context.request.method === 'POST') route = { operation: 'tool-ratings-write', handler: rate };
  if (!route) return json(404, { data: null, meta: {}, errors: [{ code: 'ROUTE_NOT_FOUND' }] });
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: withCors() });

  const governance = await enforceApiGovernance(context.request, route.operation, context.env);
  if (!governance.allowed) {
    await auditApiEvent({ request: context.request, env: context.env, operation: route.operation, traceId: governance.traceId, principal: governance.principal, status: 429, durationMs: Date.now() - started });
    return json(429, apiEnvelope(429, { error: 'RATE_LIMIT_EXCEEDED' }, governance.traceId), { ...governance.headers, 'Retry-After': governance.headers['RateLimit-Reset'] });
  }
  if (route.auth) {
    const auth = await authenticateRequest(context.request, context.env);
    if (!auth.ok) {
      await auditApiEvent({ request: context.request, env: context.env, operation: route.operation, traceId: governance.traceId, principal: governance.principal, status: auth.status, durationMs: Date.now() - started });
      return json(auth.status, apiEnvelope(auth.status, { error: auth.error }, governance.traceId), governance.headers);
    }
  }

  let response;
  try {
    const tracedHeaders = new Headers(context.request.headers);
    tracedHeaders.set('X-Trace-Id', governance.traceId);
    const tracedContext = { ...context, request: new Request(context.request, { headers: tracedHeaders }) };
    response = await route.handler(tracedContext);
  } catch {
    console.error(JSON.stringify({ level: 'error', event: 'api.request.failed', traceId: governance.traceId, operation: route.operation, code: 'UNHANDLED_HANDLER_ERROR' }));
    response = json(500, { error: 'INTERNAL_ERROR' });
  }
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(governance.headers)) headers.set(name, value);
  headers.set('Server-Timing', `app;dur=${Math.max(0, Date.now() - started)}`);
  let result = response;
  if (!route.binary || String(headers.get('content-type') || '').includes('json')) {
    const body = await response.json().catch(() => ({ error: 'INVALID_HANDLER_RESPONSE' }));
    headers.set('Content-Type', 'application/json; charset=utf-8');
    result = new Response(JSON.stringify(apiEnvelope(response.status, body, governance.traceId)), { status: response.status, headers });
  }
  const audit = auditApiEvent({ request: context.request, env: context.env, operation: route.operation, traceId: governance.traceId, principal: governance.principal, status: response.status, durationMs: Date.now() - started });
  if (context.waitUntil) context.waitUntil(audit); else await audit;
  return result;
}
