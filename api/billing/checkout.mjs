function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function getSiteUrl(req) {
  const configured = String(process.env.PUBLIC_SITE_URL || process.env.SITE_URL || '').trim();
  if (configured) return configured.replace(/\/+$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`.replace(/\/+$/, '');
}

async function stripeRequest(path, body) {
  const secretKey = String(process.env.STRIPE_SECRET_KEY || '').trim();
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
  const jsonBody = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message = jsonBody?.error?.message || 'Stripe request failed';
    throw new Error(message);
  }
  return jsonBody;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return json(res, 405, { error: 'Method Not Allowed' });

    const priceId = String(process.env.STRIPE_PRICE_ID_PRO || '').trim();
    if (!priceId) return json(res, 500, { error: 'Missing STRIPE_PRICE_ID_PRO' });

    const body = typeof req.body === 'object' && req.body ? req.body : JSON.parse(req.body || '{}');
    const email = String(body?.email || '').trim().toLowerCase();
    if (!email) return json(res, 400, { error: 'Email é obrigatório' });

    const siteUrl = getSiteUrl(req);
    const session = await stripeRequest('/v1/checkout/sessions', {
      mode: 'subscription',
      success_url: `${siteUrl}/conta?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pro?checkout=cancelled`,
      customer_email: email,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      allow_promotion_codes: 'true',
      'metadata[user_email]': email,
    });

    return json(res, 200, { id: session.id, url: session.url });
  } catch (err) {
    return json(res, 500, { error: err.message || 'Billing checkout failed' });
  }
}
