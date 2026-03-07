import { jsonResponse, methodNotAllowed, normalizeEnvValue } from '../_utils.js';

function getSiteUrl(request, env) {
  const configured = normalizeEnvValue(env.PUBLIC_SITE_URL || env.SITE_URL);
  if (configured) return configured.replace(/\/+$/, '');
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`.replace(/\/+$/, '');
}

async function stripeRequest(path, body, env) {
  const secretKey = normalizeEnvValue(env.STRIPE_SECRET_KEY);
  if (!secretKey) throw new Error('Missing STRIPE_SECRET_KEY');

  const res = await fetch(`https://api.stripe.com${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body),
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json?.error?.message || 'Stripe request failed');
  return json;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (request.method !== 'POST') return methodNotAllowed('POST,OPTIONS');

  try {
    const body = await request.json();
    const customerId = String(body?.customerId || '').trim();
    if (!customerId) return jsonResponse(400, { error: 'customerId é obrigatório' });

    const portal = await stripeRequest(
      '/v1/billing_portal/sessions',
      {
        customer: customerId,
        return_url: `${getSiteUrl(request, env)}/conta`,
      },
      env,
    );

    return jsonResponse(200, { url: portal.url });
  } catch (err) {
    return jsonResponse(500, { error: err.message || 'Billing portal failed' });
  }
}
