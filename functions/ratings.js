import { jsonResponse, methodNotAllowed, withCors } from './_utils.js';
import { callAquaOsData, dataError } from '../aquaOsDataClient.mjs';
export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: withCors() });
  if (request.method !== 'GET') return methodNotAllowed('GET,OPTIONS');
  const result = await callAquaOsData(request, '/v1/catalog/ratings', { env });
  return result.status >= 400 ? jsonResponse(result.status, { error: dataError(result) }) : jsonResponse(200, { ok: true, ratings: result.data?.ratings || {} });
}
