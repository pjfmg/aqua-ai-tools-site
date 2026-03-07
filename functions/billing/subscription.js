import { jsonResponse, methodNotAllowed, normalizeEnvValue, safeTablePath } from '../_utils.js';

async function stripeGet(path, env) {
  const secretKey = normalizeEnvValue(env.STRIPE_SECRET_KEY);
  if (!secretKey) return null;

  const res = await fetch(`https://api.stripe.com${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json?.error?.message || 'Stripe request failed');
  return json;
}

function escapeFormulaValue(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function normalizeRecord(record) {
  const fields = record?.fields || {};
  return {
    plan: String(fields.Plan || '').trim().toLowerCase(),
    status: String(fields.Status || '').trim().toLowerCase(),
    customerId: String(fields.CustomerId || '').trim(),
    customerEmail: String(fields.UserEmail || fields.Key || '').trim().toLowerCase(),
    checkoutSessionId: String(fields.CheckoutSessionId || '').trim(),
    currentPeriodEnd: String(fields.CurrentPeriodEnd || '').trim(),
    updatedAt: String(fields.UpdatedAt || '').trim(),
  };
}

async function upsertBillingRecord({ airtablePat, baseId, tableId, subscription }) {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${safeTablePath(tableId)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${airtablePat}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      performUpsert: { fieldsToMergeOn: ['Key'] },
      records: [
        {
          fields: {
            Key: subscription.customerEmail,
            UserEmail: subscription.customerEmail,
            Plan: subscription.plan,
            Status: subscription.status,
            CustomerId: subscription.customerId,
            CheckoutSessionId: subscription.checkoutSessionId,
            CurrentPeriodEnd: subscription.currentPeriodEnd || '',
            UpdatedAt: subscription.updatedAt,
          },
        },
      ],
    }),
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json?.error?.message || 'Failed to write billing record to Airtable');
}

function pickLatestSubscription(stripeSubscriptions) {
  const items = Array.isArray(stripeSubscriptions?.data) ? stripeSubscriptions.data : [];
  if (!items.length) return null;
  const sorted = [...items].sort((a, b) => Number(b?.created || 0) - Number(a?.created || 0));
  return (
    sorted.find((item) => ['active', 'trialing', 'past_due', 'canceled', 'unpaid'].includes(String(item?.status || ''))) ||
    sorted[0]
  );
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (request.method !== 'GET') return methodNotAllowed('GET,OPTIONS');

  try {
    const airtablePat = normalizeEnvValue(env.AIRTABLE_PAT, 'pat');
    const baseId = normalizeEnvValue(env.AIRTABLE_BILLING_BASE_ID || env.AIRTABLE_BASE_ID, 'base');
    const tableId = normalizeEnvValue(env.AIRTABLE_BILLING_TABLE_ID, 'table');

    if (!airtablePat || !baseId || !tableId) {
      return jsonResponse(500, {
        error: 'Missing server env vars',
        required: ['AIRTABLE_PAT', 'AIRTABLE_BILLING_TABLE_ID', 'AIRTABLE_BASE_ID (or AIRTABLE_BILLING_BASE_ID)'],
      });
    }

    const url = new URL(request.url);
    const email = String(url.searchParams.get('email') || '').trim().toLowerCase();
    if (!email) return jsonResponse(400, { error: 'email é obrigatório' });

    const airtableUrl = new URL(`https://api.airtable.com/v0/${baseId}/${safeTablePath(tableId)}`);
    airtableUrl.searchParams.set('maxRecords', '1');
    airtableUrl.searchParams.set('sort[0][field]', 'UpdatedAt');
    airtableUrl.searchParams.set('sort[0][direction]', 'desc');
    airtableUrl.searchParams.set('filterByFormula', `{Key}='${escapeFormulaValue(email)}'`);

    const upstream = await fetch(airtableUrl, {
      headers: { Authorization: `Bearer ${airtablePat}` },
    });

    const text = await upstream.text();
    const json = text ? JSON.parse(text) : {};
    if (!upstream.ok) return jsonResponse(upstream.status, { error: json?.error?.message || 'Airtable request failed' });

    const record = Array.isArray(json?.records) ? json.records[0] : null;
    let subscription = record ? normalizeRecord(record) : null;

    if (subscription?.customerId) {
      const stripeSubscriptions = await stripeGet(
        `/v1/subscriptions?customer=${encodeURIComponent(subscription.customerId)}&status=all&limit=10`,
        env,
      );
      const latest = pickLatestSubscription(stripeSubscriptions);
      if (latest) {
        subscription = {
          ...subscription,
          plan: 'pro',
          status: String(latest.status || subscription.status || '').trim().toLowerCase(),
          currentPeriodEnd: latest.current_period_end ? new Date(latest.current_period_end * 1000).toISOString() : '',
          updatedAt: new Date().toISOString(),
        };
        await upsertBillingRecord({ airtablePat, baseId, tableId, subscription });
      }
    }

    return jsonResponse(200, { ok: true, subscription });
  } catch (err) {
    return jsonResponse(500, { error: err.message || 'Billing subscription failed' });
  }
}
