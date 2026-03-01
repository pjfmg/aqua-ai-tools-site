import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

async function fetchWithTimeout(url, init = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error('Timeout')), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function loadDotEnvIfPresent() {
  try {
    const p = path.join(process.cwd(), '.env');
    if (!fs.existsSync(p)) return;
    const content = fs.readFileSync(p, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!key) continue;
      if (typeof process.env[key] === 'undefined' || process.env[key] === '') {
        process.env[key] = value;
      }
    }
  } catch {
    // ignore
  }
}

loadDotEnvIfPresent();

const port = Number(process.env.PORT || 3001);
const airtablePat = process.env.AIRTABLE_PAT;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableId = process.env.AIRTABLE_TABLE_ID;

if (!airtablePat || !baseId || !tableId) {
  console.error(
    'Missing env vars. Required: AIRTABLE_PAT, AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID',
  );
  process.exit(1);
}

function sendJson(res, status, body, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  res.end(JSON.stringify(body));
}

function withCors(headers = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...headers,
  };
}

async function readJsonBody(req) {
  let body = '';
  await new Promise((resolve, reject) => {
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 60_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', resolve);
    req.on('error', reject);
  });

  try {
    return JSON.parse(body || '{}');
  } catch {
    const err = new Error('Invalid JSON');
    err.code = 'INVALID_JSON';
    throw err;
  }
}

function safeTablePath(tableId) {
  try {
    return encodeURIComponent(decodeURIComponent(tableId));
  } catch {
    return encodeURIComponent(tableId);
  }
}

async function handleSubmit(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, withCors());
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed' }, withCors());
    return;
  }

  const submitTableId = process.env.AIRTABLE_SUBMIT_TABLE_ID || tableId;
  if (!submitTableId) {
    sendJson(
      res,
      500,
      { error: 'Missing AIRTABLE_TABLE_ID (or AIRTABLE_SUBMIT_TABLE_ID)' },
      withCors(),
    );
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (err) {
    const status = err.code === 'INVALID_JSON' ? 400 : 500;
    sendJson(res, status, { error: err.message }, withCors());
    return;
  }

  const nome = String(payload?.Nome || '').trim();
  const site = String(payload?.Site || '').trim();
  const descricao = String(payload?.['Descrição'] || '').trim();
  const funcoes = String(payload?.['Funções'] || '').trim();
  const preco = String(payload?.['Preço'] || '').trim();
  const area = Array.isArray(payload?.['Área/Categoria']) ? payload['Área/Categoria'] : [];

  if (!nome || !site) {
    sendJson(res, 400, { error: 'Nome e Site são obrigatórios.' }, withCors());
    return;
  }

  const airtableUrl = new URL(
    `https://api.airtable.com/v0/${baseId}/${safeTablePath(submitTableId)}`,
  );

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

  if (!upstream.ok) {
    sendJson(
      res,
      upstream.status,
      { error: 'Airtable request failed', details: json },
      withCors(),
    );
    return;
  }

  sendJson(res, 200, { ok: true, result: json }, withCors());
}

async function handleRate(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, withCors());
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed' }, withCors());
    return;
  }

  const ratingsTableId = process.env.AIRTABLE_RATINGS_TABLE_ID;
  if (!ratingsTableId) {
    sendJson(res, 500, { error: 'Missing AIRTABLE_RATINGS_TABLE_ID' }, withCors());
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (err) {
    const status = err.code === 'INVALID_JSON' ? 400 : 500;
    sendJson(res, status, { error: err.message }, withCors());
    return;
  }

  const toolKey = String(payload?.toolKey || '').trim();
  const userEmail = String(payload?.userEmail || '').trim().toLowerCase();
  const rating = Number(payload?.rating);
  const toolId = String(payload?.toolId || '').trim();
  const toolName = String(payload?.toolName || '').trim();

  if (!toolKey || !userEmail || !Number.isFinite(rating) || rating < 1 || rating > 5) {
    sendJson(res, 400, { error: 'Invalid payload' }, withCors());
    return;
  }

  const key = `${toolKey}:${userEmail}`;
  const airtableUrl = new URL(
    `https://api.airtable.com/v0/${baseId}/${safeTablePath(ratingsTableId)}`,
  );

  const fields = { Key: key, ToolKey: toolKey, UserEmail: userEmail, Rating: Math.round(rating) };
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

  if (!upstream.ok) {
    sendJson(
      res,
      upstream.status,
      { error: 'Airtable request failed', details: json },
      withCors(),
    );
    return;
  }

  sendJson(res, 200, { ok: true, result: json }, withCors());
}

async function handleRatings(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, withCors());
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method Not Allowed' }, withCors());
    return;
  }

  const ratingsTableId = process.env.AIRTABLE_RATINGS_TABLE_ID;
  if (!ratingsTableId) {
    sendJson(res, 500, { error: 'Missing AIRTABLE_RATINGS_TABLE_ID' }, withCors());
    return;
  }

  const all = [];
  let offset = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const airtableUrl = new URL(
      `https://api.airtable.com/v0/${baseId}/${safeTablePath(ratingsTableId)}`,
    );
    airtableUrl.searchParams.set('pageSize', '100');
    if (offset) airtableUrl.searchParams.set('offset', offset);

    const upstream = await fetch(airtableUrl, { headers: { Authorization: `Bearer ${airtablePat}` } });
    const text = await upstream.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { error: 'Invalid JSON from Airtable', raw: text };
    }

    if (!upstream.ok) {
      sendJson(
        res,
        upstream.status,
        { error: 'Airtable request failed', details: json },
        withCors(),
      );
      return;
    }

    for (const rec of json.records || []) all.push(rec);
    if (!json.offset) break;
    offset = json.offset;
  }

  const acc = new Map();
  for (const rec of all) {
    const f = rec?.fields || {};
    const keyFromFields = String(f.ToolKey || f['ToolKey'] || '').trim();
    const keyFromKey = String(f.Key || f['Key'] || '').split(':')[0].trim();
    const toolKey = keyFromFields || keyFromKey;
    if (!toolKey) continue;

    const rating = Number(f.Rating ?? f['Rating'] ?? f.Avaliação ?? f['Avaliação'] ?? f.Avaliacao ?? f['Avaliacao']);
    if (!Number.isFinite(rating)) continue;

    const v = acc.get(toolKey) || { sum: 0, count: 0 };
    v.sum += rating;
    v.count += 1;
    acc.set(toolKey, v);
  }

  const ratings = {};
  for (const [toolKey, v] of acc.entries()) {
    ratings[toolKey] = { avg: v.count ? Math.round((v.sum / v.count) * 10) / 10 : 0, count: v.count };
  }

  sendJson(res, 200, { ok: true, ratings }, withCors());
}

async function handlePreview(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, withCors());
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method Not Allowed' }, withCors());
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const target = String(url.searchParams.get('url') || '').trim();
  const width = Number(url.searchParams.get('w') || 1200);
  const nonce = url.searchParams.get('r');

  if (!target || target.length > 2048) {
    sendJson(res, 400, { error: 'Invalid url' }, withCors());
    return;
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    sendJson(res, 400, { error: 'Invalid url' }, withCors());
    return;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    sendJson(res, 400, { error: 'Invalid url' }, withCors());
    return;
  }

  async function respondImage(upstream, cacheControl) {
    const ct = upstream.headers.get('content-type') || 'image/jpeg';
    const ab = await upstream.arrayBuffer();
    res.writeHead(200, {
      ...withCors(),
      'Cache-Control': nonce ? 'no-store' : cacheControl,
      'Content-Type': ct,
    });
    res.end(Buffer.from(ab));
  }

  // Try Google PageSpeed screenshot first (fast when cached).
  try {
    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    apiUrl.searchParams.set('url', target);
    apiUrl.searchParams.set('strategy', 'desktop');

    const upstream = await fetchWithTimeout(
      apiUrl.toString(),
      { headers: { 'User-Agent': 'AQUA AI Tools preview' } },
      8000,
    );
    if (upstream.ok) {
      const json = await upstream.json().catch(() => ({}));
      const data =
        json?.lighthouseResult?.audits?.['final-screenshot']?.details?.data ||
        json?.lighthouseResult?.audits?.['screenshot-thumbnails']?.details?.items?.[0]?.data ||
        '';
      const m = String(data || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (m) {
        const buf = Buffer.from(m[2], 'base64');
        res.writeHead(200, {
          ...withCors(),
          'Cache-Control': nonce ? 'no-store' : 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
          'Content-Type': m[1],
        });
        res.end(buf);
        return;
      }
    }
  } catch {
    // ignore and fall back
  }

  // Fall back to WordPress mShots.
  try {
    const mshotsUrl = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(target)}?w=${Math.max(
      200,
      Math.round(width),
    )}`;
    const upstream = await fetchWithTimeout(mshotsUrl, {}, 8000);
    if (!upstream.ok) throw new Error(`mShots failed (${upstream.status})`);
    await respondImage(upstream, 'public, max-age=0, s-maxage=900, stale-while-revalidate=86400');
    return;
  } catch (err) {
    sendJson(res, 502, { error: 'Preview provider failed', message: err.message }, withCors());
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const pathname = url.pathname.replace(/\/+$/, '');

    if (pathname === '/submit') {
      await handleSubmit(req, res);
      return;
    }

    if (pathname === '/rate') {
      await handleRate(req, res);
      return;
    }

    if (pathname === '/ratings') {
      await handleRatings(req, res);
      return;
    }

    if (pathname === '/preview') {
      await handlePreview(req, res);
      return;
    }

    if (pathname !== '/airtable') {
      sendJson(res, 404, { error: 'Not Found' }, withCors());
      return;
    }

    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Method Not Allowed' }, withCors());
      return;
    }

    const airtableUrl = new URL(`https://api.airtable.com/v0/${baseId}/${safeTablePath(tableId)}`);

    // Pass-through only the query params the frontend expects/uses.
    const pageSize = url.searchParams.get('pageSize');
    const offset = url.searchParams.get('offset');
    if (pageSize) airtableUrl.searchParams.set('pageSize', pageSize);
    if (offset) airtableUrl.searchParams.set('offset', offset);

    const upstream = await fetch(airtableUrl, {
      headers: { Authorization: `Bearer ${airtablePat}` },
    });

    const text = await upstream.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { error: 'Invalid JSON from Airtable', raw: text };
    }

    if (!upstream.ok) {
      sendJson(
        res,
        upstream.status,
        { error: 'Airtable request failed', details: json },
        withCors(),
      );
      return;
    }

    // Return Airtable response shape: { records: [...], offset?: "..." }
    sendJson(res, 200, json, withCors());
  } catch (err) {
    sendJson(res, 500, { error: 'Proxy error', message: err.message }, withCors());
  }
});

server.listen(port, () => {
  console.log(`Airtable proxy listening on http://localhost:${port}/airtable`);
});
