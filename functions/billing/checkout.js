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
    const priceId = normalizeEnvValue(env.STRIPE_PRICE_ID_PRO);
    if (!priceId) return jsonResponse(500, { error: 'Missing STRIPE_PRICE_ID_PRO' });

    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    if (!email) return jsonResponse(400, { error: 'Email é obrigatório' });

    const siteUrl = getSiteUrl(request, env);
    const session = await stripeRequest(
      '/v1/checkout/sessions',
      {
        mode: 'subscription',
        success_url: `${siteUrl}/conta?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/pro?checkout=cancelled`,
        customer_email: email,
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        allow_promotion_codes: 'true',
        'metadata[user_email]': email,
      },
      env,
    );

    return jsonResponse(200, { id: session.id, url: session.url });
  } catch (err) {
    return jsonResponse(500, { error: err.message || 'Billing checkout failed' });
  }
}
