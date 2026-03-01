function safeTablePath(tableId) {
  try {
    return encodeURIComponent(decodeURIComponent(tableId));
  } catch {
    return encodeURIComponent(tableId);
  }
}

async function readJson(req) {
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
  return JSON.parse(body || '{}');
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
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

    let payload;
    try {
      payload = await readJson(req);
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    const toolKey = String(payload?.toolKey || '').trim();
    const userEmail = String(payload?.userEmail || '').trim().toLowerCase();
    const rating = Number(payload?.rating);
    const toolId = String(payload?.toolId || '').trim();
    const toolName = String(payload?.toolName || '').trim();

    if (!toolKey || !userEmail || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Invalid payload' }));
      return;
    }

    const key = `${toolKey}:${userEmail}`;

    const tablePath = safeTablePath(ratingsTableId);
    const airtableUrl = new URL(`https://api.airtable.com/v0/${baseId}/${tablePath}`);

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

    if (!upstream.ok) {
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Airtable request failed', details: json }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ ok: true, result: json }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: err.message || 'Proxy error' }));
  }
}

