async function parseJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || 'Resposta inválida do servidor' };
  }
}

export async function createCheckoutSession({ email }) {
  const res = await fetch('/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(json?.error || 'Não foi possível iniciar o checkout');
  return json;
}

export async function fetchCheckoutSessionStatus(sessionId) {
  const url = new URL('/billing/session-status', window.location.origin);
  url.searchParams.set('session_id', sessionId);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(json?.error || 'Não foi possível confirmar o pagamento');
  return json;
}

export async function fetchBillingSubscription(email) {
  const url = new URL('/billing/subscription', window.location.origin);
  url.searchParams.set('email', String(email || '').trim().toLowerCase());
  const res = await fetch(url.toString(), { cache: 'no-store' });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(json?.error || 'Não foi possível carregar a subscrição');
  return json;
}

export async function createBillingPortalSession({ customerId }) {
  const res = await fetch('/billing/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId }),
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error(json?.error || 'Não foi possível abrir a faturação');
  return json;
}
