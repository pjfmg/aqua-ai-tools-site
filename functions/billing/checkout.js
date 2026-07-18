import { jsonResponse, methodNotAllowed } from '../_utils.js';
import { callAquaOsCommerce, commerceError } from '../../aquaOsCommerceClient.mjs';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (request.method !== 'POST') return methodNotAllowed('POST,OPTIONS');
  const result = await callAquaOsCommerce(request, '/v1/billing/checkout', { env, method: 'POST' });
  return jsonResponse(result.status, result.data || { error: commerceError(result) });
}
