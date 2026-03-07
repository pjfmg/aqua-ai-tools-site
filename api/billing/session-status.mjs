function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function env(name, fallback = '') {
  return String(process.env[name] || fallback || '').trim();
}

async function stripeGet(path) {
  const secretKey = env('STRIPE_SECRET_KEY');
  if (!secretKey) throw new Error('Missing STRIPE_SECRET_KEY');

  const res = await fetch(`https://api.stripe.com${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const text = await res.text();
  const jsonBody = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(jsonBody?.error?.message || 'Stripe request failed');
  return jsonBody;
}

function safeTablePath(tableId) {
  try {
    return encodeURIComponent(decodeURIComponent(tableId));
  } catch {
    return encodeURIComponent(tableId);
  }
}

function getBillingConfig() {
  return {
    airtablePat: env('AIRTABLE_PAT'),
    baseId: env('AIRTABLE_BILLING_BASE_ID') || env('AIRTABLE_BASE_ID'),
    tableId: env('AIRTABLE_BILLING_TABLE_ID'),
  };
}

async function upsertBillingRecord(subscription) {
  const { airtablePat, baseId, tableId } = getBillingConfig();
  if (!airtablePat || !baseId || !tableId) return false;

  const fields = {
    Key: subscription.customerEmail,
    UserEmail: subscription.customerEmail,
    Plan: subscription.plan,
    Status: subscription.status,
    CustomerId: subscription.customerId,
    CheckoutSessionId: subscription.checkoutSessionId,
    CurrentPeriodEnd: subscription.currentPeriodEnd || '',
    UpdatedAt: subscription.updatedAt,
  };

  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${safeTablePath(tableId)}`, {
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

  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body?.error?.message || 'Failed to write billing record to Airtable');
  return true;
}

function toSubscriptionPayload(session) {
  const subscription = session?.subscription;
  return {
    plan: 'pro',
    status: String(subscription?.status || session?.payment_status || '').toLowerCase(),
    customerId: String(session?.customer || '').trim(),
    customerEmail: String(session?.customer_details?.email || '').trim().toLowerCase(),
    checkoutSessionId: String(session?.id || '').trim(),
    currentPeriodEnd: subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : '',
    updatedAt: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });
    const sessionId = String(req.query?.session_id || '').trim();
    if (!sessionId) return json(res, 400, { error: 'session_id é obrigatório' });

    const session = await stripeGet(
      `/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=subscription`,
    );
    const subscription = toSubscriptionPayload(session);

    if (subscription.customerEmail) await upsertBillingRecord(subscription);

    return json(res, 200, {
      ok: true,
      subscription,
      sessionStatus: String(session?.status || '').toLowerCase(),
    });
  } catch (err) {
    return json(res, 500, { error: err.message || 'Billing status failed' });
  }
}
