const SESSION_STORAGE_KEY = 'aqua_supabase_session_v1';
const REFRESH_MARGIN_SECONDS = 60;

let refreshPromise = null;

function getConfig() {
  const url = String(import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (!url || !anonKey) {
    throw new Error('Supabase Auth não está configurado. Define VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  }
  return { url, anonKey };
}

function readSession() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY) || 'null');
    return parsed && typeof parsed === 'object' && parsed.access_token ? parsed : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  if (!session?.access_token) return clearSession();
  const expiresAt = Number(session.expires_at) || Math.floor(Date.now() / 1000) + Number(session.expires_in || 3600);
  const normalized = { ...session, expires_at: expiresAt };
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in privacy modes.
  }
  return null;
}

async function authRequest(path, { method = 'GET', body, accessToken } = {}) {
  const { url, anonKey } = getConfig();
  const response = await fetch(`${url}/auth/v1${path}`, {
    method,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken || anonKey}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.msg || payload?.message || payload?.error_description || 'Supabase Auth request failed');
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function refreshSession(session) {
  if (!session?.refresh_token) return clearSession();
  if (!refreshPromise) {
    refreshPromise = authRequest('/token?grant_type=refresh_token', {
      method: 'POST',
      body: { refresh_token: session.refresh_token },
    })
      .then(writeSession)
      .catch((error) => {
        clearSession();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function getValidSession() {
  const session = readSession();
  if (!session) return null;
  const now = Math.floor(Date.now() / 1000);
  if (Number(session.expires_at || 0) > now + REFRESH_MARGIN_SECONDS) return session;
  return refreshSession(session);
}

export async function getAccessToken() {
  const session = await getValidSession();
  return session?.access_token || '';
}

export async function getAuthenticatedUser() {
  const session = await getValidSession();
  if (!session?.access_token) return null;
  try {
    return await authRequest('/user', { accessToken: session.access_token });
  } catch (error) {
    if (error.status === 401) clearSession();
    throw error;
  }
}

export async function signInWithPassword({ email, password }) {
  const session = await authRequest('/token?grant_type=password', {
    method: 'POST',
    body: { email: String(email || '').trim().toLowerCase(), password },
  });
  writeSession(session);
  return session;
}

export async function signUpWithPassword({ name, email, password }) {
  const result = await authRequest('/signup', {
    method: 'POST',
    body: {
      email: String(email || '').trim().toLowerCase(),
      password,
      data: { name: String(name || '').trim() },
    },
  });
  if (result?.access_token) writeSession(result);
  return result;
}

export async function signOutFromSupabase() {
  const session = readSession();
  clearSession();
  if (!session?.access_token) return;
  await authRequest('/logout', { method: 'POST', accessToken: session.access_token }).catch(() => {});
}
