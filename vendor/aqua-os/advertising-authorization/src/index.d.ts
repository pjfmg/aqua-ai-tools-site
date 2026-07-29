export type AdvertisingAction = "bootstrap-consent" | "request-ad";
export type AdvertisingMode = "personalized" | "non-personalized" | "limited";
export type AdvertisingRegion = "eea" | "uk" | "ch" | "other" | "unknown";

export type AdvertisingAuthorizationPolicy = {
  schemaVersion: 1;
  id: string;
  version: number;
  defaultDecision: "deny";
  consentPolicy: {
    id: string;
    version: number;
    retentionDays: number;
    advertisingRequiresOptIn: true;
  };
  supportedActions: AdvertisingAction[];
  supportedModes: AdvertisingMode[];
  regions: {
    tcfRequired: Array<"eea" | "uk" | "ch">;
    unknownUses: "tcf-required";
  };
  privacySignals: {
    globalPrivacyControl: "deny-advertising";
    doNotTrack: "deny-advertising";
  };
  modes: Record<AdvertisingMode, { enabled: boolean }>;
  providers: Record<string, {
    requiresCertifiedTcfCmp: boolean;
    minimumTcfVersion: string;
    requiresSiteApproval: boolean;
    requiresAuthorizedSellerFile: boolean;
  }>;
};

export type AdvertisingAuthorizationRequest = {
  action: AdvertisingAction;
  provider: string;
  productId: string;
  surfaceId: string;
  region: AdvertisingRegion;
  mode?: AdvertisingMode;
  deployment?: {
    consentBootstrapEnabled?: boolean;
    advertisingEnabled?: boolean;
    emergencyStop?: boolean;
    tlsStatus?: "valid" | "invalid" | "unknown";
    siteApproval?: "ready" | "preparing" | "rejected" | "unknown";
    sellerAuthorization?: "authorized" | "not-found" | "unauthorized" | "unknown";
  };
  cmp?: {
    configured?: boolean;
    certified?: boolean;
    framework?: "iab-tcf";
    version?: string;
    status?: "loaded" | "loading" | "error" | "unknown";
  };
  consent?: {
    schemaVersion?: 1;
    policyId?: string;
    policyVersion?: number;
    decidedAt?: string;
    revokedAt?: string | null;
    categories?: {
      analytics?: boolean;
      advertising?: boolean;
    };
    privacySignals?: {
      globalPrivacyControl?: boolean;
      doNotTrack?: boolean;
    };
    tcf?: {
      tcStringStatus?: "present" | "missing" | "invalid";
      eventStatus?: "tcloaded" | "useractioncomplete" | "cmpuishown" | "unknown";
    };
  };
};

export type AdvertisingAuthorizationDecision = {
  decision: "allow" | "deny";
  action: AdvertisingAction;
  mode: AdvertisingMode | null;
  reasons: string[];
};

export const AdvertisingDecision: Readonly<{
  ALLOW: "allow";
  DENY: "deny";
}>;

export const AdvertisingReason: Readonly<Record<string, string>>;

export function validateAdvertisingAuthorizationPolicy(
  policy: AdvertisingAuthorizationPolicy,
): { id: string; version: number; providers: number };

export function evaluateAdvertisingAuthorization(
  policy: AdvertisingAuthorizationPolicy,
  request: AdvertisingAuthorizationRequest,
  options?: { now?: Date | string },
): AdvertisingAuthorizationDecision;
