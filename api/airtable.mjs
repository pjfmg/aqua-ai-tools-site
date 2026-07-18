import { callAquaOsData, canonicalToolAsRecord, dataError } from '../aquaOsDataClient.mjs';

function json(res, status, body) { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body)); }
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });
  const url = new URL(req.url, `http://${req.headers.host}`); url.searchParams.delete('operation'); url.searchParams.delete('_ts');
  const result = await callAquaOsData(req, `/v1/catalog/tools?${url.searchParams}`);
  if (result.status >= 400) return json(res, result.status, { error: dataError(result) });
  const records = Array.isArray(result.data?.tools) ? result.data.tools.map(canonicalToolAsRecord) : [];
  res.setHeader('Cache-Control', result.data?.nextCursor ? 'no-store' : 'public, max-age=0, s-maxage=60, stale-while-revalidate=600');
  return json(res, 200, { records, ...(result.data?.nextCursor ? { offset: result.data.nextCursor } : {}) });
}
