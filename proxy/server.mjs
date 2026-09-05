import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import v1Gateway from '../api/v1/gateway.mjs';
import toolsHandler from '../api/airtable.mjs';
import imageHandler from '../api/img.mjs';
import submitHandler from '../api/submit.mjs';
import rateHandler from '../api/rate.mjs';
import ratingsHandler from '../api/ratings.mjs';
import previewHandler from '../api/preview.mjs';
import checkoutHandler from '../api/billing/checkout.mjs';
import sessionStatusHandler from '../api/billing/session-status.mjs';
import portalHandler from '../api/billing/portal.mjs';
import subscriptionHandler from '../api/billing/subscription.mjs';
import healthHandler from '../api/health.mjs';
import newsletterHandler from '../newsletterHandler.mjs';

function loadDotEnvIfPresent() {
  try {
    const file = path.join(process.cwd(), '.env'); if (!fs.existsSync(file)) return;
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const value = line.trim(); if (!value || value.startsWith('#')) continue;
      const separator = value.indexOf('='); if (separator <= 0) continue;
      const key = value.slice(0, separator).trim(); let content = value.slice(separator + 1).trim();
      if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) content = content.slice(1, -1);
      if (!process.env[key]) process.env[key] = content;
    }
  } catch { /* optional local configuration */ }
}
loadDotEnvIfPresent();

const port = Number(process.env.PORT || 3001);
const versioned = {
  '/v1/tools': 'tools', '/v1/tool-submissions': 'tool-submissions', '/v1/site-previews': 'site-previews', '/v1/images': 'images',
  '/v1/billing/checkout-sessions': 'billing-checkout', '/v1/billing/checkout-sessions/status': 'billing-status',
  '/v1/entitlements/me': 'entitlements', '/v1/billing/portal-sessions': 'billing-portal',
  '/v1/newsletter-subscriptions': 'newsletter-subscriptions',
  '/v1/revenue-link-status': 'revenue-link-status', '/v1/revenue-link-redirect': 'revenue-link-redirect',
};
const legacy = {
  '/airtable': toolsHandler, '/img': imageHandler, '/submit': submitHandler, '/rate': rateHandler, '/ratings': ratingsHandler,
  '/preview': previewHandler, '/billing/checkout': checkoutHandler, '/billing/session-status': sessionStatusHandler,
  '/billing/portal': portalHandler, '/billing/subscription': subscriptionHandler,
};

function sendJson(res, status, body) {
  res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Trace-Id');
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }

    if (pathname === '/v1/health/live' || pathname === '/v1/health/ready') {
      req.query = { mode: pathname.endsWith('/ready') ? 'ready' : 'live' };
      return await healthHandler(req, res);
    }

    let operation = versioned[pathname];
    if (pathname === '/v1/tool-ratings') operation = req.method === 'POST' ? 'tool-ratings-write' : 'tool-ratings-read';
    if (operation) {
      req.query = Object.fromEntries(url.searchParams.entries()); req.query.operation = operation;
      return await v1Gateway(req, res);
    }
    const handler = legacy[pathname];
    if (handler) return await handler(req, res);
    return sendJson(res, 404, { error: 'Not Found' });
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', event: 'proxy.request.failed', code: 'UNHANDLED_PROXY_ERROR' }));
    return sendJson(res, 500, { error: 'INTERNAL_ERROR' });
  }
});

server.listen(port, '127.0.0.1', () => console.log(`AQUA API proxy listening on http://127.0.0.1:${port}/v1`));
