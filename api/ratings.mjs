import { callAquaOsData, dataError } from '../aquaOsDataClient.mjs';
function json(res, status, body) { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); }
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });
  const result = await callAquaOsData(req, '/v1/catalog/ratings');
  return result.status >= 400 ? json(res, result.status, { error: dataError(result) }) : json(res, 200, { ok: true, ratings: result.data?.ratings || {} });
}
