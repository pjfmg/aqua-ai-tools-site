import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CONSENT_MAX_AGE_MS, CONSENT_MAX_TIMER_MS, CONSENT_STORAGE_KEY, ConsentRenewalReason, consentRefreshDelay, createConsent, evaluateConsent, privacySignalEnabled, readConsent, readConsentState, revokeConsent, writeConsent } from '../src/privacy/consent.js';
import { createTrustDiagnostics, emptyTcfEvidence, evidenceFromTcfData, evaluateProductAdvertising } from '../src/privacy/advertisingAuthorization.js';
import { advertisingAuthorizationPolicy, consentPolicy } from '../vendor/aqua-os/trust-platform/policies.js';

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
}

const storage = memoryStorage();
const now = 1_800_000_000_000;
writeConsent(createConsent({ analytics: true, advertising: false }, now), storage);
const storedConsent = readConsent(storage, now);
assert.equal(storedConsent?.categories.analytics, true);
assert.equal(storedConsent?.categories.advertising, false);
assert.equal(evaluateConsent(storedConsent, now).grants.analytics, true);
assert.ok(storage.getItem(CONSENT_STORAGE_KEY));
assert.equal(readConsent(storage, now + CONSENT_MAX_AGE_MS), null, 'consent must expire at the policy boundary');
assert.equal(readConsentState(storage, now + CONSENT_MAX_AGE_MS).renewalReason, ConsentRenewalReason.EXPIRED);
assert.equal(consentRefreshDelay(new Date(now + 1_000).toISOString(), now), 1_000);
assert.equal(consentRefreshDelay(new Date(now + CONSENT_MAX_AGE_MS).toISOString(), now), CONSENT_MAX_TIMER_MS);
assert.equal(privacySignalEnabled({ globalPrivacyControl: true }), true);
assert.equal(privacySignalEnabled({ doNotTrack: '1' }), true);
assert.equal(privacySignalEnabled({ doNotTrack: '0' }), false);
assert.equal(evaluateConsent(readConsent(storage, now), now, { globalPrivacyControl: true }).grants.advertising, false);
assert.deepEqual(evidenceFromTcfData({
  tcString: 'minimized-test-proof',
  eventStatus: 'useractioncomplete',
}, true), {
  configured: true,
  status: 'loaded',
  tcStringStatus: 'present',
  eventStatus: 'useractioncomplete',
});
const deniedAd = evaluateProductAdvertising(storedConsent, emptyTcfEvidence(false), {
  now: new Date(now).toISOString(),
  location: { protocol: 'https:', hostname: 'aqua-aitools.com' },
});
assert.equal(deniedAd.decision, 'deny');
assert.ok(deniedAd.reasons.includes('cmp.not-configured'));
assert.ok(deniedAd.reasons.includes('deployment.advertising-disabled'));
const diagnostics = createTrustDiagnostics({
  bootstrapDecision: { decision: 'deny', reasons: ['cmp.not-configured'] },
  advertisingDecision: deniedAd,
  tcfEvidence: emptyTcfEvidence(false),
}, new Date(now));
assert.equal(diagnostics.tcf.tcStringStatus, 'missing');
assert.equal(Object.hasOwn(diagnostics.tcf, 'tcString'), false);

const revokedStorage = memoryStorage();
const revocable = writeConsent(createConsent({ analytics: true, advertising: true }, now), revokedStorage);
const revoked = revokeConsent(revocable, revokedStorage, now + 1_000);
assert.ok(revoked.revokedAt);
assert.equal(readConsent(revokedStorage, now + 1_000), null);
assert.equal(readConsentState(revokedStorage, now + 1_000).renewalReason, ConsentRenewalReason.REVOKED);
assert.deepEqual(evaluateConsent(revoked, now + 1_000).grants, {
  necessary: true,
  analytics: false,
  advertising: false,
});
const renewed = writeConsent(createConsent({ analytics: false, advertising: false }, now + 2_000), revokedStorage);
assert.equal(Object.hasOwn(renewed, 'revokedAt'), false, 'renewal must be a fresh choice');
assert.equal(readConsentState(revokedStorage, now + 2_000).renewalReason, null);

const changedPolicyStorage = memoryStorage();
const incompatible = createConsent({ analytics: true }, now);
incompatible.policyVersion += 1;
changedPolicyStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(incompatible));
assert.equal(readConsent(changedPolicyStorage, now), null);
assert.equal(readConsentState(changedPolicyStorage, now).renewalReason, ConsentRenewalReason.POLICY_UPDATED);

for (const [filename, projection] of [
  ['consent-policy.json', consentPolicy],
  ['advertising-authorization-policy.json', advertisingAuthorizationPolicy],
]) {
  const canonical = JSON.parse(fs.readFileSync(`vendor/aqua-os/trust-platform/${filename}`, 'utf8'));
  delete canonical.$schema;
  assert.deepEqual(projection, canonical, `${filename} JavaScript projection must match its canonical JSON snapshot`);
}

const html = fs.readFileSync('index.html', 'utf8');
for (const tracker of ['googletagmanager.com/gtag', 'clarity.ms/tag', 'pagead2.googlesyndication.com/pagead']) {
  assert.ok(!html.includes(tracker), `index.html must not preload ${tracker}`);
}
const ads = fs.readFileSync('src/components/AdStrip.jsx', 'utf8');
assert.ok(ads.includes('advertisingAllowed'), 'AdSense must require effective advertising consent');
const context = fs.readFileSync('src/privacy/ConsentContext.jsx', 'utf8');
assert.ok(context.includes("analytics_storage: 'denied'"), 'Google consent must default to denied');
assert.ok(context.includes('evaluateProductAdvertising'), 'AdSense must use the Trust Platform decision');
assert.ok(context.includes('subscribeToTcfEvidence'), 'AdSense must require live TCF evidence');
assert.ok(context.includes("window.addEventListener('storage'"), 'Consent changes must synchronize between browser tabs');
assert.ok(context.includes('consentRefreshDelay'), 'Consent must expire while the current page remains open');
assert.ok(context.includes('recordTrustDecision'), 'Trust decisions must emit minimized audit events');
const trustAudit = fs.readFileSync('src/privacy/trustAudit.js', 'utf8');
assert.ok(trustAudit.includes("TRUST_DECISION_BROWSER_EVENT = 'aqua:trust-decision'"), 'Trust audit must expose a local browser event');
assert.ok(trustAudit.includes('createTrustDecisionEvent'), 'Trust audit must use the canonical minimization contract');
assert.ok(context.includes("removeScript('aqua-google-analytics')"), 'Withdrawal must unload product-controlled analytics scripts');
assert.ok(context.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'), 'Withdrawal must unload the AdSense script');
const manager = fs.readFileSync('src/privacy/ConsentManager.jsx', 'utf8');
assert.ok(manager.includes('withdrawConsent'), 'Privacy preferences must expose explicit withdrawal');
const authorization = fs.readFileSync('src/privacy/advertisingAuthorization.js', 'utf8');
assert.ok(authorization.includes("action: 'request-ad'"), 'Ad requests must use the request-ad action');
assert.ok(authorization.includes('VITE_ADSENSE_TCF_READY'), 'AdSense must fail closed until the certified CMP is ready');
assert.ok(authorization.includes('VITE_ADVERTISING_EMERGENCY_STOP'), 'AdSense must expose an explicit emergency stop');
const headers = fs.readFileSync('public/_headers', 'utf8');
assert.ok(headers.includes('Content-Security-Policy'));
assert.ok(headers.includes("frame-ancestors 'none'"));
console.log('Privacy smoke tests passed');
