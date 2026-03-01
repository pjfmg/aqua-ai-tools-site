function isValidHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function parseDataUrl(dataUrl) {
  const str = String(dataUrl || '');
  const m = str.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!m) return null;
  return { contentType: m[1], base64: m[2] };
}

async function fetchWithTimeout(url, init = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error('Timeout')), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

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

  const buf = Buffer.from(parsed.base64, 'base64');
  return { contentType: parsed.contentType, body: buf };
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
  return { contentType, body: Buffer.from(ab) };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const target = String(url.searchParams.get('url') || '').trim();
    const width = Number(url.searchParams.get('w') || 1200);
    const nonce = url.searchParams.get('r');

    if (!target || target.length > 2048 || !isValidHttpUrl(target)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Invalid url' }));
      return;
    }

    try {
      const { contentType, body } = await tryPageSpeedScreenshot(target);
      res.statusCode = 200;
      res.setHeader(
        'Cache-Control',
        nonce ? 'no-store' : 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      );
      res.setHeader('Content-Type', contentType);
      res.end(body);
      return;
    } catch {
      // Fall back to mShots.
    }

    const { contentType, body } = await tryMShots(target, width);
    res.statusCode = 200;
    // Shorter cache for mShots because first response can be a "Generating preview" placeholder.
    res.setHeader(
      'Cache-Control',
      nonce ? 'no-store' : 'public, max-age=0, s-maxage=900, stale-while-revalidate=86400',
    );
    res.setHeader('Content-Type', contentType);
    res.end(body);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: err.message || 'Proxy error' }));
  }
}
