import { fetchAquaOs, requestHeader } from './aquaOsRuntime.mjs';

function readAuthorization(request) {
  if (request?.headers?.get) return String(request.headers.get('authorization') || '').trim();
  return String(request?.headers?.authorization || request?.headers?.Authorization || '').trim();
}

function commerceConfig(env = {}) {
  return {
    url: String(env.AQUA_OS_COMMERCE_URL || '').trim().replace(/\/+$/, ''),
    productKey: String(env.AQUA_OS_PRODUCT_KEY || '').trim(),
  };
}

export async function callAquaOsCommerce(request, path, { env = process.env, method = 'GET' } = {}) {
  const { url, productKey } = commerceConfig(env);
  if (!url || !productKey) {
    return { status: 503, data: null, errors: [{ code: 'AQUA_OS_COMMERCE_NOT_CONFIGURED' }] };
  }
  const authorization = readAuthorization(request);
  if (!authorization) return { status: 401, data: null, errors: [{ code: 'AUTH_REQUIRED' }] };

  const traceId = requestHeader(request, 'x-trace-id').trim();
  try {
    const response = await fetchAquaOs(`${url}${path}`, {
      method,
      headers: { Authorization: authorization, 'X-AQUA-Product-Key': productKey, ...(traceId ? { 'X-Trace-Id': traceId } : {}) },
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({ data: null, errors: [{ code: 'INVALID_COMMERCE_RESPONSE' }] }));
    return { status: response.status, data: payload?.data ?? null, errors: Array.isArray(payload?.errors) ? payload.errors : [] };
  } catch {
    return { status: 503, data: null, errors: [{ code: 'AQUA_OS_COMMERCE_UNAVAILABLE' }] };
  }
}

export function commerceError(result) {
  return String(result?.errors?.[0]?.code || 'AQUA_OS_COMMERCE_ERROR');
}

export function entitlementAsSubscription(entitlement) {
  if (!entitlement) return null;
  return {
    plan: String(entitlement.plan || 'starter'),
    status: String(entitlement.status || 'inactive'),
    currentPeriodEnd: String(entitlement.currentPeriodEnd || ''),
  };
}
