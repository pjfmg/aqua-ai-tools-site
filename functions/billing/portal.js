import { jsonResponse, methodNotAllowed } from '../_utils.js';

export async function onRequest(context) {
  const { request } = context;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (request.method !== 'POST') return methodNotAllowed('POST,OPTIONS');

  return jsonResponse(503, {
    error: 'BILLING_PORTAL_SUSPENDED',
    message: 'Billing management is temporarily unavailable.',
  });
}
