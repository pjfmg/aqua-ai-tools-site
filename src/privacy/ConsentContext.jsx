import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CONSENT_STORAGE_KEY, consentRefreshDelay, createConsent, evaluateConsent, privacySignalEnabled, readConsentState, removeTrackingCookies, revokeConsent, writeConsent } from './consent.js';
import { createTrustDiagnostics, emptyTcfEvidence, evaluateConsentBootstrap, evaluateProductAdvertising, subscribeToTcfEvidence } from './advertisingAuthorization.js';
import { bootstrapCmp } from './cmpBootstrap.js';
import { recordTrustDecision } from './trustAudit.js';

const ConsentContext = createContext(null);
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-SRS6GQE9B7';
const CLARITY_ID = import.meta.env.VITE_CLARITY_PROJECT_ID || 'vplenoftul';

function addScript(id, src) {
  if (!src || document.getElementById(id)) return;
  const script = document.createElement('script'); script.id = id; script.async = true; script.src = src; document.head.appendChild(script);
}

function removeScript(id) {
  document.getElementById(id)?.remove();
}

function updateGoogleConsent({ analytics = false, advertising = false } = {}) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  if (!window.__aquaConsentDefault) {
    window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', wait_for_update: 500 });
    window.__aquaConsentDefault = true;
  }
  window.gtag('consent', 'update', { analytics_storage: analytics ? 'granted' : 'denied', ad_storage: advertising ? 'granted' : 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
}

function enableAnalytics() {
  addScript('aqua-google-analytics', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`);
  window.gtag('js', new Date()); window.gtag('config', GA_ID, { anonymize_ip: true, allow_google_signals: false });
  if (CLARITY_ID && !document.getElementById('aqua-clarity')) {
    window.clarity = window.clarity || function clarity() { (window.clarity.q = window.clarity.q || []).push(arguments); };
    addScript('aqua-clarity', `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_ID)}`);
  }
}

function disableAnalytics() {
  removeScript('aqua-google-analytics');
  removeScript('aqua-clarity');
  removeTrackingCookies();
  if (typeof window.clarity === 'function') window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
}

function disableAdvertising() {
  for (const script of document.querySelectorAll('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
    script.remove();
  }
}

export function ConsentProvider({ children }) {
  const auditedDecisions = useRef(new Map());
  const [storedConsent, setStoredConsent] = useState(() => readConsentState());
  const [tcfEvidence, setTcfEvidence] = useState(() => emptyTcfEvidence(false));
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const consentChoice = storedConsent.choice;
  const privacySignal = useMemo(() => privacySignalEnabled(), []);
  const consentEvaluation = useMemo(() => evaluateConsent(consentChoice), [consentChoice, privacySignal]);
  const consent = useMemo(() => consentChoice ? ({
    ...consentChoice,
    analytics: consentEvaluation.grants.analytics,
    advertising: consentEvaluation.grants.advertising,
  }) : null, [consentChoice, consentEvaluation]);
  const bootstrapDecision = useMemo(() => evaluateConsentBootstrap(tcfEvidence), [tcfEvidence]);
  const advertisingDecision = useMemo(
    () => evaluateProductAdvertising(consentChoice, tcfEvidence),
    [consentChoice, tcfEvidence],
  );
  const advertisingAvailable = bootstrapDecision.decision === 'allow';
  const advertisingAllowed = advertisingDecision.decision === 'allow';
  const analyticsAllowed = consentEvaluation.status === 'valid' && consentEvaluation.grants.analytics;

  useEffect(() => {
    bootstrapCmp();
  }, []);

  useEffect(() => subscribeToTcfEvidence(setTcfEvidence), []);

  const refreshConsent = useCallback(() => {
    setStoredConsent(readConsentState());
  }, []);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === CONSENT_STORAGE_KEY || event.key === null) refreshConsent();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshConsent]);

  useEffect(() => {
    if (consentEvaluation.status !== 'valid' || !consentEvaluation.expiresAt) return undefined;
    const delay = consentRefreshDelay(consentEvaluation.expiresAt);
    if (delay === null) return undefined;
    const timer = window.setTimeout(refreshConsent, delay);
    return () => window.clearTimeout(timer);
  }, [consentChoice, consentEvaluation.status, consentEvaluation.expiresAt, refreshConsent]);

  useEffect(() => {
    window.__aquaTrustDiagnostics = createTrustDiagnostics({
      bootstrapDecision,
      advertisingDecision,
      tcfEvidence,
    });
  }, [bootstrapDecision, advertisingDecision, tcfEvidence]);

  useEffect(() => {
    for (const decision of [bootstrapDecision, advertisingDecision]) {
      const fingerprint = JSON.stringify([
        decision.action,
        decision.mode,
        decision.decision,
        decision.reasons,
      ]);
      if (auditedDecisions.current.get(decision.action) === fingerprint) continue;
      auditedDecisions.current.set(decision.action, fingerprint);
      recordTrustDecision(decision);
    }
  }, [bootstrapDecision, advertisingDecision]);

  useEffect(() => {
    updateGoogleConsent({ analytics: analyticsAllowed, advertising: advertisingAllowed });
    if (analyticsAllowed) enableAnalytics(); else disableAnalytics();
    if (!advertisingAllowed) disableAdvertising();
  }, [analyticsAllowed, advertisingAllowed]);

  const save = useCallback((choices) => {
    const next = writeConsent(createConsent({
      ...choices,
      advertising: privacySignal || !advertisingAvailable ? false : choices?.advertising,
    }));
    setStoredConsent({
      choice: next,
      evaluation: evaluateConsent(next),
      renewalReason: null,
    });
    setPreferencesOpen(false);
    return next;
  }, [privacySignal, advertisingAvailable]);
  const withdrawConsent = useCallback(() => {
    if (!consentChoice) return null;
    const revoked = revokeConsent(consentChoice);
    setStoredConsent(readConsentState());
    setPreferencesOpen(false);
    return revoked;
  }, [consentChoice]);
  const rejectAll = useCallback(() => save({ analytics: false, advertising: false }), [save]);
  const acceptAll = useCallback(() => save({ analytics: true, advertising: advertisingAvailable && !privacySignal }), [advertisingAvailable, privacySignal, save]);
  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setPreferencesOpen(false), []);

  const value = useMemo(() => ({
    consent,
    hasDecision: consentEvaluation.status === 'valid',
    renewalReason: storedConsent.renewalReason,
    privacySignal,
    advertisingAvailable,
    advertisingAllowed,
    advertisingDecision,
    preferencesOpen,
    openPreferences,
    closePreferences,
    save,
    rejectAll,
    acceptAll,
    withdrawConsent,
  }), [consent, consentEvaluation.status, storedConsent.renewalReason, privacySignal, advertisingAvailable, advertisingAllowed, advertisingDecision, preferencesOpen, openPreferences, closePreferences, save, rejectAll, acceptAll, withdrawConsent]);
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const value = useContext(ConsentContext); if (!value) throw new Error('ConsentProvider missing'); return value;
}
