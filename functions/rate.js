import { jsonResponse, methodNotAllowed, withCors } from './_utils.js';
import { authenticateRequest } from '../authSession.mjs';
import { callAquaOsCommerce, commerceError } from '../aquaOsCommerceClient.mjs';
import { callAquaOsData, dataError } from '../aquaOsDataClient.mjs';
export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: withCors() });
  if (request.method !== 'POST') return methodNotAllowed('POST,OPTIONS');
  const auth = await authenticateRequest(request, env); if (!auth.ok) return jsonResponse(auth.status, { error: auth.error });
  const entitlement = await callAquaOsCommerce(request, '/v1/entitlements/me', { env });
  if (entitlement.status >= 400) return jsonResponse(entitlement.status, { error: commerceError(entitlement) });
  if (!entitlement.data?.entitlement?.features?.includes('personal_ratings')) return jsonResponse(403, { error: 'PRO_ENTITLEMENT_REQUIRED' });
  let payload; try { payload = await request.json(); } catch { return jsonResponse(400, { error: 'INVALID_JSON' }); }
  const result = await callAquaOsData(request, '/v1/catalog/ratings/me', { env, method: 'PUT', body: { toolKey: String(payload?.toolKey || ''), rating: Number(payload?.rating) } });
  return result.status >= 400 ? jsonResponse(result.status, { error: dataError(result) }) : jsonResponse(200, { ok: true, result: result.data });
}
