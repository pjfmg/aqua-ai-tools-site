import { jsonResponse, methodNotAllowed, safeTablePath, withCors } from './_utils.js';

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: withCors() });
  if (request.method !== 'GET') return methodNotAllowed('GET,OPTIONS');

  const airtablePat = env.AIRTABLE_PAT;
  const baseId = env.AIRTABLE_BASE_ID;
  const tableId = env.AIRTABLE_TABLE_ID;

  if (!airtablePat || !baseId || !tableId) {
    return jsonResponse(500, {
      error: 'Missing server env vars',
      required: ['AIRTABLE_PAT', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_ID'],
    });
  }

  const url = new URL(request.url);
  const pageSize = url.searchParams.get('pageSize');
  const offset = url.searchParams.get('offset');

  const airtableUrl = new URL(`https://api.airtable.com/v0/${baseId}/${safeTablePath(tableId)}`);
  if (pageSize) airtableUrl.searchParams.set('pageSize', pageSize);
  if (offset) airtableUrl.searchParams.set('offset', offset);

  const upstream = await fetch(airtableUrl, { headers: { Authorization: `Bearer ${airtablePat}` } });
  const text = await upstream.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { error: 'Invalid JSON from Airtable', raw: text };
  }

  return new Response(JSON.stringify(json), {
    status: upstream.status,
    headers: withCors({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    }),
  });
}

