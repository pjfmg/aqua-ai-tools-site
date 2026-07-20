import { callAquaOsData, dataError } from '../aquaOsDataClient.mjs';

const VALID_TOPICS = new Set(['productivity', 'content-design', 'code-automation', 'business-research', 'education']);

async function readJson(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 20_000) throw new Error('PAYLOAD_TOO_LARGE');
  }
  return JSON.parse(body || '{}');
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function normalize(payload) {
  const email = String(payload?.email || '').trim().toLowerCase();
  const topics = [...new Set(Array.isArray(payload?.topics) ? payload.topics.filter((topic) => VALID_TOPICS.has(topic)) : [])];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('INVALID_EMAIL');
  if (!topics.length) throw new Error('TOPIC_REQUIRED');
  return {
    email,
    topics,
    locale: payload?.locale === 'en' ? 'en' : 'pt',
    cadence: 'weekly',
    source: 'aqua-ai-tools-site',
    consentedAt: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method Not Allowed' });
  let payload;
  try { payload = normalize(await readJson(req)); }
  catch (error) { return json(res, 400, { error: error.message === 'TOPIC_REQUIRED' ? 'TOPIC_REQUIRED' : 'INVALID_SUBSCRIPTION' }); }
  const result = await callAquaOsData(req, '/v1/marketing/newsletter-subscriptions', { method: 'POST', body: payload });
  return result.status >= 400
    ? json(res, result.status, { error: dataError(result) })
    : json(res, result.status, { ok: true, subscription: result.data });
}
