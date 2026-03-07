import { fetchWithTimeout, jsonResponse, methodNotAllowed, withCors } from './_utils.js';

function isBlockedHostname(hostname) {
  const h = String(hostname || '').trim().toLowerCase();
  if (!h) return true;
  if (h === 'localhost') return true;
  if (h.endsWith('.local')) return true;

  // Block IP literals (basic SSRF guard).
  const isIpv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(h);
  if (isIpv4) return true;
  const isIpv6 = /^[0-9a-f:]+$/i.test(h) && h.includes(':');
  if (isIpv6) return true;

  return false;
}

export async function onRequest(context) {
  const { request } = context;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: withCors() });
  if (request.method !== 'GET' && request.method !== 'HEAD') return methodNotAllowed('GET,HEAD,OPTIONS');

  const url = new URL(request.url);
  const raw = url.searchParams.get('u') || url.searchParams.get('url') || '';
  const value = String(raw || '').trim();

  if (!value || value.length > 1800) return jsonResponse(400, { error: 'Missing or invalid url' });

  let upstreamUrl;
  try {
    upstreamUrl = new URL(value);
  } catch {
    return jsonResponse(400, { error: 'Invalid url' });
  }

  if (upstreamUrl.protocol !== 'https:') return jsonResponse(400, { error: 'Only https supported' });
  if (isBlockedHostname(upstreamUrl.hostname)) return jsonResponse(403, { error: 'Host not allowed' });

  const upstream = await fetchWithTimeout(
    upstreamUrl.toString(),
    {
      headers: {
        // Some providers behave differently without a UA.
        'User-Agent': 'AQUA-AI-Tools-ImageProxy/1.0',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
      redirect: 'follow',
    },
    9000,
  );

  if (!upstream.ok) {
    return jsonResponse(upstream.status, { error: 'Upstream failed', status: upstream.status });
  }

  const contentType = upstream.headers.get('content-type') || '';
  if (!String(contentType).toLowerCase().startsWith('image/')) {
    return jsonResponse(415, { error: 'Upstream is not an image', contentType });
  }

  const contentLength = Number(upstream.headers.get('content-length') || 0);
  if (contentLength && contentLength > 2_500_000) return jsonResponse(413, { error: 'Image too large' });

  if (request.method === 'HEAD') {
    return new Response(null, {
      status: 200,
      headers: withCors({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      }),
    });
  }

  const buf = await upstream.arrayBuffer();
  if (buf.byteLength > 2_500_000) return jsonResponse(413, { error: 'Image too large' });

  return new Response(buf, {
    status: 200,
    headers: withCors({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    }),
  });
}

