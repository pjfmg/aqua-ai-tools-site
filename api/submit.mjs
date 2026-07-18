import { callAquaOsData, dataError, legacySubmissionToCanonical } from '../aquaOsDataClient.mjs';
async function readJson(req) { let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 60_000) throw new Error('PAYLOAD_TOO_LARGE'); } return JSON.parse(body || '{}'); }
function json(res, status, body) { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); }
export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method Not Allowed' });
  let payload; try { payload = legacySubmissionToCanonical(await readJson(req)); } catch { return json(res, 400, { error: 'INVALID_JSON' }); }
  const result = await callAquaOsData(req, '/v1/catalog/submissions', { method: 'POST', body: payload });
  return result.status >= 400 ? json(res, result.status, { error: dataError(result) }) : json(res, result.status, { ok: true, result: result.data });
}
