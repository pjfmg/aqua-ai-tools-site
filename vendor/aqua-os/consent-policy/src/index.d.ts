export type ConsentPolicy = {
  schemaVersion: 1;
  id: string;
  version: number;
  retentionDays: number;
  default: "deny_optional";
  honorGlobalPrivacyControl: true;
  categories: {
    necessary: ConsentCategory & { required: true };
    analytics: ConsentCategory & { required: false };
    advertising: ConsentCategory & {
      required: false;
      personalizationDefault: false;
      requiresCertifiedTcfCmp: boolean;
    };
  };
  deployment: {
    advertisingStatus: "suspended_until_certified_cmp" | "enabled" | "disabled";
  };
};

export type ConsentCategory = {
  required: boolean;
  purposes: string[];
  vendors?: string[];
};

export type ConsentChoice = {
  schemaVersion: 1;
  policyId: string;
  policyVersion: number;
  decidedAt: string;
  revokedAt?: string | null;
  categories: {
    analytics: boolean;
    advertising: boolean;
  };
  privacySignals: {
    globalPrivacyControl: boolean;
    doNotTrack: boolean;
  };
};

export type ConsentEvaluation = {
  status: "valid" | "invalid";
  grants: {
    necessary: true;
    analytics: boolean;
    advertising: boolean;
  };
  reasons: string[];
  expiresAt: string | null;
};

export const ConsentStatus: Readonly<{
  VALID: "valid";
  INVALID: "invalid";
}>;

export const ConsentReason: Readonly<Record<string, string>>;

export function validateConsentPolicy(
  policy: ConsentPolicy,
): { id: string; version: number; retentionDays: number; categories: number };

export function evaluateConsentChoice(
  policy: ConsentPolicy,
  choice?: ConsentChoice,
  options?: { now?: Date | string },
): ConsentEvaluation;
