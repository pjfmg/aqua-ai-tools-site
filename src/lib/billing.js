import { getAccessToken } from './supabaseAuth.js';

async function parseJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || 'Resposta inválida do servidor' };
  }
}

async function authenticatedHeaders(includeJson = false) {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('AUTH_REQUIRED');
  return {
    Authorization: `Bearer ${accessToken}`,
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
  };
}

export async function createCheckoutSession() {
  const res = await fetch('/v1/billing/checkout-sessions', {
    method: 'POST',
    headers: await authenticatedHeaders(true),
    body: JSON.stringify({}),
  });
  const envelope = await parseJson(res);
  if (!res.ok) throw new Error(envelope?.errors?.[0]?.code || envelope?.error || 'Não foi possível iniciar o checkout');
  return envelope?.data ?? envelope;
}

export async function fetchCheckoutSessionStatus(sessionId) {
  const url = new URL('/v1/billing/checkout-sessions/status', window.location.origin);
  url.searchParams.set('session_id', sessionId);
  const res = await fetch(url.toString(), { cache: 'no-store', headers: await authenticatedHeaders() });
  const envelope = await parseJson(res);
  if (!res.ok) throw new Error(envelope?.errors?.[0]?.code || envelope?.error || 'Não foi possível confirmar o pagamento');
  return envelope?.data ?? envelope;
}

export async function fetchBillingSubscription() {
  const url = new URL('/v1/entitlements/me', window.location.origin);
  const res = await fetch(url.toString(), { cache: 'no-store', headers: await authenticatedHeaders() });
  const envelope = await parseJson(res);
  if (!res.ok) throw new Error(envelope?.errors?.[0]?.code || envelope?.error || 'Não foi possível carregar a subscrição');
  return envelope?.data ?? envelope;
}
