import { jsonResponse, methodNotAllowed, withCors } from './_utils.js';
import { callAquaOsData, dataError, legacySubmissionToCanonical } from '../aquaOsDataClient.mjs';
export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: withCors() });
  if (request.method !== 'POST') return methodNotAllowed('POST,OPTIONS');
  let payload; try { payload = legacySubmissionToCanonical(await request.json()); } catch { return jsonResponse(400, { error: 'INVALID_JSON' }); }
  const result = await callAquaOsData(request, '/v1/catalog/submissions', { env, method: 'POST', body: payload });
  return result.status >= 400 ? jsonResponse(result.status, { error: dataError(result) }) : jsonResponse(result.status, { ok: true, result: result.data });
}
