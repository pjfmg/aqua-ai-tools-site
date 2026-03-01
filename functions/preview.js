import {
  base64ToUint8Array,
  fetchWithTimeout,
  isValidHttpUrl,
  jsonResponse,
  methodNotAllowed,
  parseDataUrl,
  withCors,
} from './_utils.js';

async function tryPageSpeedScreenshot(url) {
  const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  apiUrl.searchParams.set('url', url);
  apiUrl.searchParams.set('strategy', 'desktop');

  const res = await fetchWithTimeout(apiUrl.toString(), { headers: { 'User-Agent': 'AQUA AI Tools preview' } }, 8000);
  if (!res.ok) throw new Error(`PageSpeed failed (${res.status})`);
  const json = await res.json().catch(() => ({}));

  const data =
    json?.lighthouseResult?.audits?.['final-screenshot']?.details?.data ||
    json?.lighthouseResult?.audits?.['screenshot-thumbnails']?.details?.items?.[0]?.data ||
    '';

  const parsed = parseDataUrl(data);
  if (!parsed) throw new Error('No screenshot in PageSpeed response');

  const bytes = base64ToUint8Array(parsed.base64);
  return { contentType: parsed.contentType, body: bytes };
}

async function tryMShots(url, width = 1200) {
  const mshotsUrl = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=${Math.max(
    200,
    Math.round(width),
  )}`;
  const res = await fetchWithTimeout(mshotsUrl, {}, 8000);
  if (!res.ok) throw new Error(`mShots failed (${res.status})`);
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const ab = await res.arrayBuffer();
  return { contentType, body: ab };
}

export async function onRequest(context) {
  const { request } = context;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: withCors() });
  if (request.method !== 'GET') return methodNotAllowed('GET,OPTIONS');

  const url = new URL(request.url);
  const target = String(url.searchParams.get('url') || '').trim();
  const width = Number(url.searchParams.get('w') || 1200);
  const nonce = url.searchParams.get('r');

  if (!target || target.length > 2048 || !isValidHttpUrl(target)) {
    return jsonResponse(400, { error: 'Invalid url' });
  }

  try {
    try {
      const { contentType, body } = await tryPageSpeedScreenshot(target);
      return new Response(body, {
        status: 200,
        headers: withCors({
          'Cache-Control': nonce ? 'no-store' : 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
          'Content-Type': contentType,
        }),
      });
    } catch {
      // Fall back to mShots.
    }

    const { contentType, body } = await tryMShots(target, width);
    return new Response(body, {
      status: 200,
      headers: withCors({
        // Shorter cache for mShots because first response can be a "Generating preview" placeholder.
        'Cache-Control': nonce ? 'no-store' : 'public, max-age=0, s-maxage=900, stale-while-revalidate=86400',
        'Content-Type': contentType,
      }),
    });
  } catch (err) {
    return jsonResponse(500, { error: err.message || 'Proxy error' });
  }
}

