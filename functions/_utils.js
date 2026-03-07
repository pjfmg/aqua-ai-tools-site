export function withCors(headers = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...headers,
  };
}

function stripWrappingQuotes(value) {
  const s = String(value ?? '').trim();
  if (!s) return '';
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1).trim();
  return s;
}

export function normalizeEnvValue(value, kind = 'generic') {
  const cleaned = stripWrappingQuotes(value);
  if (!cleaned) return '';

  // Common copy/paste mistakes:
  // - trailing punctuation from docs sentences (e.g. "app... .")
  // - pasting full path segments like "app.../tbl.../viw..."
  // - surrounding quotes
  const withoutTrailingPunct = cleaned.replace(/[)\],.;:]+$/g, '').trim();

  if (kind === 'base') {
    const m = withoutTrailingPunct.match(/app[a-zA-Z0-9]{10,}/);
    return (m?.[0] || withoutTrailingPunct).trim();
  }
  if (kind === 'table' || kind === 'view') {
    const prefix = kind === 'table' ? 'tbl' : 'viw';
    const re = new RegExp(`${prefix}[a-zA-Z0-9]{10,}`);
    const m = withoutTrailingPunct.match(re);
    return (m?.[0] || withoutTrailingPunct).trim();
  }
  if (kind === 'pat') {
    const m = withoutTrailingPunct.match(/pat[a-zA-Z0-9._-]{10,}/);
    return (m?.[0] || withoutTrailingPunct).trim();
  }

  return withoutTrailingPunct.trim();
}

export function jsonResponse(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: withCors({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    }),
  });
}

export function methodNotAllowed(allowed = 'GET,POST,OPTIONS') {
  return jsonResponse(405, { error: 'Method Not Allowed' }, { Allow: allowed });
}

export function safeTablePath(tableId) {
  try {
    return encodeURIComponent(decodeURIComponent(tableId));
  } catch {
    return encodeURIComponent(tableId);
  }
}

export async function fetchWithTimeout(url, init = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error('Timeout')), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export function isValidHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function parseDataUrl(dataUrl) {
  const str = String(dataUrl || '');
  const m = str.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!m) return null;
  return { contentType: m[1], base64: m[2] };
}

export function base64ToUint8Array(b64) {
  const bin = atob(String(b64 || ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
