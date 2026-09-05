const memoryBuckets = globalThis.__aquaApiRateBuckets || new Map();
globalThis.__aquaApiRateBuckets = memoryBuckets;

export const API_POLICIES = Object.freeze({
  tools: { limit: 120, windowSeconds: 60, auth: false },
  'tool-submissions': { limit: 5, windowSeconds: 3600, auth: true },
  'tool-ratings-read': { limit: 120, windowSeconds: 60, auth: false },
  'tool-ratings-write': { limit: 60, windowSeconds: 3600, auth: true },
  'site-previews': { limit: 30, windowSeconds: 60, auth: false },
  images: { limit: 120, windowSeconds: 60, auth: false },
  'billing-checkout': { limit: 10, windowSeconds: 3600, auth: true },
  'billing-status': { limit: 60, windowSeconds: 3600, auth: true },
  entitlements: { limit: 120, windowSeconds: 3600, auth: true },
  'billing-portal': { limit: 5, windowSeconds: 3600, auth: true },
  'newsletter-subscriptions': { limit: 5, windowSeconds: 3600, auth: false },
  'revenue-link-status': { limit: 120, windowSeconds: 60, auth: false },
  'revenue-link-redirect': { limit: 60, windowSeconds: 60, auth: false },
});

function header(request, name) {
  if (request?.headers?.get) return String(request.headers.get(name) || '');
  const headers = request?.headers || {};
  return String(headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()] || '');
}

function config(env = {}) {
  return {
    supabaseUrl: String(env.SUPABASE_URL || '').trim().replace(/\/+$/, ''),
    serviceRoleKey: String(env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
  };
}

function traceIdFrom(request) {
  const supplied = header(request, 'x-trace-id').trim();
  if (/^[a-zA-Z0-9._:-]{8,128}$/.test(supplied)) return supplied;
  return globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

async function digest(value) {
  const bytes = new TextEncoder().encode(String(value));
  const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function principalKey(request) {
  const authorization = header(request, 'authorization').trim();
  if (authorization) return `auth:${await digest(authorization)}`;
  const forwarded = header(request, 'x-forwarded-for').split(',')[0].trim();
  const ip = forwarded || header(request, 'cf-connecting-ip').trim() || request?.socket?.remoteAddress || 'unknown';
  return `ip:${await digest(ip)}`;
}

async function durableRateLimit({ env, bucketKey, policy }) {
  const { supabaseUrl, serviceRoleKey } = config(env);
  if (!supabaseUrl || !serviceRoleKey) return null;
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/aqua_check_rate_limit`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_key: bucketKey,
      p_limit: policy.limit,
      p_window_seconds: policy.windowSeconds,
    }),
  });
  if (!response.ok) throw new Error(`RATE_LIMIT_STORE_FAILED_${response.status}`);
  const payload = await response.json();
  const row = Array.isArray(payload) ? payload[0] : payload;
  return {
    allowed: Boolean(row?.allowed),
    remaining: Math.max(0, Number(row?.remaining || 0)),
    resetAt: String(row?.reset_at || ''),
    store: 'supabase',
  };
}

function memoryRateLimit(bucketKey, policy) {
  const now = Date.now();
  const existing = memoryBuckets.get(bucketKey);
  const bucket = !existing || existing.resetAt <= now
    ? { count: 0, resetAt: now + policy.windowSeconds * 1000 }
    : existing;
  bucket.count += 1;
  memoryBuckets.set(bucketKey, bucket);
  return {
    allowed: bucket.count <= policy.limit,
    remaining: Math.max(0, policy.limit - bucket.count),
    resetAt: new Date(bucket.resetAt).toISOString(),
    store: 'memory',
  };
}

export async function enforceApiGovernance(request, operation, env = process.env) {
  const policy = API_POLICIES[operation];
  if (!policy) throw new Error(`UNKNOWN_API_OPERATION_${operation}`);
  const traceId = traceIdFrom(request);
  const principal = await principalKey(request);
  const bucketKey = `${operation}:${principal}`;
  let rate;
  try {
    rate = await durableRateLimit({ env, bucketKey, policy });
  } catch (error) {
    console.error(JSON.stringify({ event: 'api.rate_limit.store_error', traceId, operation, message: error.message }));
  }
  rate ||= memoryRateLimit(bucketKey, policy);
  const resetSeconds = Math.max(0, Math.ceil((Date.parse(rate.resetAt) - Date.now()) / 1000));
  return {
    allowed: rate.allowed,
    traceId,
    principal,
    policy,
    headers: {
      'X-Trace-Id': traceId,
      'RateLimit-Limit': String(policy.limit),
      'RateLimit-Remaining': String(rate.remaining),
      'RateLimit-Reset': String(resetSeconds),
      'RateLimit-Policy': `${policy.limit};w=${policy.windowSeconds}`,
    },
    store: rate.store,
  };
}

export function apiEnvelope(status, body, traceId) {
  if (body && typeof body === 'object' && 'data' in body && Array.isArray(body.errors)) {
    return { ...body, meta: { ...(body.meta || {}), traceId } };
  }
  if (status >= 400) {
    const raw = body?.error || body?.message || `HTTP_${status}`;
    const code = typeof raw === 'string' && /^[A-Z0-9_]+$/.test(raw) ? raw : `HTTP_${status}`;
    const message = typeof raw === 'string' ? raw : JSON.stringify(raw);
    return { data: null, meta: { traceId }, errors: [{ code, message }] };
  }
  return { data: body ?? null, meta: { traceId }, errors: [] };
}

export async function auditApiEvent({ request, env = process.env, operation, traceId, principal, status, durationMs }) {
  const event = {
    level: Number(status) >= 500 ? 'error' : Number(status) >= 400 ? 'warn' : 'info',
    event: 'api.request.completed',
    service: 'aqua-ai-tools-site',
    release: String(env.VERCEL_GIT_COMMIT_SHA || env.AQUA_RELEASE || 'development').slice(0, 40),
    traceId,
    operation,
    principal,
    method: String(request?.method || ''),
    path: new URL(request?.url || '/', 'http://localhost').pathname,
    status: Number(status),
    durationMs: Math.max(0, Math.round(durationMs)),
    outcome: Number(status) >= 500 ? 'failure' : 'success',
    occurredAt: new Date().toISOString(),
  };
  console.info(JSON.stringify(event));
  const { supabaseUrl, serviceRoleKey } = config(env);
  if (!supabaseUrl || !serviceRoleKey) return;
  try {
    await fetch(`${supabaseUrl}/rest/v1/aqua_api_audit_events`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        trace_id: traceId,
        operation,
        principal_hash: principal,
        method: event.method,
        path: event.path,
        status: event.status,
        duration_ms: event.durationMs,
        occurred_at: event.occurredAt,
      }),
    });
  } catch (error) {
    console.error(JSON.stringify({ event: 'api.audit.store_error', traceId, operation, message: error.message }));
  }
}
