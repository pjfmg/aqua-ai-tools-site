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
    const tableId = process.env.AIRTABLE_SUBMIT_TABLE_ID || process.env.AIRTABLE_TABLE_ID;

    if (!airtablePat || !baseId || !tableId) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          error: 'Missing server env vars',
          required: ['AIRTABLE_PAT', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_ID (or AIRTABLE_SUBMIT_TABLE_ID)'],
        }),
      );
      return;
    }

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

    let payload;
    try {
      payload = JSON.parse(body || '{}');
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    const nome = String(payload?.Nome || '').trim();
    const site = String(payload?.Site || '').trim();
    const descricao = String(payload?.['Descrição'] || '').trim();
    const funcoes = String(payload?.['Funções'] || '').trim();
    const preco = String(payload?.['Preço'] || '').trim();
    const area = Array.isArray(payload?.['Área/Categoria']) ? payload['Área/Categoria'] : [];

    if (!nome || !site) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Nome e Site são obrigatórios.' }));
      return;
    }

    const tablePath = (() => {
      try {
        return encodeURIComponent(decodeURIComponent(tableId));
      } catch {
        return encodeURIComponent(tableId);
      }
    })();

    const airtableUrl = new URL(`https://api.airtable.com/v0/${baseId}/${tablePath}`);

    const fields = {
      Nome: nome,
      Site: site,
    };
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

