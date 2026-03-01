const PAGE_SIZE = 100;

function safeTablePath(tableId) {
  try {
    return encodeURIComponent(decodeURIComponent(tableId));
  } catch {
    return encodeURIComponent(tableId);
  }
}

async function readUpstreamError(res) {
  try {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      const msg =
        json?.error ||
        json?.message ||
        (typeof json === 'string' ? json : JSON.stringify(json));
      return String(msg).slice(0, 400);
    } catch {
      return String(text || '').slice(0, 400);
    }
  } catch {
    return '';
  }
}

async function fetchAllRatings({ airtablePat, baseId, ratingsTableId }) {
  const all = [];
  let offset = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const airtableUrl = new URL(
      `https://api.airtable.com/v0/${baseId}/${safeTablePath(ratingsTableId)}`,
    );
    airtableUrl.searchParams.set('pageSize', String(PAGE_SIZE));
    if (offset) airtableUrl.searchParams.set('offset', offset);

    const res = await fetch(airtableUrl, { headers: { Authorization: `Bearer ${airtablePat}` } });
    if (!res.ok) {
      const details = await readUpstreamError(res);
      throw new Error(`Airtable request failed (${res.status})${details ? `: ${details}` : ''}`);
    }
    const json = await res.json().catch(() => ({}));
    if (!json?.records) throw new Error('Resposta inválida do Airtable (ratings)');
    for (const rec of json.records) all.push(rec);
    if (!json.offset) break;
    offset = json.offset;
  }

  return all;
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      return;
    }

    const airtablePat = process.env.AIRTABLE_PAT;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const ratingsTableId = process.env.AIRTABLE_RATINGS_TABLE_ID;

    if (!airtablePat || !baseId || !ratingsTableId) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          error: 'Missing server env vars',
          required: ['AIRTABLE_PAT', 'AIRTABLE_BASE_ID', 'AIRTABLE_RATINGS_TABLE_ID'],
        }),
      );
      return;
    }

    const records = await fetchAllRatings({ airtablePat, baseId, ratingsTableId });
    const acc = new Map(); // toolKey -> { sum, count }

    for (const rec of records) {
      const f = rec?.fields || {};
      const keyFromFields = String(f.ToolKey || f['ToolKey'] || '').trim();
      const keyFromKey = String(f.Key || f['Key'] || '').split(':')[0].trim();
      const toolKey = keyFromFields || keyFromKey;
      if (!toolKey) continue;

      const rating =
        toNumber(f.Rating ?? f['Rating']) ??
        toNumber(f.Avaliação ?? f['Avaliação']) ??
        toNumber(f.Avaliacao ?? f['Avaliacao']);
      if (rating == null) continue;

      const v = acc.get(toolKey) || { sum: 0, count: 0 };
      v.sum += rating;
      v.count += 1;
      acc.set(toolKey, v);
    }

    const ratings = {};
    for (const [toolKey, v] of acc.entries()) {
      ratings[toolKey] = {
        avg: v.count ? Math.round((v.sum / v.count) * 10) / 10 : 0,
        count: v.count,
      };
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ ok: true, ratings }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: err.message || 'Proxy error' }));
  }
}

