import { jsonResponse, methodNotAllowed, normalizeEnvValue, safeTablePath } from '../_utils.js';

async function stripeGet(path, env) {
  const secretKey = normalizeEnvValue(env.STRIPE_SECRET_KEY);
  if (!secretKey) throw new Error('Missing STRIPE_SECRET_KEY');

  const res = await fetch(`https://api.stripe.com${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json?.error?.message || 'Stripe request failed');
  return json;
}

async function upsertBillingRecord(subscription, env) {
  const airtablePat = normalizeEnvValue(env.AIRTABLE_PAT, 'pat');
  const baseId = normalizeEnvValue(env.AIRTABLE_BILLING_BASE_ID || env.AIRTABLE_BASE_ID, 'base');
  const tableId = normalizeEnvValue(env.AIRTABLE_BILLING_TABLE_ID, 'table');
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
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json?.error?.message || 'Failed to write billing record to Airtable');
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

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (request.method !== 'GET') return methodNotAllowed('GET,OPTIONS');

  try {
    const url = new URL(request.url);
    const sessionId = String(url.searchParams.get('session_id') || '').trim();
    if (!sessionId) return jsonResponse(400, { error: 'session_id é obrigatório' });

    const session = await stripeGet(
      `/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=subscription`,
      env,
    );
    const subscription = toSubscriptionPayload(session);

    if (subscription.customerEmail) await upsertBillingRecord(subscription, env);

    return jsonResponse(200, {
      ok: true,
      subscription,
      sessionStatus: String(session?.status || '').toLowerCase(),
    });
  } catch (err) {
    return jsonResponse(500, { error: err.message || 'Billing status failed' });
  }
}
