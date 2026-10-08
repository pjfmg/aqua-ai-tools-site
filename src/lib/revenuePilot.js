import { fetchWithTimeout } from './http.js';

const statusCache = new Map();
const CACHE_TTL_MS = 60_000;

export async function loadRevenuePilotStatus(toolKey) {
  const key = String(toolKey || '').trim();
  if (!key) return { commercial: false, pilotActive: false, disclosureRequired: false };

  const cached = statusCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const url = new URL('/v1/revenue-link-status', window.location.origin);
  url.searchParams.set('toolKey', key);
  const response = await fetchWithTimeout(url.toString(), { credentials: 'same-origin', cache: 'no-store' }, 3000);
  if (!response.ok) throw new Error(`REVENUE_STATUS_${response.status}`);
  const payload = await response.json();
  const data = payload?.data ?? payload;
  const value = {
    commercial: data?.commercial === true,
    pilotActive: data?.pilotActive === true,
    disclosureRequired: data?.disclosureRequired === true,
  };
  statusCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

export function getRevenuePilotRedirectUrl(toolKey) {
  const url = new URL('/v1/revenue-link-redirect', window.location.origin);
  url.searchParams.set('toolKey', String(toolKey || ''));
  return `${url.pathname}${url.search}`;
}
