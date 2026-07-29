import { ConsentReason, evaluateConsentChoice } from '@aqua-os/consent-policy';
import { consentPolicy } from '../../vendor/aqua-os/trust-platform/policies.js';

export const CONSENT_VERSION = consentPolicy.version;
export const CONSENT_STORAGE_KEY = 'aqua_consent_v1';
export const CONSENT_MAX_AGE_MS = consentPolicy.retentionDays * 24 * 60 * 60 * 1000;
export const CONSENT_MAX_TIMER_MS = 2_147_000_000;
export const ConsentRenewalReason = Object.freeze({
  MISSING: 'missing',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
  POLICY_UPDATED: 'policy-updated',
  INVALID: 'invalid',
});

export function readPrivacySignals(navigatorLike = globalThis.navigator) {
  return {
    globalPrivacyControl: navigatorLike?.globalPrivacyControl === true,
    doNotTrack: String(navigatorLike?.doNotTrack || globalThis.doNotTrack || '') === '1',
  };
}

export function privacySignalEnabled(navigatorLike = globalThis.navigator) {
  const signals = readPrivacySignals(navigatorLike);
  return signals.globalPrivacyControl || signals.doNotTrack;
}

export function evaluateConsent(value, now = Date.now(), navigatorLike = globalThis.navigator) {
  const choice = value && typeof value === 'object'
    ? { ...value, privacySignals: readPrivacySignals(navigatorLike) }
    : value;
  return evaluateConsentChoice(consentPolicy, choice, {
    now: new Date(now).toISOString(),
  });
}

export function normalizeConsent(value, now = Date.now(), navigatorLike = globalThis.navigator) {
  const result = evaluateConsent(value, now, navigatorLike);
  if (result.status !== 'valid') return null;
  return { ...value, privacySignals: readPrivacySignals(navigatorLike) };
}

function renewalReason(evaluation) {
  if (evaluation.reasons.includes(ConsentReason.REVOKED)) return ConsentRenewalReason.REVOKED;
  if (evaluation.reasons.includes(ConsentReason.EXPIRED)) return ConsentRenewalReason.EXPIRED;
  if (evaluation.reasons.includes(ConsentReason.POLICY_MISMATCH)) return ConsentRenewalReason.POLICY_UPDATED;
  if (evaluation.reasons.includes(ConsentReason.MISSING)) return ConsentRenewalReason.MISSING;
  return ConsentRenewalReason.INVALID;
}

export function readConsentState(storage = globalThis.localStorage, now = Date.now(), navigatorLike = globalThis.navigator) {
  let stored = null;
  try {
    stored = JSON.parse(storage?.getItem(CONSENT_STORAGE_KEY) || 'null');
  } catch {
    const evaluation = evaluateConsent(null, now, navigatorLike);
    return {
      choice: null,
      evaluation,
      renewalReason: ConsentRenewalReason.INVALID,
    };
  }

  const evaluation = evaluateConsent(stored, now, navigatorLike);
  if (evaluation.status !== 'valid') {
    return {
      choice: null,
      evaluation,
      renewalReason: renewalReason(evaluation),
    };
  }
  return {
    choice: { ...stored, privacySignals: readPrivacySignals(navigatorLike) },
    evaluation,
    renewalReason: null,
  };
}

export function readConsent(storage = globalThis.localStorage, now = Date.now(), navigatorLike = globalThis.navigator) {
  return readConsentState(storage, now, navigatorLike).choice;
}

export function createConsent({ analytics = false, advertising = false } = {}, now = Date.now(), navigatorLike = globalThis.navigator) {
  return {
    schemaVersion: 1,
    policyId: consentPolicy.id,
    policyVersion: consentPolicy.version,
    decidedAt: new Date(now).toISOString(),
    categories: {
      analytics: analytics === true,
      advertising: advertising === true,
    },
    privacySignals: readPrivacySignals(navigatorLike),
  };
}

export function writeConsent(consent, storage = globalThis.localStorage, navigatorLike = globalThis.navigator) {
  const decidedAt = Date.parse(consent?.decidedAt);
  const normalized = normalizeConsent(consent, decidedAt, navigatorLike);
  if (!normalized) throw new Error('INVALID_CONSENT');
  storage?.setItem(CONSENT_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function revokeConsent(consent, storage = globalThis.localStorage, now = Date.now(), navigatorLike = globalThis.navigator) {
  const normalized = normalizeConsent(consent, now, navigatorLike);
  if (!normalized) throw new Error('INVALID_CONSENT');
  const revoked = {
    ...normalized,
    revokedAt: new Date(now).toISOString(),
  };
  storage?.setItem(CONSENT_STORAGE_KEY, JSON.stringify(revoked));
  return revoked;
}

export function consentRefreshDelay(expiresAt, now = Date.now()) {
  const expiry = Date.parse(expiresAt);
  if (!Number.isFinite(expiry)) return null;
  return Math.max(0, Math.min(expiry - now, CONSENT_MAX_TIMER_MS));
}

export function removeTrackingCookies(documentLike = globalThis.document) {
  if (!documentLike?.cookie) return;
  for (const item of documentLike.cookie.split(';')) {
    const name = item.split('=')[0]?.trim();
    if (!name || !/^(_ga|_gid|_gat|_clck|_clsk)/.test(name)) continue;
    documentLike.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  }
}
