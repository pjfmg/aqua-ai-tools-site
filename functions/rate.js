import { jsonResponse, methodNotAllowed, safeTablePath, withCors } from './_utils.js';

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: withCors() });
  if (request.method !== 'POST') return methodNotAllowed('POST,OPTIONS');

  const airtablePat = env.AIRTABLE_PAT;
  const baseId = env.AIRTABLE_BASE_ID;
  const ratingsTableId = env.AIRTABLE_RATINGS_TABLE_ID;

  if (!airtablePat || !baseId || !ratingsTableId) {
    return jsonResponse(500, {
      error: 'Missing server env vars',
      required: ['AIRTABLE_PAT', 'AIRTABLE_BASE_ID', 'AIRTABLE_RATINGS_TABLE_ID'],
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' });
  }

  const toolKey = String(payload?.toolKey || '').trim();
  const userEmail = String(payload?.userEmail || '').trim().toLowerCase();
  const rating = Number(payload?.rating);
  const toolId = String(payload?.toolId || '').trim();
  const toolName = String(payload?.toolName || '').trim();

  if (!toolKey || !userEmail || !Number.isFinite(rating) || rating < 1 || rating > 5) {
    return jsonResponse(400, { error: 'Invalid payload' });
  }

  const key = `${toolKey}:${userEmail}`;
  const airtableUrl = new URL(`https://api.airtable.com/v0/${baseId}/${safeTablePath(ratingsTableId)}`);

  const fields = {
    Key: key,
    ToolKey: toolKey,
    UserEmail: userEmail,
    Rating: Math.round(rating),
  };
  if (toolId) fields.ToolId = toolId;
  if (toolName) fields.ToolName = toolName;

  const upstream = await fetch(airtableUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${airtablePat}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      performUpsert: { fieldsToMergeOn: ['Key'] },
      records: [{ fields }],
    }),
  });

  const text = await upstream.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { error: 'Invalid JSON from Airtable', raw: text };
  }

  if (!upstream.ok) return jsonResponse(upstream.status, { error: 'Airtable request failed', details: json });

  return jsonResponse(200, { ok: true, result: json });
}

