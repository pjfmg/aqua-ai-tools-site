export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = 'aqua_consent_v1';
export const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

export function privacySignalEnabled(navigatorLike = globalThis.navigator) {
  return navigatorLike?.globalPrivacyControl === true || String(navigatorLike?.doNotTrack || globalThis.doNotTrack || '') === '1';
}

export function normalizeConsent(value, now = Date.now()) {
  if (!value || value.version !== CONSENT_VERSION || !Number.isFinite(Number(value.updatedAt))) return null;
  if (now - Number(value.updatedAt) > CONSENT_MAX_AGE_MS) return null;
  return {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: value.analytics === true,
    advertising: value.advertising === true,
    updatedAt: Number(value.updatedAt),
    source: String(value.source || 'preferences'),
  };
}

export function readConsent(storage = globalThis.localStorage, now = Date.now()) {
  try { return normalizeConsent(JSON.parse(storage?.getItem(CONSENT_STORAGE_KEY) || 'null'), now); } catch { return null; }
}

export function createConsent({ analytics = false, advertising = false, source = 'preferences' } = {}, now = Date.now()) {
  return { version: CONSENT_VERSION, necessary: true, analytics: analytics === true, advertising: advertising === true, updatedAt: now, source };
}

export function writeConsent(consent, storage = globalThis.localStorage) {
  const normalized = normalizeConsent(consent, Number(consent?.updatedAt));
  if (!normalized) throw new Error('INVALID_CONSENT');
  storage?.setItem(CONSENT_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function removeTrackingCookies(documentLike = globalThis.document) {
  if (!documentLike?.cookie) return;
  for (const item of documentLike.cookie.split(';')) {
    const name = item.split('=')[0]?.trim();
    if (!name || !/^(_ga|_gid|_gat|_clck|_clsk)/.test(name)) continue;
    documentLike.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
}
