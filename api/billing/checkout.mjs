import { callAquaOsCommerce, commerceError } from '../../aquaOsCommerceClient.mjs';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method Not Allowed' });
  const result = await callAquaOsCommerce(req, '/v1/billing/checkout', { method: 'POST' });
  return json(res, result.status, result.data || { error: commerceError(result) });
}
