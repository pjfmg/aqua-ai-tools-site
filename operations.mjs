import { requestTraceId } from './aquaOsRuntime.mjs';

const SERVICE = 'aqua-ai-tools-site';
const readinessCache = globalThis.__aquaReadinessCache || new Map();
globalThis.__aquaReadinessCache = readinessCache;

function release(env) {
  return String(
    env.VERCEL_GIT_COMMIT_SHA
    || env.CF_PAGES_COMMIT_SHA
    || env.AQUA_RELEASE
    || 'development',
  ).slice(0, 40);
}

function validServiceUrl(value) {
  try {
    const url = new URL(String(value || ''));
    const local = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    return url.protocol === 'https:' || (local && url.protocol === 'http:');
  } catch {
    return false;
  }
}

export function deploymentConfigurationStatus(env = process.env) {
  const values = {
    AQUA_OS_DATA_URL: String(env.AQUA_OS_DATA_URL || '').trim(),
    AQUA_OS_COMMERCE_URL: String(env.AQUA_OS_COMMERCE_URL || '').trim(),
    AQUA_OS_PRODUCT_KEY: String(env.AQUA_OS_PRODUCT_KEY || '').trim(),
    SUPABASE_URL: String(env.SUPABASE_URL || '').trim(),
    SUPABASE_ANON_KEY: String(env.SUPABASE_ANON_KEY || '').trim(),
    SUPABASE_SERVICE_ROLE_KEY: String(env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
    AQUA_RELEASE: release(env),
  };
  const missing = Object.entries(values)
    .filter(([, value]) => !value || value === 'development')
    .map(([name]) => name);
  const invalid = [
    ['AQUA_OS_DATA_URL', values.AQUA_OS_DATA_URL],
    ['AQUA_OS_COMMERCE_URL', values.AQUA_OS_COMMERCE_URL],
    ['SUPABASE_URL', values.SUPABASE_URL],
  ].filter(([, value]) => value && !validServiceUrl(value)).map(([name]) => name);
  return { ok: missing.length === 0 && invalid.length === 0, missing, invalid };
}

async function probe(name, baseUrl, fetchImpl) {
  if (!baseUrl) return { name, status: 'fail', latencyMs: 0 };
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1_500);
  try {
    const response = await fetchImpl(`${String(baseUrl).replace(/\/+$/, '')}/v1/health/ready`, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: controller.signal });
    return { name, status: response.ok ? 'ok' : 'fail', latencyMs: Date.now() - started };
  } catch {
    return { name, status: 'fail', latencyMs: Date.now() - started };
  } finally { clearTimeout(timeout); }
}

export async function healthSnapshot(request, mode = 'live', env = process.env, fetchImpl = fetch) {
  const traceId = requestTraceId(request);
  const base = { service: SERVICE, release: release(env), checkedAt: new Date().toISOString() };
  if (mode === 'live') return { status: 200, traceId, data: { ...base, status: 'ok' } };

  const configurationOk = deploymentConfigurationStatus(env).ok;
  const cacheKey = `${String(env.AQUA_OS_DATA_URL || '')}|${String(env.AQUA_OS_COMMERCE_URL || '')}|${configurationOk}`;
  const cached = readinessCache.get(cacheKey);
  if (cached?.expiresAt > Date.now()) return { status: cached.status, traceId, data: cached.data };
  const dependencies = await Promise.all([
    probe('data-platform', env.AQUA_OS_DATA_URL, fetchImpl),
    probe('commerce', env.AQUA_OS_COMMERCE_URL, fetchImpl),
  ]);
  const ready = configurationOk && dependencies.every((dependency) => dependency.status === 'ok');
  const snapshot = {
    status: ready ? 200 : 503,
    traceId,
    data: { ...base, status: ready ? 'ready' : 'not_ready', checks: [{ name: 'configuration', status: configurationOk ? 'ok' : 'fail' }, ...dependencies] },
  };
  readinessCache.set(cacheKey, { status: snapshot.status, data: snapshot.data, expiresAt: Date.now() + 5_000 });
  return snapshot;
}

export function healthEnvelope(snapshot) {
  return { data: snapshot.data, meta: { traceId: snapshot.traceId }, errors: snapshot.status >= 400 ? [{ code: 'SERVICE_NOT_READY' }] : [] };
}
