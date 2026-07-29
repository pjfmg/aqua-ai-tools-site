export const consentPolicy = Object.freeze({
  schemaVersion: 1,
  id: "aqua-web-consent-v1",
  version: 1,
  retentionDays: 180,
  default: "deny_optional",
  honorGlobalPrivacyControl: true,
  categories: {
    necessary: {
      required: true,
      purposes: ["authentication", "security", "preferences"],
    },
    analytics: {
      required: false,
      purposes: ["audience-measurement", "product-improvement"],
      vendors: ["Google Analytics", "Microsoft Clarity"],
    },
    advertising: {
      required: false,
      purposes: ["non-personalized-advertising"],
      vendors: ["Google AdSense"],
      personalizationDefault: false,
      requiresCertifiedTcfCmp: true,
    },
  },
  deployment: {
    advertisingStatus: "suspended_until_certified_cmp",
  },
});

export const advertisingAuthorizationPolicy = Object.freeze({
  schemaVersion: 1,
  id: "aqua-advertising-authorization-v1",
  version: 1,
  defaultDecision: "deny",
  consentPolicy: {
    id: "aqua-web-consent-v1",
    version: 1,
    retentionDays: 180,
    advertisingRequiresOptIn: true,
  },
  supportedActions: ["bootstrap-consent", "request-ad"],
  supportedModes: ["personalized", "non-personalized", "limited"],
  regions: {
    tcfRequired: ["eea", "uk", "ch"],
    unknownUses: "tcf-required",
  },
  privacySignals: {
    globalPrivacyControl: "deny-advertising",
    doNotTrack: "deny-advertising",
  },
  modes: {
    personalized: { enabled: false },
    "non-personalized": { enabled: true },
    limited: { enabled: false },
  },
  providers: {
    "google-adsense": {
      requiresCertifiedTcfCmp: true,
      minimumTcfVersion: "2.3",
      requiresSiteApproval: true,
      requiresAuthorizedSellerFile: true,
    },
  },
});
