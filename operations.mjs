import { requestTraceId } from './aquaOsRuntime.mjs';

const SERVICE = 'aqua-ai-tools-site';
const DEPENDENCY_TIMEOUT_MS = 5_000;
const DEPENDENCY_LATENCY_SLO_MS = 1_500;
const readinessCache = globalThis.__aquaReadinessCache || new Map();
globalThis.__aquaReadinessCache = readinessCache;

function release(env) {
  return String(env.VERCEL_GIT_COMMIT_SHA || env.AQUA_RELEASE || 'development').slice(0, 40);
}

export function dependencyProbeResult(name, available, latencyMs) {
  return {
    name,
    status: available ? 'ok' : 'fail',
    latencyMs,
    latencySlo: latencyMs <= DEPENDENCY_LATENCY_SLO_MS ? 'ok' : 'breached',
  };
}

async function probe(name, baseUrl, fetchImpl) {
  if (!baseUrl) return dependencyProbeResult(name, false, 0);
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEPENDENCY_TIMEOUT_MS);
  try {
    const response = await fetchImpl(`${String(baseUrl).replace(/\/+$/, '')}/v1/health/ready`, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: controller.signal });
    return dependencyProbeResult(name, response.ok, Date.now() - started);
  } catch {
    return dependencyProbeResult(name, false, Date.now() - started);
  } finally { clearTimeout(timeout); }
}

export async function healthSnapshot(request, mode = 'live', env = process.env, fetchImpl = fetch) {
  const traceId = requestTraceId(request);
  const base = { service: SERVICE, release: release(env), checkedAt: new Date().toISOString() };
  if (mode === 'live') return { status: 200, traceId, data: { ...base, status: 'ok' } };

  const configurationOk = Boolean(env.AQUA_OS_DATA_URL && env.AQUA_OS_COMMERCE_URL && env.AQUA_OS_PRODUCT_KEY && env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
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
