import {
  evaluateAdvertisingAuthorization,
} from '@aqua-os/advertising-authorization';
import {
  advertisingAuthorizationPolicy,
} from '../../vendor/aqua-os/trust-platform/policies.js';

const env = import.meta.env || {};
const READY_TCF_EVENTS = new Set(['tcloaded', 'useractioncomplete']);
const VALID_REGIONS = new Set(['eea', 'uk', 'ch', 'other', 'unknown']);

function enabled(value) {
  return String(value || '').toLowerCase() === 'true';
}

function currentRegion() {
  const region = String(env.VITE_ADVERTISING_REGION || 'unknown').toLowerCase();
  return VALID_REGIONS.has(region) ? region : 'unknown';
}

function tlsStatus(locationLike = globalThis.location) {
  const hostname = String(locationLike?.hostname || '').toLowerCase();
  const local = hostname === 'localhost'
    || hostname.endsWith('.localhost')
    || hostname === '::1'
    || /^127\.\d+\.\d+\.\d+$/.test(hostname);
  if (locationLike?.protocol === 'https:' || local) {
    return 'valid';
  }
  return locationLike?.protocol ? 'invalid' : 'unknown';
}

export function emptyTcfEvidence(configured = false) {
  return {
    configured,
    status: configured ? 'loading' : 'unknown',
    tcStringStatus: 'missing',
    eventStatus: 'unknown',
  };
}

export function evidenceFromTcfData(tcData, success = true) {
  const eventStatus = READY_TCF_EVENTS.has(tcData?.eventStatus)
    ? tcData.eventStatus
    : 'unknown';
  return {
    configured: success === true,
    status: success === true && eventStatus !== 'unknown' ? 'loaded' : 'error',
    tcStringStatus: success === true && typeof tcData?.tcString === 'string' && tcData.tcString.length > 0
      ? 'present'
      : 'missing',
    eventStatus,
  };
}

export function subscribeToTcfEvidence(onEvidence, windowLike = globalThis.window) {
  let listenerId;
  let tcfApi;
  let attempts = 0;
  let discoveryTimer;

  const attach = () => {
    tcfApi = windowLike?.__tcfapi;
    if (typeof tcfApi !== 'function') {
      attempts += 1;
      onEvidence(emptyTcfEvidence(false));
      if (attempts < 40) discoveryTimer = windowLike?.setTimeout(attach, 250);
      return;
    }

    onEvidence(emptyTcfEvidence(true));
    tcfApi('addEventListener', 2, (tcData, success) => {
      if (tcData?.listenerId !== undefined) listenerId = tcData.listenerId;
      onEvidence(evidenceFromTcfData(tcData, success));
    });
  };

  attach();

  return () => {
    if (discoveryTimer !== undefined) windowLike?.clearTimeout(discoveryTimer);
    if (listenerId !== undefined) {
      tcfApi('removeEventListener', 2, () => {}, listenerId);
    }
  };
}

function deploymentEvidence(locationLike) {
  const tcfInterlock = enabled(env.VITE_ADSENSE_TCF_READY);
  return {
    consentBootstrapEnabled: tcfInterlock,
    advertisingEnabled: tcfInterlock,
    emergencyStop: enabled(env.VITE_ADVERTISING_EMERGENCY_STOP),
    tlsStatus: tlsStatus(locationLike),
    siteApproval: enabled(env.VITE_ADSENSE_SITE_APPROVED) ? 'ready' : 'unknown',
    sellerAuthorization: enabled(env.VITE_ADS_TXT_AUTHORIZED) ? 'authorized' : 'unknown',
  };
}

function cmpEvidence(tcfEvidence) {
  return {
    configured: tcfEvidence?.configured === true,
    certified: enabled(env.VITE_CMP_CERTIFIED),
    framework: 'iab-tcf',
    version: String(env.VITE_TCF_VERSION || 'unknown'),
    status: tcfEvidence?.status || 'unknown',
  };
}

export function evaluateConsentBootstrap(tcfEvidence, options = {}) {
  return evaluateAdvertisingAuthorization(advertisingAuthorizationPolicy, {
    action: 'bootstrap-consent',
    provider: 'google-adsense',
    productId: 'aqua:ai-tools',
    surfaceId: 'website',
    region: currentRegion(),
    deployment: deploymentEvidence(options.location),
    cmp: cmpEvidence(tcfEvidence),
  }, { now: options.now });
}

export function evaluateProductAdvertising(consent, tcfEvidence, options = {}) {
  return evaluateAdvertisingAuthorization(advertisingAuthorizationPolicy, {
    action: 'request-ad',
    provider: 'google-adsense',
    productId: 'aqua:ai-tools',
    surfaceId: 'website',
    region: currentRegion(),
    mode: 'non-personalized',
    deployment: deploymentEvidence(options.location),
    cmp: cmpEvidence(tcfEvidence),
    consent: consent ? {
      ...consent,
      tcf: {
        tcStringStatus: tcfEvidence?.tcStringStatus || 'missing',
        eventStatus: tcfEvidence?.eventStatus || 'unknown',
      },
    } : undefined,
  }, { now: options.now });
}

export function createTrustDiagnostics({
  bootstrapDecision,
  advertisingDecision,
  tcfEvidence,
} = {}, now = new Date()) {
  return {
    schemaVersion: 1,
    checkedAt: (now instanceof Date ? now : new Date(now)).toISOString(),
    bootstrap: {
      decision: bootstrapDecision?.decision || 'deny',
      reasons: Array.isArray(bootstrapDecision?.reasons) ? bootstrapDecision.reasons : [],
    },
    advertising: {
      decision: advertisingDecision?.decision || 'deny',
      reasons: Array.isArray(advertisingDecision?.reasons) ? advertisingDecision.reasons : [],
    },
    tcf: {
      configured: tcfEvidence?.configured === true,
      status: tcfEvidence?.status || 'unknown',
      tcStringStatus: tcfEvidence?.tcStringStatus || 'missing',
      eventStatus: tcfEvidence?.eventStatus || 'unknown',
    },
  };
}
