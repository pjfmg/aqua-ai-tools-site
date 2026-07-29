import assert from 'node:assert/strict';
import { evaluateDefaultDenyBrowserEvidence } from './trust-default-deny-canary.mjs';

const zero = { analytics: 0, advertising: 0, cmp: 0 };
const analyticsOnly = { analytics: 2, advertising: 0, cmp: 0 };
const evidence = {
  handling: {
    thirdPartyRequestsIntercepted: true,
    rawTcfStringStored: false,
    personalDataStored: false,
  },
  browserEvidence: {
    adScriptsBeforeChoice: 0,
    analyticsScriptsBeforeChoice: 0,
  },
  scenarios: {
    firstVisit: {
      bannerVisible: true,
      providerRequests: zero,
      providerScripts: zero,
      advertisingDecision: 'deny',
    },
    rejectOptional: {
      categories: { analytics: false, advertising: false },
      providerScripts: zero,
    },
    acceptAllSafePreview: {
      categories: { analytics: true, advertising: false },
      providerScripts: analyticsOnly,
    },
    withdrawal: { revokedAtStatus: 'present', providerScripts: zero },
    expiredChoice: { renewalPromptVisible: true, providerScripts: zero },
    policyChange: { renewalPromptVisible: true, providerScripts: zero },
    gpc: {
      categories: { analytics: true, advertising: false },
      providerScripts: analyticsOnly,
      advertisingDecision: 'deny',
      privacySignalReasonObserved: true,
    },
    dnt: {
      categories: { analytics: true, advertising: false },
      providerScripts: analyticsOnly,
      advertisingDecision: 'deny',
      privacySignalReasonObserved: true,
    },
  },
};

assert.deepEqual(evaluateDefaultDenyBrowserEvidence(evidence), []);
const unsafe = structuredClone(evidence);
unsafe.scenarios.acceptAllSafePreview.providerScripts.advertising = 1;
assert.ok(evaluateDefaultDenyBrowserEvidence(unsafe).includes(
  'advertising script loaded in safe Preview',
));
console.log('Trust default-deny canary smoke tests passed');
