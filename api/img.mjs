import { setTimeout as delay } from 'node:timers/promises';

function isAllowedHost(hostname) {
  const h = String(hostname || '').toLowerCase();
  if (!h) return false;
  if (h === 'logo.clearbit.com') return true;
  if (h === 'www.google.com') return true;
  if (h === 'google.com') return true;
  if (h === 'lh3.googleusercontent.com') return true;
  if (h.endsWith('.airtableusercontent.com')) return true;
  if (h === 'dl.airtable.com') return true;
  if (h.endsWith('.airtable.com')) return true;
  return false;
}

async function fetchWithTimeout(url, { timeoutMs = 8000, headers = {} } = {}) {
  const controller = new AbortController();
  const t = delay(timeoutMs).then(() => controller.abort());
  try {
    return await fetch(url, {
      headers,
      redirect: 'follow',
      signal: controller.signal,
    });
  } finally {
    t.catch(() => {});
  }
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
    const raw = url.searchParams.get('u') || url.searchParams.get('url') || '';

    if (!raw || raw.length > 1800) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Missing or invalid url' }));
      return;
    }

    let upstreamUrl;
    try {
      upstreamUrl = new URL(raw);
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Invalid url' }));
      return;
    }

    if (upstreamUrl.protocol !== 'https:') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Only https supported' }));
      return;
    }

    if (!isAllowedHost(upstreamUrl.hostname)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Host not allowed' }));
      return;
    }

    const upstream = await fetchWithTimeout(upstreamUrl.toString(), {
      timeoutMs: 9000,
      headers: {
        // Some providers behave differently without a UA.
        'User-Agent': 'AQUA-AI-Tools-ImageProxy/1.0',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    if (!upstream.ok) {
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Upstream failed', status: upstream.status }));
      return;
    }

    const contentType = upstream.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
      res.statusCode = 415;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Upstream is not an image', contentType }));
      return;
    }

    const contentLength = Number(upstream.headers.get('content-length') || 0);
    if (contentLength && contentLength > 2_500_000) {
      res.statusCode = 413;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Image too large' }));
      return;
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    if (buf.length > 2_500_000) {
      res.statusCode = 413;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Image too large' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(buf);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
  }
}

