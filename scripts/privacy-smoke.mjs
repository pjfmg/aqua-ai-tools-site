import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CONSENT_MAX_AGE_MS, CONSENT_STORAGE_KEY, createConsent, privacySignalEnabled, readConsent, writeConsent } from '../src/privacy/consent.js';

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
}

const storage = memoryStorage();
const now = 1_800_000_000_000;
writeConsent(createConsent({ analytics: true, advertising: false }, now), storage);
assert.equal(readConsent(storage, now)?.analytics, true);
assert.equal(readConsent(storage, now)?.advertising, false);
assert.ok(storage.getItem(CONSENT_STORAGE_KEY));
assert.equal(readConsent(storage, now + CONSENT_MAX_AGE_MS + 1), null, 'consent must expire');
assert.equal(privacySignalEnabled({ globalPrivacyControl: true }), true);
assert.equal(privacySignalEnabled({ doNotTrack: '1' }), true);
assert.equal(privacySignalEnabled({ doNotTrack: '0' }), false);

const html = fs.readFileSync('index.html', 'utf8');
for (const tracker of ['googletagmanager.com/gtag', 'clarity.ms/tag', 'pagead2.googlesyndication.com/pagead']) {
  assert.ok(!html.includes(tracker), `index.html must not preload ${tracker}`);
}
const ads = fs.readFileSync('src/components/AdStrip.jsx', 'utf8');
assert.ok(ads.includes('advertisingAllowed'), 'AdSense must require effective advertising consent');
const context = fs.readFileSync('src/privacy/ConsentContext.jsx', 'utf8');
assert.ok(context.includes("analytics_storage: 'denied'"), 'Google consent must default to denied');
assert.ok(context.includes("VITE_ADSENSE_TCF_READY !== 'false'"), 'AdSense must expose an explicit emergency kill switch');
assert.ok(context.includes('privacySignal || !advertisingAvailable'), 'GPC and missing CMP must force advertising off');
const headers = fs.readFileSync('public/_headers', 'utf8');
assert.ok(headers.includes('Content-Security-Policy'));
assert.ok(headers.includes("frame-ancestors 'none'"));
console.log('Privacy smoke tests passed');
