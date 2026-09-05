import { readToolKey, resolveRevenuePilotRedirect } from '../revenuePilot.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.statusCode = 405; res.setHeader('Allow', 'GET'); return res.end(); }
  const result = await resolveRevenuePilotRedirect(readToolKey(req), req);
  if (!result.location) { res.statusCode = 404; res.setHeader('Cache-Control', 'no-store'); return res.end(); }
  res.statusCode = result.status;
  res.setHeader('Location', result.location);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-AQUA-Revenue-Outcome', result.outcome);
  return res.end();
}
