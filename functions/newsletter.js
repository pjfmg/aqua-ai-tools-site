import { jsonResponse, methodNotAllowed, withCors } from './_utils.js';
import { callAquaOsData, dataError } from '../aquaOsDataClient.mjs';

const VALID_TOPICS = new Set(['productivity', 'content-design', 'code-automation', 'business-research', 'education']);

function normalize(payload) {
  const email = String(payload?.email || '').trim().toLowerCase();
  const topics = [...new Set(Array.isArray(payload?.topics) ? payload.topics.filter((topic) => VALID_TOPICS.has(topic)) : [])];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('INVALID_EMAIL');
  if (!topics.length) throw new Error('TOPIC_REQUIRED');
  return { email, topics, locale: payload?.locale === 'en' ? 'en' : 'pt', cadence: 'weekly', source: 'aqua-ai-tools-site', consentedAt: new Date().toISOString() };
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: withCors() });
  if (request.method !== 'POST') return methodNotAllowed('POST,OPTIONS');
  let payload;
  try { payload = normalize(await request.json()); }
  catch (error) { return jsonResponse(400, { error: error.message === 'TOPIC_REQUIRED' ? 'TOPIC_REQUIRED' : 'INVALID_SUBSCRIPTION' }); }
  const result = await callAquaOsData(request, '/v1/marketing/newsletter-subscriptions', { env, method: 'POST', body: payload });
  return result.status >= 400
    ? jsonResponse(result.status, { error: dataError(result) })
    : jsonResponse(result.status, { ok: true, subscription: result.data });
}
