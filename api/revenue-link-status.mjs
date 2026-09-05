import { readToolKey, revenuePilotStatus } from '../revenuePilot.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.statusCode = 405; res.setHeader('Allow', 'GET'); return res.end(); }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, max-age=60');
  return res.end(JSON.stringify(revenuePilotStatus(readToolKey(req))));
}
