const DEFAULT_ENV = import.meta.env || {};
const GOOGLE_CMP_PROVIDER = 'google-privacy-messaging';
const GOOGLE_CMP_HOST = 'fundingchoicesmessages.google.com';
const GOOGLE_CMP_SCRIPT_ID = 'aqua-google-privacy-messaging';
const PRIVACY_PATHS = new Set(['/privacidade', '/en/privacy']);

function enabled(value) {
  return String(value || '').toLowerCase() === 'true';
}

function normalizedPath(locationLike) {
  return String(locationLike?.pathname || '/').replace(/\/+$/, '') || '/';
}

export function resolveCmpBootstrap({
  env = DEFAULT_ENV,
  locationLike = globalThis.location,
  windowLike = globalThis.window,
} = {}) {
  const provider = String(env.VITE_CMP_PROVIDER || '').trim().toLowerCase();
  const result = {
    enabled: false,
    provider: provider || 'unconfigured',
    reason: 'cmp.bootstrap-disabled',
    tagUrl: '',
  };

  if (!enabled(env.VITE_CMP_BOOTSTRAP_ENABLED)) return result;
  if (provider !== GOOGLE_CMP_PROVIDER) {
    return { ...result, reason: 'cmp.provider-not-allowed' };
  }
  if (!enabled(env.VITE_CMP_CERTIFIED)) {
    return { ...result, reason: 'cmp.certification-not-confirmed' };
  }
  if (!enabled(env.VITE_CMP_MESSAGE_PUBLISHED)) {
    return { ...result, reason: 'cmp.message-not-published' };
  }
  if (PRIVACY_PATHS.has(normalizedPath(locationLike))) {
    return { ...result, reason: 'cmp.privacy-page-excluded' };
  }
  try {
    if (windowLike && windowLike.top !== windowLike.self) {
      return { ...result, reason: 'cmp.top-level-required' };
    }
  } catch {
    return { ...result, reason: 'cmp.top-level-required' };
  }

  let tagUrl;
  try {
    tagUrl = new URL(String(env.VITE_GOOGLE_CMP_TAG_URL || '').trim());
  } catch {
    return { ...result, reason: 'cmp.tag-url-invalid' };
  }
  if (
    tagUrl.protocol !== 'https:'
    || tagUrl.hostname !== GOOGLE_CMP_HOST
    || !tagUrl.pathname.startsWith('/i/')
    || !tagUrl.pathname.includes('pub-')
  ) {
    return { ...result, reason: 'cmp.tag-url-not-allowed' };
  }

  return {
    enabled: true,
    provider,
    reason: 'cmp.bootstrap-authorized',
    tagUrl: tagUrl.toString(),
  };
}

// Backwards-compatible name retained for release evidence created before the
// main-branch CMP bootstrap landed.
export const evaluateCmpBootstrap = resolveCmpBootstrap;

export function bootstrapCmp({
  env = DEFAULT_ENV,
  documentLike = globalThis.document,
  locationLike = globalThis.location,
  windowLike = globalThis.window,
} = {}) {
  const configuration = resolveCmpBootstrap({ env, locationLike, windowLike });
  const diagnostics = {
    provider: configuration.provider,
    status: configuration.enabled ? 'authorized' : 'blocked',
    reason: configuration.reason,
  };

  if (!configuration.enabled || !documentLike?.head) {
    if (windowLike) windowLike.__aquaCmpBootstrap = diagnostics;
    return diagnostics;
  }

  if (documentLike.getElementById(GOOGLE_CMP_SCRIPT_ID)) {
    const existing = { ...diagnostics, status: 'existing' };
    if (windowLike) windowLike.__aquaCmpBootstrap = existing;
    return existing;
  }

  const script = documentLike.createElement('script');
  script.id = GOOGLE_CMP_SCRIPT_ID;
  script.async = true;
  script.src = configuration.tagUrl;
  script.referrerPolicy = 'strict-origin-when-cross-origin';
  documentLike.head.prepend(script);

  const inserted = { ...diagnostics, status: 'inserted' };
  if (windowLike) windowLike.__aquaCmpBootstrap = inserted;
  return inserted;
}
