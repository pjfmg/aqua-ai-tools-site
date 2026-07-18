import { healthEnvelope, healthSnapshot } from '../operations.mjs';
import { withCors } from './_utils.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: withCors() });
  if (context.request.method !== 'GET') return new Response(null, { status: 405, headers: withCors({ Allow: 'GET' }) });
  const mode = new URL(context.request.url).pathname.endsWith('/ready') ? 'ready' : 'live';
  const snapshot = await healthSnapshot(context.request, mode, context.env);
  return new Response(JSON.stringify(healthEnvelope(snapshot)), {
    status: snapshot.status,
    headers: withCors({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Trace-Id': snapshot.traceId }),
  });
}
