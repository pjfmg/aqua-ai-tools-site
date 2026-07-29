const EVENT_FIELDS = Object.freeze([
  "schemaVersion",
  "event",
  "productId",
  "surfaceId",
  "policyId",
  "policyVersion",
  "action",
  "mode",
  "result",
  "reasonCodes",
  "occurredAt",
]);
const ACTIONS = new Set(["bootstrap-consent", "request-ad"]);
const RESULTS = new Set(["allow", "deny"]);
const PRODUCT_PATTERN = /^[a-z][a-z0-9:-]{2,79}$/;
const SURFACE_PATTERN = /^[a-z][a-z0-9-]{1,79}$/;
const POLICY_PATTERN = /^[a-z][a-z0-9-]{2,119}$/;
const MODE_PATTERN = /^[a-z][a-z0-9-]{1,39}$/;
const REASON_PATTERN = /^(policy|provider|cmp|tcf|consent|privacy|deployment|mode)\.[a-z0-9][a-z0-9.-]{0,95}$/;

function requireValue(condition, message) {
  if (!condition) throw new TypeError(message);
}

function requireExactKeys(value) {
  requireValue(value && typeof value === "object" && !Array.isArray(value), "Trust decision event must be an object");
  requireValue(
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...EVENT_FIELDS].sort()),
    "Invalid trust decision event fields",
  );
}

function canonicalTimestamp(value) {
  const date = value instanceof Date ? value : new Date(value);
  requireValue(Number.isFinite(date.getTime()), "Invalid trust decision timestamp");
  return date.toISOString();
}

export function validateTrustDecisionEvent(event) {
  requireExactKeys(event);
  requireValue(event.schemaVersion === 1, "Unsupported trust decision event schema");
  requireValue(event.event === "trust.decision", "Invalid trust decision event name");
  requireValue(PRODUCT_PATTERN.test(event.productId), "Invalid trust decision product");
  requireValue(SURFACE_PATTERN.test(event.surfaceId), "Invalid trust decision surface");
  requireValue(POLICY_PATTERN.test(event.policyId), "Invalid trust decision policy");
  requireValue(Number.isInteger(event.policyVersion) && event.policyVersion >= 1, "Invalid trust decision policy version");
  requireValue(ACTIONS.has(event.action), "Invalid trust decision action");
  requireValue(
    event.mode === null || (typeof event.mode === "string" && MODE_PATTERN.test(event.mode)),
    "Invalid trust decision mode",
  );
  requireValue(
    event.action === "request-ad" ? event.mode !== null : event.mode === null,
    "Trust decision mode does not match its action",
  );
  requireValue(RESULTS.has(event.result), "Invalid trust decision result");
  requireValue(
    Array.isArray(event.reasonCodes)
      && event.reasonCodes.length >= 1
      && event.reasonCodes.length <= 32
      && new Set(event.reasonCodes).size === event.reasonCodes.length
      && event.reasonCodes.every((reason) => REASON_PATTERN.test(reason)),
    "Invalid trust decision reason codes",
  );
  requireValue(canonicalTimestamp(event.occurredAt) === event.occurredAt, "Trust decision timestamp must be canonical UTC");
  return event;
}

export function createTrustDecisionEvent({
  productId,
  surfaceId,
  policyId,
  policyVersion,
  decision,
}, options = {}) {
  requireValue(decision && typeof decision === "object", "Missing trust decision");
  const event = {
    schemaVersion: 1,
    event: "trust.decision",
    productId,
    surfaceId,
    policyId,
    policyVersion,
    action: decision.action,
    mode: decision.mode ?? null,
    result: decision.decision,
    reasonCodes: Array.isArray(decision.reasons) ? [...decision.reasons] : [],
    occurredAt: canonicalTimestamp(options.now ?? new Date()),
  };
  validateTrustDecisionEvent(event);
  Object.freeze(event.reasonCodes);
  return Object.freeze(event);
}

export const TrustDecisionEventFields = EVENT_FIELDS;
