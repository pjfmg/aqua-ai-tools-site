import { jsonResponse, methodNotAllowed, normalizeEnvValue, safeTablePath, withCors } from './_utils.js';
import { buildAirtableDirectoryFormula, normalizeAirtableStatus } from '../airtableFilters.mjs';

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: withCors() });
  if (request.method !== 'GET') return methodNotAllowed('GET,OPTIONS');

  const airtablePat = normalizeEnvValue(env.AIRTABLE_PAT, 'pat');
  const baseId = normalizeEnvValue(env.AIRTABLE_BASE_ID, 'base');
  const tableId = normalizeEnvValue(env.AIRTABLE_TABLE_ID, 'table');

  if (!airtablePat || !baseId || !tableId) {
    return jsonResponse(500, {
      error: 'Missing server env vars',
      required: ['AIRTABLE_PAT', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_ID'],
    });
  }

  const url = new URL(request.url);
  const pageSize = url.searchParams.get('pageSize');
  const offset = url.searchParams.get('offset');
  const status = normalizeAirtableStatus(url.searchParams.get('status'));
  const filterByFormula = buildAirtableDirectoryFormula({
    status,
    q: url.searchParams.get('q'),
    number: url.searchParams.get('number'),
    area: url.searchParams.get('area'),
    price: url.searchParams.get('price'),
  });

  const airtableUrl = new URL(`https://api.airtable.com/v0/${baseId}/${safeTablePath(tableId)}`);
  if (pageSize) airtableUrl.searchParams.set('pageSize', pageSize);
  if (offset) airtableUrl.searchParams.set('offset', offset);
  if (filterByFormula) airtableUrl.searchParams.set('filterByFormula', filterByFormula);

  const upstream = await fetch(airtableUrl, { headers: { Authorization: `Bearer ${airtablePat}` } });
  const text = await upstream.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { error: 'Invalid JSON from Airtable', raw: text };
  }

  // Important: Airtable pagination uses an `offset` cursor that can expire.
  // If we cache responses that include `offset`, clients may receive a stale cursor
  // and the next page request can fail with 422 (e.g. LIST_RECORDS_ITERATOR_NOT_AVAILABLE).
  const hasOffset = Boolean(json && typeof json === 'object' && json.offset);
  const cacheControl = hasOffset
    ? 'no-store'
    : // Safe to cache only when everything fits in one page (no pagination cursor).
      'public, max-age=0, s-maxage=600, stale-while-revalidate=86400';

  return new Response(JSON.stringify(json), {
    status: upstream.status,
    headers: withCors({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
    }),
  });
}
