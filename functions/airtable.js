import { jsonResponse, methodNotAllowed, withCors } from './_utils.js';
import { callAquaOsData, canonicalToolAsRecord, dataError } from '../aquaOsDataClient.mjs';
export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: withCors() });
  if (request.method !== 'GET') return methodNotAllowed('GET,OPTIONS');
  const url = new URL(request.url); url.searchParams.delete('_ts');
  const result = await callAquaOsData(request, `/v1/catalog/tools?${url.searchParams}`, { env });
  if (result.status >= 400) return jsonResponse(result.status, { error: dataError(result) });
  const records = Array.isArray(result.data?.tools) ? result.data.tools.map(canonicalToolAsRecord) : [];
  return jsonResponse(200, { records, ...(result.data?.nextCursor ? { offset: result.data.nextCursor } : {}) }, { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' });
}
