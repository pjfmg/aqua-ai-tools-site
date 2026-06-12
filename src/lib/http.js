export async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function requestJson(url, options = {}) {
  const response = await fetchWithTimeout(url, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.error || data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export function getJson(url, options = {}) {
  return requestJson(url, { ...options, method: options.method || 'GET' });
}

export function postJson(url, body, options = {}) {
  return requestJson(url, {
    ...options,
    method: options.method || 'POST',
    body: JSON.stringify(body || {}),
  });
}

export default requestJson;
