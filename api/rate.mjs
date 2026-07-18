import { authenticateRequest } from '../authSession.mjs';
import { callAquaOsCommerce, commerceError } from '../aquaOsCommerceClient.mjs';
import { callAquaOsData, dataError } from '../aquaOsDataClient.mjs';
async function readJson(req) { let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 60_000) throw new Error('PAYLOAD_TOO_LARGE'); } return JSON.parse(body || '{}'); }
function json(res, status, body) { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); }
export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method Not Allowed' });
  const auth = await authenticateRequest(req); if (!auth.ok) return json(res, auth.status, { error: auth.error });
  const entitlement = await callAquaOsCommerce(req, '/v1/entitlements/me');
  if (entitlement.status >= 400) return json(res, entitlement.status, { error: commerceError(entitlement) });
  if (!entitlement.data?.entitlement?.features?.includes('personal_ratings')) return json(res, 403, { error: 'PRO_ENTITLEMENT_REQUIRED' });
  let payload; try { payload = await readJson(req); } catch { return json(res, 400, { error: 'INVALID_JSON' }); }
  const result = await callAquaOsData(req, '/v1/catalog/ratings/me', { method: 'PUT', body: { toolKey: String(payload?.toolKey || ''), rating: Number(payload?.rating) } });
  return result.status >= 400 ? json(res, result.status, { error: dataError(result) }) : json(res, 200, { ok: true, result: result.data });
}
