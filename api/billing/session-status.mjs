import { callAquaOsCommerce, commerceError, entitlementAsSubscription } from '../../aquaOsCommerceClient.mjs';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });
  const sessionId = String(req.query?.session_id || '').trim();
  if (!sessionId) return json(res, 400, { error: 'SESSION_ID_REQUIRED' });
  const result = await callAquaOsCommerce(req, `/v1/billing/session-status?session_id=${encodeURIComponent(sessionId)}`);
  if (result.status >= 400) return json(res, result.status, { error: commerceError(result) });
  return json(res, 200, {
    ok: true,
    subscription: entitlementAsSubscription(result.data?.entitlement),
    sessionStatus: String(result.data?.sessionStatus || ''),
  });
}
