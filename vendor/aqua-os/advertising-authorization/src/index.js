const ACTIONS = new Set(["bootstrap-consent", "request-ad"]);
const MODES = new Set(["personalized", "non-personalized", "limited"]);
const REGIONS = new Set(["eea", "uk", "ch", "other", "unknown"]);
const TCF_READY_EVENTS = new Set(["tcloaded", "useractioncomplete"]);
const DAY_MS = 86_400_000;

function requireValue(condition, message) {
  if (!condition) throw new TypeError(message);
}

export const AdvertisingDecision = Object.freeze({
  ALLOW: "allow",
  DENY: "deny",
});

export const AdvertisingReason = Object.freeze({
  ALLOWED: "policy.allowed",
  DEFAULT_DENY: "policy.default-deny",
  UNKNOWN_PROVIDER: "provider.unknown",
  BOOTSTRAP_DISABLED: "cmp.bootstrap-disabled",
  CMP_NOT_CONFIGURED: "cmp.not-configured",
  CMP_NOT_CERTIFIED: "cmp.not-certified",
  CMP_NOT_LOADED: "cmp.not-loaded",
  TCF_FRAMEWORK_INVALID: "tcf.framework-invalid",
  TCF_VERSION_UNSUPPORTED: "tcf.version-unsupported",
  TCF_PROOF_MISSING: "tcf.proof-missing",
  POLICY_MISMATCH: "consent.policy-mismatch",
  CONSENT_MISSING: "consent.advertising-not-granted",
  CONSENT_EVIDENCE_INVALID: "consent.evidence-invalid",
  CONSENT_TIMESTAMP_INVALID: "consent.timestamp-invalid",
  CONSENT_TIMESTAMP_FUTURE: "consent.timestamp-future",
  CONSENT_EXPIRED: "consent.expired",
  CONSENT_REVOKED: "consent.revoked",
  PRIVACY_SIGNAL: "privacy.signal-active",
  ADVERTISING_DISABLED: "deployment.advertising-disabled",
  EMERGENCY_STOP: "deployment.emergency-stop",
  TLS_INVALID: "deployment.tls-invalid",
  SITE_NOT_READY: "provider.site-not-ready",
  SELLER_NOT_AUTHORIZED: "provider.seller-not-authorized",
  MODE_DISABLED: "mode.disabled",
});

export function validateAdvertisingAuthorizationPolicy(policy) {
  requireValue(policy && typeof policy === "object", "Advertising policy must be an object");
  requireValue(policy.schemaVersion === 1, "Unsupported advertising policy schema");
  requireValue(policy.defaultDecision === "deny", "Advertising policy must be default-deny");
  requireValue(policy.consentPolicy?.advertisingRequiresOptIn === true, "Advertising must require opt-in");
  requireValue(
    Number.isInteger(policy.consentPolicy?.retentionDays)
      && policy.consentPolicy.retentionDays >= 1
      && policy.consentPolicy.retentionDays <= 365,
    "Invalid consent retention period",
  );
  requireValue(
    policy.supportedActions?.length === ACTIONS.size
      && policy.supportedActions.every((action) => ACTIONS.has(action)),
    "Invalid advertising actions",
  );
  requireValue(
    policy.supportedModes?.length === MODES.size
      && policy.supportedModes.every((mode) => MODES.has(mode)),
    "Invalid advertising modes",
  );
  requireValue(policy.regions?.unknownUses === "tcf-required", "Unknown regions must use TCF rules");
  requireValue(
    ["eea", "uk", "ch"].every((region) => policy.regions.tcfRequired?.includes(region)),
    "Missing mandatory TCF region",
  );
  requireValue(policy.privacySignals?.globalPrivacyControl === "deny-advertising", "GPC must deny advertising");
  requireValue(policy.privacySignals?.doNotTrack === "deny-advertising", "DNT must deny advertising");
  requireValue(policy.modes?.personalized?.enabled === false, "Personalized ads must default to disabled");
  requireValue(policy.modes?.["non-personalized"]?.enabled === true, "Non-personalized ads must be the only enabled mode");
  requireValue(policy.modes?.limited?.enabled === false, "Limited ads require explicit policy review");
  requireValue(policy.providers && Object.keys(policy.providers).length > 0, "Missing advertising providers");
  for (const [providerId, provider] of Object.entries(policy.providers)) {
    requireValue(
      /^\d+\.\d+$/.test(provider.minimumTcfVersion ?? ""),
      `Invalid minimum TCF version: ${providerId}`,
    );
  }

  return {
    id: policy.id,
    version: policy.version,
    providers: Object.keys(policy.providers).length,
  };
}

function tcfRequired(policy, region) {
  return region === "unknown" || policy.regions.tcfRequired.includes(region);
}

function versionAtLeast(actual, minimum) {
  const actualParts = String(actual ?? "").split(".").map(Number);
  const minimumParts = String(minimum ?? "").split(".").map(Number);
  if (
    actualParts.some(Number.isNaN)
    || minimumParts.some(Number.isNaN)
    || actualParts.length < 2
    || minimumParts.length < 2
  ) {
    return false;
  }
  return actualParts[0] > minimumParts[0]
    || (actualParts[0] === minimumParts[0] && actualParts[1] >= minimumParts[1]);
}

function parseTimestamp(value) {
  if (typeof value !== "string") return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function resolveNow(now) {
  const timestamp = now instanceof Date ? now.getTime() : Date.parse(now ?? new Date().toISOString());
  requireValue(Number.isFinite(timestamp), "Invalid advertising evaluation time");
  return timestamp;
}

function decision(action, mode, reasons) {
  const uniqueReasons = [...new Set(reasons)];
  return {
    decision: uniqueReasons.length ? AdvertisingDecision.DENY : AdvertisingDecision.ALLOW,
    action,
    mode: action === "request-ad" ? mode : null,
    reasons: uniqueReasons.length ? uniqueReasons : [AdvertisingReason.ALLOWED],
  };
}

export function evaluateAdvertisingAuthorization(policy, request, options = {}) {
  validateAdvertisingAuthorizationPolicy(policy);
  requireValue(request && typeof request === "object", "Advertising request must be an object");
  requireValue(ACTIONS.has(request.action), `Unsupported advertising action: ${request.action}`);
  requireValue(REGIONS.has(request.region), `Unsupported advertising region: ${request.region}`);

  const provider = policy.providers[request.provider];
  const reasons = [];

  if (!provider) {
    return decision(request.action, request.mode, [AdvertisingReason.UNKNOWN_PROVIDER]);
  }

  const requiresTcf = tcfRequired(policy, request.region);
  const cmp = request.cmp ?? {};
  const deployment = request.deployment ?? {};

  if (request.action === "bootstrap-consent") {
    if (deployment.consentBootstrapEnabled !== true) reasons.push(AdvertisingReason.BOOTSTRAP_DISABLED);
    if (deployment.tlsStatus !== "valid") reasons.push(AdvertisingReason.TLS_INVALID);
    if (cmp.configured !== true) reasons.push(AdvertisingReason.CMP_NOT_CONFIGURED);
    if (requiresTcf && provider.requiresCertifiedTcfCmp && cmp.certified !== true) {
      reasons.push(AdvertisingReason.CMP_NOT_CERTIFIED);
    }
    if (requiresTcf && cmp.framework !== "iab-tcf") {
      reasons.push(AdvertisingReason.TCF_FRAMEWORK_INVALID);
    }
    if (requiresTcf && !versionAtLeast(cmp.version, provider.minimumTcfVersion)) {
      reasons.push(AdvertisingReason.TCF_VERSION_UNSUPPORTED);
    }
    return decision(request.action, null, reasons);
  }

  requireValue(MODES.has(request.mode), `Unsupported advertising mode: ${request.mode}`);

  if (deployment.advertisingEnabled !== true) reasons.push(AdvertisingReason.ADVERTISING_DISABLED);
  if (deployment.emergencyStop === true) reasons.push(AdvertisingReason.EMERGENCY_STOP);
  if (deployment.tlsStatus !== "valid") reasons.push(AdvertisingReason.TLS_INVALID);
  if (provider.requiresSiteApproval && deployment.siteApproval !== "ready") {
    reasons.push(AdvertisingReason.SITE_NOT_READY);
  }
  if (provider.requiresAuthorizedSellerFile && deployment.sellerAuthorization !== "authorized") {
    reasons.push(AdvertisingReason.SELLER_NOT_AUTHORIZED);
  }
  if (policy.modes[request.mode]?.enabled !== true) reasons.push(AdvertisingReason.MODE_DISABLED);

  const consent = request.consent ?? {};
  if (
    consent.policyId !== policy.consentPolicy.id
    || consent.policyVersion !== policy.consentPolicy.version
  ) {
    reasons.push(AdvertisingReason.POLICY_MISMATCH);
  }
  if (
    consent.schemaVersion !== 1
    || typeof consent.categories?.advertising !== "boolean"
    || typeof consent.privacySignals?.globalPrivacyControl !== "boolean"
    || typeof consent.privacySignals?.doNotTrack !== "boolean"
  ) {
    reasons.push(AdvertisingReason.CONSENT_EVIDENCE_INVALID);
  }
  if (consent.categories?.advertising !== true) reasons.push(AdvertisingReason.CONSENT_MISSING);
  if (
    consent.privacySignals?.globalPrivacyControl === true
    || consent.privacySignals?.doNotTrack === true
  ) {
    reasons.push(AdvertisingReason.PRIVACY_SIGNAL);
  }

  const decidedAt = parseTimestamp(consent.decidedAt);
  const now = resolveNow(options.now);
  if (decidedAt === null) {
    reasons.push(AdvertisingReason.CONSENT_TIMESTAMP_INVALID);
  } else {
    if (decidedAt > now) reasons.push(AdvertisingReason.CONSENT_TIMESTAMP_FUTURE);
    if (now >= decidedAt + (policy.consentPolicy.retentionDays * DAY_MS)) {
      reasons.push(AdvertisingReason.CONSENT_EXPIRED);
    }
  }
  if (consent.revokedAt !== undefined && consent.revokedAt !== null) {
    if (parseTimestamp(consent.revokedAt) === null) {
      reasons.push(AdvertisingReason.CONSENT_TIMESTAMP_INVALID);
    } else {
      reasons.push(AdvertisingReason.CONSENT_REVOKED);
    }
  }

  if (requiresTcf) {
    if (cmp.configured !== true) reasons.push(AdvertisingReason.CMP_NOT_CONFIGURED);
    if (provider.requiresCertifiedTcfCmp && cmp.certified !== true) {
      reasons.push(AdvertisingReason.CMP_NOT_CERTIFIED);
    }
    if (cmp.framework !== "iab-tcf") {
      reasons.push(AdvertisingReason.TCF_FRAMEWORK_INVALID);
    }
    if (!versionAtLeast(cmp.version, provider.minimumTcfVersion)) {
      reasons.push(AdvertisingReason.TCF_VERSION_UNSUPPORTED);
    }
    if (cmp.status !== "loaded") reasons.push(AdvertisingReason.CMP_NOT_LOADED);
    if (
      consent.tcf?.tcStringStatus !== "present"
      || !TCF_READY_EVENTS.has(consent.tcf?.eventStatus)
    ) {
      reasons.push(AdvertisingReason.TCF_PROOF_MISSING);
    }
  }

  return decision(request.action, request.mode, reasons);
}
