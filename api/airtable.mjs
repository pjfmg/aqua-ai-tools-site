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
    const tableId = process.env.AIRTABLE_TABLE_ID;

    if (!airtablePat || !baseId || !tableId) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          error: 'Missing server env vars',
          required: ['AIRTABLE_PAT', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_ID'],
        }),
      );
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pageSize = url.searchParams.get('pageSize');
    const offset = url.searchParams.get('offset');

    const tablePath = (() => {
      try {
        return encodeURIComponent(decodeURIComponent(tableId));
      } catch {
        return encodeURIComponent(tableId);
      }
    })();
    const airtableUrl = new URL(`https://api.airtable.com/v0/${baseId}/${tablePath}`);
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

    // Do not cache paginated responses (Airtable `offset` cursors can expire).
    const hasOffset = Boolean(json && typeof json === 'object' && json.offset);

    res.statusCode = upstream.status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      hasOffset ? 'no-store' : 'public, max-age=0, s-maxage=60, stale-while-revalidate=600',
    );
    res.end(JSON.stringify(json));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
  }
}
