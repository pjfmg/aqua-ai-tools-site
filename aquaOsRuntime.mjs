const circuitState = globalThis.__aquaOsCircuitState || new Map();
globalThis.__aquaOsCircuitState = circuitState;

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const FAILURE_THRESHOLD = 5;
const CIRCUIT_OPEN_MS = 30_000;

export function requestHeader(request, name) {
  if (request?.headers?.get) return String(request.headers.get(name) || '');
  const headers = request?.headers || {};
  return String(headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()] || '');
}

export function requestTraceId(request) {
  const supplied = requestHeader(request, 'x-trace-id').trim();
  if (/^[a-zA-Z0-9._:-]{8,128}$/.test(supplied)) return supplied;
  return globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function circuitFor(url) {
  const key = new URL(url).origin;
  const current = circuitState.get(key) || { failures: 0, openUntil: 0 };
  return { key, current };
}

function recordSuccess(key) { circuitState.delete(key); }
function recordFailure(key, current) {
  const failures = current.failures + 1;
  circuitState.set(key, { failures, openUntil: failures >= FAILURE_THRESHOLD ? Date.now() + CIRCUIT_OPEN_MS : 0 });
}

export async function fetchAquaOs(url, init = {}, { timeoutMs = 5_000, fetchImpl = fetch } = {}) {
  const method = String(init.method || 'GET').toUpperCase();
  const attempts = method === 'GET' ? 2 : 1;
  const { key, current } = circuitFor(url);
  if (current.openUntil > Date.now()) throw new Error('AQUA_OS_CIRCUIT_OPEN');

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new Error('AQUA_OS_TIMEOUT')), timeoutMs);
    try {
      const response = await fetchImpl(url, { ...init, signal: controller.signal });
      if (!RETRYABLE_STATUS.has(response.status)) { recordSuccess(key); return response; }
      lastError = new Error(`AQUA_OS_RETRYABLE_${response.status}`);
      if (attempt === attempts) { recordFailure(key, circuitState.get(key) || current); return response; }
    } catch (error) {
      lastError = error;
      if (attempt === attempts) { recordFailure(key, circuitState.get(key) || current); throw error; }
    } finally {
      clearTimeout(timeout);
    }
    await new Promise((resolve) => setTimeout(resolve, 50 * attempt));
  }
  throw lastError || new Error('AQUA_OS_UNAVAILABLE');
}

export function resetAquaOsCircuitsForTests() { circuitState.clear(); }
