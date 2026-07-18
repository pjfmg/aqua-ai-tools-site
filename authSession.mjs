function readAuthorization(request) {
  if (request?.headers?.get) return String(request.headers.get('authorization') || '').trim();
  return String(request?.headers?.authorization || request?.headers?.Authorization || '').trim();
}

function getConfig(env = {}) {
  const supabaseUrl = String(env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const anonKey = String(env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '').trim();
  return { supabaseUrl, anonKey };
}

export async function authenticateRequest(request, env = process.env, fetchImpl = fetch) {
  const { supabaseUrl, anonKey } = getConfig(env);
  if (!supabaseUrl || !anonKey) {
    return { ok: false, status: 500, error: 'AUTH_NOT_CONFIGURED' };
  }

  const authorization = readAuthorization(request);
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) return { ok: false, status: 401, error: 'AUTH_REQUIRED' };

  let response;
  try {
    response = await fetchImpl(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${match[1]}` },
      cache: 'no-store',
    });
  } catch {
    return { ok: false, status: 503, error: 'AUTH_UNAVAILABLE' };
  }

  if (!response.ok) return { ok: false, status: 401, error: 'AUTH_INVALID' };
  const user = await response.json().catch(() => null);
  const email = String(user?.email || '').trim().toLowerCase();
  if (!user?.id || !email) return { ok: false, status: 401, error: 'AUTH_INVALID' };

  return { ok: true, user: { id: String(user.id), email } };
}
