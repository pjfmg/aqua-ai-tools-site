import { jsonResponse, methodNotAllowed, normalizeEnvValue, safeTablePath, withCors } from './_utils.js';

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: withCors() });
  if (request.method !== 'POST') return methodNotAllowed('POST,OPTIONS');

  const airtablePat = normalizeEnvValue(env.AIRTABLE_PAT, 'pat');
  const baseId = normalizeEnvValue(env.AIRTABLE_BASE_ID, 'base');
  const tableId = normalizeEnvValue(env.AIRTABLE_SUBMIT_TABLE_ID || env.AIRTABLE_TABLE_ID, 'table');

  if (!airtablePat || !baseId || !tableId) {
    return jsonResponse(500, {
      error: 'Missing server env vars',
      required: ['AIRTABLE_PAT', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_ID (or AIRTABLE_SUBMIT_TABLE_ID)'],
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' });
  }

  const nome = String(payload?.Nome || '').trim();
  const site = String(payload?.Site || '').trim();
  const descricao = String(payload?.['Descrição'] || '').trim();
  const funcoes = String(payload?.['Funções'] || '').trim();
  const preco = String(payload?.['Preço'] || '').trim();
  const area = Array.isArray(payload?.['Área/Categoria']) ? payload['Área/Categoria'] : [];

  if (!nome || !site) return jsonResponse(400, { error: 'Nome e Site são obrigatórios.' });

  const airtableUrl = new URL(`https://api.airtable.com/v0/${baseId}/${safeTablePath(tableId)}`);

  const fields = { Nome: nome, Site: site };
  if (descricao) fields['Descrição'] = descricao;
  if (funcoes) fields['Funções'] = funcoes;
  if (preco) fields['Preço'] = preco;
  if (area?.length) fields['Área/Categoria'] = area;

  const upstream = await fetch(airtableUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${airtablePat}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ records: [{ fields }] }),
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
