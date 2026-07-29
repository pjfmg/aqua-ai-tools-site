import {
  createTrustDecisionEvent,
} from '@aqua-os/trust-decision-audit';
import {
  advertisingAuthorizationPolicy,
} from '../../vendor/aqua-os/trust-platform/policies.js';

export const TRUST_DECISION_BROWSER_EVENT = 'aqua:trust-decision';

export function recordTrustDecision(decision, {
  now = new Date(),
  target = globalThis.window,
} = {}) {
  const event = createTrustDecisionEvent({
    productId: 'aqua:ai-tools',
    surfaceId: 'website',
    policyId: advertisingAuthorizationPolicy.id,
    policyVersion: advertisingAuthorizationPolicy.version,
    decision,
  }, { now });

  const EventConstructor = target?.CustomEvent || globalThis.CustomEvent;
  if (typeof target?.dispatchEvent === 'function' && typeof EventConstructor === 'function') {
    target.dispatchEvent(new EventConstructor(TRUST_DECISION_BROWSER_EVENT, {
      detail: event,
    }));
  }
  return event;
}
