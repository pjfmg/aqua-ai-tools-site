import { callAquaOsCommerce, commerceError, entitlementAsSubscription } from '../../aquaOsCommerceClient.mjs';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });
  const result = await callAquaOsCommerce(req, '/v1/entitlements/me');
  if (result.status >= 400) return json(res, result.status, { error: commerceError(result) });
  return json(res, 200, { ok: true, subscription: entitlementAsSubscription(result.data?.entitlement) });
}
