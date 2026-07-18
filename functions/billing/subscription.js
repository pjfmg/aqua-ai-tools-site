import { jsonResponse, methodNotAllowed } from '../_utils.js';
import { callAquaOsCommerce, commerceError, entitlementAsSubscription } from '../../aquaOsCommerceClient.mjs';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (request.method !== 'GET') return methodNotAllowed('GET,OPTIONS');
  const result = await callAquaOsCommerce(request, '/v1/entitlements/me', { env });
  if (result.status >= 400) return jsonResponse(result.status, { error: commerceError(result) });
  return jsonResponse(200, { ok: true, subscription: entitlementAsSubscription(result.data?.entitlement) });
}
