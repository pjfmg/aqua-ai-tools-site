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

    const body = typeof req.body === 'object' && req.body ? req.body : JSON.parse(req.body || '{}');
    const customerId = String(body?.customerId || '').trim();
    if (!customerId) return json(res, 400, { error: 'customerId é obrigatório' });

    const portal = await stripeRequest('/v1/billing_portal/sessions', {
      customer: customerId,
      return_url: `${getSiteUrl(req)}/conta`,
    });

    return json(res, 200, { url: portal.url });
  } catch (err) {
    return json(res, 500, { error: err.message || 'Billing portal failed' });
  }
}
