const DEFAULT_ENV = import.meta.env || {};
const GOOGLE_CMP_PROVIDER = 'google-privacy-messaging';
const GOOGLE_CMP_HOST = 'fundingchoicesmessages.google.com';
const CMP_SCRIPT_ID = 'aqua-google-privacy-messaging';
const PRIVACY_PATHS = new Set(['/privacidade', '/en/privacy']);

function enabled(value) {
  return String(value || '').toLowerCase() === 'true';
}

function normalizedPath(locationLike) {
  return String(locationLike?.pathname || '/').replace(/\/+$/, '') || '/';
}

export function evaluateCmpBootstrap({
  env = DEFAULT_ENV,
  locationLike = globalThis.location,
  windowLike = globalThis.window,
} = {}) {
  const provider = String(env.VITE_CMP_PROVIDER || '').trim().toLowerCase();
  const blocked = {
    enabled: false,
    provider: provider || 'unconfigured',
    reason: 'cmp.bootstrap-disabled',
    tagUrl: '',
  };

  if (!enabled(env.VITE_CMP_BOOTSTRAP_ENABLED)) return blocked;
  if (provider !== GOOGLE_CMP_PROVIDER) {
    return { ...blocked, reason: 'cmp.provider-not-allowed' };
  }
  if (!enabled(env.VITE_CMP_CERTIFIED)) {
    return { ...blocked, reason: 'cmp.certification-not-confirmed' };
  }
  if (!enabled(env.VITE_CMP_MESSAGE_PUBLISHED)) {
    return { ...blocked, reason: 'cmp.message-not-published' };
  }
  if (PRIVACY_PATHS.has(normalizedPath(locationLike))) {
    return { ...blocked, reason: 'cmp.privacy-page-excluded' };
  }
  try {
    if (windowLike && windowLike.top !== windowLike.self) {
      return { ...blocked, reason: 'cmp.top-level-required' };
    }
  } catch {
    return { ...blocked, reason: 'cmp.top-level-required' };
  }

  let tagUrl;
  try {
    tagUrl = new URL(String(env.VITE_GOOGLE_CMP_TAG_URL || '').trim());
  } catch {
    return { ...blocked, reason: 'cmp.tag-url-invalid' };
  }
  if (
    tagUrl.protocol !== 'https:'
    || tagUrl.hostname !== GOOGLE_CMP_HOST
    || !tagUrl.pathname.startsWith('/i/')
    || !tagUrl.pathname.includes('pub-')
  ) {
    return { ...blocked, reason: 'cmp.tag-url-not-allowed' };
  }

  return {
    enabled: true,
    provider,
    reason: 'cmp.bootstrap-authorized',
    tagUrl: tagUrl.toString(),
  };
}

export function bootstrapCmp({
  env = DEFAULT_ENV,
  documentLike = globalThis.document,
  locationLike = globalThis.location,
  windowLike = globalThis.window,
} = {}) {
  const authorization = evaluateCmpBootstrap({ env, locationLike, windowLike });
  const blockedResult = {
    provider: authorization.provider,
    status: authorization.enabled ? 'authorized' : 'blocked',
    reason: authorization.reason,
  };

  if (!authorization.enabled || !documentLike?.head) {
    if (windowLike) windowLike.__aquaCmpBootstrap = blockedResult;
    return blockedResult;
  }

  if (documentLike.getElementById(CMP_SCRIPT_ID)) {
    const existingResult = { ...blockedResult, status: 'existing' };
    if (windowLike) windowLike.__aquaCmpBootstrap = existingResult;
    return existingResult;
  }

  const script = documentLike.createElement('script');
  script.id = CMP_SCRIPT_ID;
  script.async = true;
  script.src = authorization.tagUrl;
  script.referrerPolicy = 'strict-origin-when-cross-origin';
  documentLike.head.prepend(script);

  const insertedResult = { ...blockedResult, status: 'inserted' };
  if (windowLike) windowLike.__aquaCmpBootstrap = insertedResult;
  return insertedResult;
}
