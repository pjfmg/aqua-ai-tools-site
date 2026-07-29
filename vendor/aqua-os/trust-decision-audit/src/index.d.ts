export type TrustDecisionAction = "bootstrap-consent" | "request-ad";
export type TrustDecisionResult = "allow" | "deny";

export type TrustDecisionEvent = {
  schemaVersion: 1;
  event: "trust.decision";
  productId: string;
  surfaceId: string;
  policyId: string;
  policyVersion: number;
  action: TrustDecisionAction;
  mode: string | null;
  result: TrustDecisionResult;
  reasonCodes: string[];
  occurredAt: string;
};

export type TrustDecision = {
  action: TrustDecisionAction;
  mode: string | null;
  decision: TrustDecisionResult;
  reasons: string[];
};

export const TrustDecisionEventFields: readonly string[];

export function validateTrustDecisionEvent(event: TrustDecisionEvent): TrustDecisionEvent;

export function createTrustDecisionEvent(
  input: {
    productId: string;
    surfaceId: string;
    policyId: string;
    policyVersion: number;
    decision: TrustDecision;
  },
  options?: { now?: Date | string },
): Readonly<TrustDecisionEvent>;
