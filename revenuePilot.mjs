const PUBLIC_LINK_PATTERN = /^r_[a-f0-9]{48}$/;
const TOOL_KEY_PATTERN = /^[\p{L}\p{N}._:@+ -]{1,128}$/u;

function truthy(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

function validHttpsUrl(value, { allowLocalhost = false } = {}) {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol === 'https:') return url;
    if (allowLocalhost && url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname)) return url;
  } catch {
    // Invalid configuration is handled as a disabled pilot.
  }
  return null;
}

function parseEntries(raw) {
  try {
    const parsed = JSON.parse(String(raw || '[]'));
    if (!Array.isArray(parsed) || parsed.length < 5 || parsed.length > 10) return [];
    const keys = new Set();
    const entries = parsed.map((entry) => {
      const toolKey = String(entry?.toolKey || '').trim();
      const publicLinkId = String(entry?.publicLinkId || '').trim();
      const editorialUrl = validHttpsUrl(entry?.editorialUrl);
      const verifiedAt = new Date(String(entry?.verifiedAt || ''));
      const approvedAt = new Date(String(entry?.approvedAt || ''));
      if (!TOOL_KEY_PATTERN.test(toolKey) || keys.has(toolKey.toLowerCase())) throw new Error('INVALID_TOOL_KEY');
      if (!PUBLIC_LINK_PATTERN.test(publicLinkId) || !editorialUrl) throw new Error('INVALID_LINK');
      if (!Number.isFinite(verifiedAt.getTime()) || !Number.isFinite(approvedAt.getTime())) throw new Error('UNVERIFIED_ENTRY');
      keys.add(toolKey.toLowerCase());
      return { toolKey, publicLinkId, editorialUrl: editorialUrl.href, verifiedAt: verifiedAt.toISOString(), approvedAt: approvedAt.toISOString() };
    });
    return entries;
  } catch {
    return [];
  }
}

export function revenuePilotConfig(env = process.env) {
  const enabled = truthy(env.AQUA_REVENUE_PILOT_ENABLED) && !truthy(env.AQUA_REVENUE_PILOT_EMERGENCY_STOP);
  const platform = validHttpsUrl(env.AQUA_REVENUE_PLATFORM_URL, { allowLocalhost: String(env.NODE_ENV || '').toLowerCase() !== 'production' });
  const entries = parseEntries(env.AQUA_REVENUE_AI_TOOLS_PILOT_JSON);
  const timeoutMs = Math.max(250, Math.min(3000, Number(env.AQUA_REVENUE_PILOT_TIMEOUT_MS) || 800));
  return { active: Boolean(enabled && platform && entries.length >= 5), platform, entries, timeoutMs };
}

export function findRevenuePilotEntry(toolKey, env = process.env) {
  const key = String(toolKey || '').trim();
  if (!TOOL_KEY_PATTERN.test(key)) return { config: revenuePilotConfig(env), entry: null };
  const config = revenuePilotConfig(env);
  const entry = config.active ? config.entries.find((candidate) => candidate.toolKey.toLowerCase() === key.toLowerCase()) || null : null;
  return { config, entry };
}

export function revenuePilotStatus(toolKey, env = process.env) {
  const { config, entry } = findRevenuePilotEntry(toolKey, env);
  return { commercial: Boolean(entry), pilotActive: config.active, disclosureRequired: Boolean(entry) };
}

function requestHeader(request, name) {
  if (request?.headers?.get) return String(request.headers.get(name) || '');
  return String(request?.headers?.[name.toLowerCase()] || request?.headers?.[name] || '');
}

export async function resolveRevenuePilotRedirect(toolKey, request, env = process.env, fetchImpl = fetch) {
  const { config, entry } = findRevenuePilotEntry(toolKey, env);
  if (!entry) return { status: 404, location: '', outcome: 'not-configured' };
  const endpoint = new URL(`/r/${entry.publicLinkId}`, config.platform);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const headers = new Headers();
    for (const name of ['user-agent', 'accept-language', 'x-trace-id', 'cf-connecting-ip', 'x-forwarded-for']) {
      const value = requestHeader(request, name).slice(0, 512);
      if (value) headers.set(name, value);
    }
    const response = await fetchImpl(endpoint, { method: 'GET', redirect: 'manual', headers, signal: controller.signal });
    const location = validHttpsUrl(response.headers.get('location'));
    if (response.status >= 300 && response.status < 400 && location) return { status: 302, location: location.href, outcome: 'revenue-platform' };
  } catch {
    // Availability failures use the verified editorial destination below.
  } finally {
    clearTimeout(timeout);
  }
  return { status: 302, location: entry.editorialUrl, outcome: 'editorial-fallback' };
}

export function readToolKey(request) {
  try { return new URL(request?.url || '/', 'http://localhost').searchParams.get('toolKey') || ''; }
  catch { return String(request?.query?.toolKey || ''); }
}
