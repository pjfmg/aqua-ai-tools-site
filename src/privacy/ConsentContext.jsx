import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createConsent, privacySignalEnabled, readConsent, removeTrackingCookies, writeConsent } from './consent.js';

const ConsentContext = createContext(null);
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-SRS6GQE9B7';
const CLARITY_ID = import.meta.env.VITE_CLARITY_PROJECT_ID || 'vplenoftul';
// This switch is only a deployment interlock. It may be enabled after a
// Google-certified CMP is publishing a valid IAB TCF string in production.
const ADVERTISING_TCF_READY = import.meta.env.VITE_ADSENSE_TCF_READY === 'true';

function addScript(id, src) {
  if (!src || document.getElementById(id)) return;
  const script = document.createElement('script'); script.id = id; script.async = true; script.src = src; document.head.appendChild(script);
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
  removeTrackingCookies();
  if (typeof window.clarity === 'function') window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
}

export function ConsentProvider({ children }) {
  const [consent, setConsent] = useState(() => readConsent());
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const privacySignal = useMemo(() => privacySignalEnabled(), []);
  const advertisingAvailable = ADVERTISING_TCF_READY;
  const advertisingAllowed = Boolean(advertisingAvailable && consent?.advertising && !privacySignal);

  useEffect(() => {
    updateGoogleConsent({ analytics: consent?.analytics, advertising: advertisingAllowed });
    if (consent?.analytics) enableAnalytics(); else disableAnalytics();
  }, [consent?.analytics, advertisingAllowed]);

  const save = useCallback((choices, source = 'preferences') => {
    const next = writeConsent(createConsent({ ...choices, advertising: privacySignal || !advertisingAvailable ? false : choices?.advertising, source })); setConsent(next); setPreferencesOpen(false); return next;
  }, [privacySignal, advertisingAvailable]);
  const rejectAll = useCallback(() => save({ analytics: false, advertising: false }, privacySignal ? 'privacy-signal' : 'reject-all'), [privacySignal, save]);
  const acceptAll = useCallback(() => save({ analytics: true, advertising: advertisingAvailable && !privacySignal }, privacySignal ? 'privacy-signal' : 'accept-all'), [advertisingAvailable, privacySignal, save]);
  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setPreferencesOpen(false), []);

  const value = useMemo(() => ({ consent, hasDecision: Boolean(consent), privacySignal, advertisingAvailable, advertisingAllowed, preferencesOpen, openPreferences, closePreferences, save, rejectAll, acceptAll }), [consent, privacySignal, advertisingAvailable, advertisingAllowed, preferencesOpen, openPreferences, closePreferences, save, rejectAll, acceptAll]);
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const value = useContext(ConsentContext); if (!value) throw new Error('ConsentProvider missing'); return value;
}
