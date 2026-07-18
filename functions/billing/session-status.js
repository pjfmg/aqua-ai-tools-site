import { jsonResponse, methodNotAllowed } from '../_utils.js';
import { callAquaOsCommerce, commerceError, entitlementAsSubscription } from '../../aquaOsCommerceClient.mjs';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (request.method !== 'GET') return methodNotAllowed('GET,OPTIONS');
  const sessionId = String(new URL(request.url).searchParams.get('session_id') || '').trim();
  if (!sessionId) return jsonResponse(400, { error: 'SESSION_ID_REQUIRED' });
  const result = await callAquaOsCommerce(
    request,
    `/v1/billing/session-status?session_id=${encodeURIComponent(sessionId)}`,
    { env },
  );
  if (result.status >= 400) return jsonResponse(result.status, { error: commerceError(result) });
  return jsonResponse(200, {
    ok: true,
    subscription: entitlementAsSubscription(result.data?.entitlement),
    sessionStatus: String(result.data?.sessionStatus || ''),
  });
}
