import { healthEnvelope, healthSnapshot } from '../operations.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405; res.setHeader('Allow', 'GET'); return res.end();
  }
  const mode = String(req.query?.mode || 'live') === 'ready' ? 'ready' : 'live';
  const snapshot = await healthSnapshot(req, mode);
  res.statusCode = snapshot.status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Trace-Id', snapshot.traceId);
  res.end(JSON.stringify(healthEnvelope(snapshot)));
}
