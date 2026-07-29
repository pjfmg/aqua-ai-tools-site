const DAY_MS = 86_400_000;

function requireValue(condition, message) {
  if (!condition) throw new TypeError(message);
}

function uniqueStrings(values) {
  return Array.isArray(values)
    && values.length > 0
    && new Set(values).size === values.length
    && values.every((value) => typeof value === "string" && value.length > 0);
}

function hasOnlyKeys(value, allowed) {
  return value
    && typeof value === "object"
    && !Array.isArray(value)
    && Object.keys(value).every((key) => allowed.has(key));
}

function parseTimestamp(value) {
  if (typeof value !== "string") return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function resolveNow(now) {
  const timestamp = now instanceof Date ? now.getTime() : Date.parse(now ?? new Date().toISOString());
  requireValue(Number.isFinite(timestamp), "Invalid consent evaluation time");
  return timestamp;
}

export const ConsentStatus = Object.freeze({
  VALID: "valid",
  INVALID: "invalid",
});

export const ConsentReason = Object.freeze({
  VALID: "consent.valid",
  MISSING: "consent.missing",
  POLICY_MISMATCH: "consent.policy-mismatch",
  TIMESTAMP_INVALID: "consent.timestamp-invalid",
  TIMESTAMP_FUTURE: "consent.timestamp-future",
  EXPIRED: "consent.expired",
  REVOKED: "consent.revoked",
  CHOICE_INVALID: "consent.choice-invalid",
  GLOBAL_PRIVACY_CONTROL: "privacy.global-privacy-control",
  DO_NOT_TRACK: "privacy.do-not-track",
});

export function validateConsentPolicy(policy) {
  requireValue(policy && typeof policy === "object", "Consent policy must be an object");
  requireValue(policy.schemaVersion === 1, "Unsupported consent policy schema");
  requireValue(/^[a-z][a-z0-9-]*$/.test(policy.id ?? ""), "Invalid consent policy id");
  requireValue(Number.isInteger(policy.version) && policy.version >= 1, "Invalid consent policy version");
  requireValue(
    Number.isInteger(policy.retentionDays)
      && policy.retentionDays >= 1
      && policy.retentionDays <= 365,
    "Invalid consent retention period",
  );
  requireValue(policy.default === "deny_optional", "Optional consent must default to deny");
  requireValue(policy.honorGlobalPrivacyControl === true, "Consent policy must honor GPC");

  const categories = policy.categories;
  requireValue(categories && typeof categories === "object", "Missing consent categories");
  requireValue(
    Object.keys(categories).sort().join(",") === "advertising,analytics,necessary",
    "Invalid consent categories",
  );
  requireValue(categories.necessary?.required === true, "Necessary category must be required");
  requireValue(categories.analytics?.required === false, "Analytics must require opt-in");
  requireValue(categories.advertising?.required === false, "Advertising must require opt-in");
  requireValue(
    categories.advertising?.personalizationDefault === false,
    "Advertising personalization must default to disabled",
  );

  for (const [categoryId, category] of Object.entries(categories)) {
    requireValue(uniqueStrings(category.purposes), `Invalid purposes for category: ${categoryId}`);
    if (category.vendors !== undefined) {
      requireValue(
        Array.isArray(category.vendors)
          && new Set(category.vendors).size === category.vendors.length
          && category.vendors.every((vendor) => typeof vendor === "string" && vendor.length > 0),
        `Invalid vendors for category: ${categoryId}`,
      );
    }
  }

  return {
    id: policy.id,
    version: policy.version,
    retentionDays: policy.retentionDays,
    categories: Object.keys(categories).length,
  };
}

export function evaluateConsentChoice(policy, choice, options = {}) {
  validateConsentPolicy(policy);

  const grants = {
    necessary: true,
    analytics: false,
    advertising: false,
  };
  const reasons = [];
  let expiresAt = null;

  if (!choice || typeof choice !== "object") {
    return {
      status: ConsentStatus.INVALID,
      grants,
      reasons: [ConsentReason.MISSING],
      expiresAt,
    };
  }

  if (choice.policyId !== policy.id || choice.policyVersion !== policy.version) {
    reasons.push(ConsentReason.POLICY_MISMATCH);
  }

  const decidedAt = parseTimestamp(choice.decidedAt);
  const now = resolveNow(options.now);
  if (decidedAt === null) {
    reasons.push(ConsentReason.TIMESTAMP_INVALID);
  } else {
    const expiryTimestamp = decidedAt + (policy.retentionDays * DAY_MS);
    expiresAt = new Date(expiryTimestamp).toISOString();
    if (decidedAt > now) reasons.push(ConsentReason.TIMESTAMP_FUTURE);
    if (now >= expiryTimestamp) reasons.push(ConsentReason.EXPIRED);
  }

  if (choice.revokedAt !== undefined && choice.revokedAt !== null) {
    if (parseTimestamp(choice.revokedAt) === null) {
      reasons.push(ConsentReason.TIMESTAMP_INVALID);
    } else {
      reasons.push(ConsentReason.REVOKED);
    }
  }

  if (
    choice.schemaVersion !== 1
    || !hasOnlyKeys(choice, new Set([
      "schemaVersion",
      "policyId",
      "policyVersion",
      "decidedAt",
      "revokedAt",
      "categories",
      "privacySignals",
    ]))
    || !hasOnlyKeys(choice.categories, new Set(["analytics", "advertising"]))
    || !hasOnlyKeys(
      choice.privacySignals,
      new Set(["globalPrivacyControl", "doNotTrack"]),
    )
    || typeof choice.categories?.analytics !== "boolean"
    || typeof choice.categories?.advertising !== "boolean"
    || typeof choice.privacySignals?.globalPrivacyControl !== "boolean"
    || typeof choice.privacySignals?.doNotTrack !== "boolean"
  ) {
    reasons.push(ConsentReason.CHOICE_INVALID);
  }

  const structurallyValid = reasons.length === 0;
  if (structurallyValid) {
    grants.analytics = choice.categories.analytics;
    grants.advertising = choice.categories.advertising;

    if (choice.privacySignals.globalPrivacyControl) {
      grants.advertising = false;
      reasons.push(ConsentReason.GLOBAL_PRIVACY_CONTROL);
    }
    if (choice.privacySignals.doNotTrack) {
      grants.advertising = false;
      reasons.push(ConsentReason.DO_NOT_TRACK);
    }
  }

  const invalidReasons = reasons.filter((reason) => (
    reason !== ConsentReason.GLOBAL_PRIVACY_CONTROL
    && reason !== ConsentReason.DO_NOT_TRACK
  ));

  return {
    status: invalidReasons.length ? ConsentStatus.INVALID : ConsentStatus.VALID,
    grants,
    reasons: reasons.length ? [...new Set(reasons)] : [ConsentReason.VALID],
    expiresAt,
  };
}
