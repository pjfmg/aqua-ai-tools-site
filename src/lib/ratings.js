import { getToolKey } from './userLists.js';

function storageKeyForUser(email) {
  const safe = String(email || '').trim().toLowerCase();
  return `aqua_tool_ratings_v1:${safe || 'anon'}`;
}

function safeParse(raw) {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getMyRating(email, tool) {
  if (typeof window === 'undefined') return 0;
  const toolKey = getToolKey(tool);
  if (!toolKey) return 0;
  const key = storageKeyForUser(email);
  const all = safeParse(window.localStorage.getItem(key));
  const v = Number(all?.[toolKey] || 0);
  if (!Number.isFinite(v)) return 0;
  return Math.min(5, Math.max(0, Math.round(v)));
}

export function setMyRating(email, tool, rating) {
  if (typeof window === 'undefined') return false;
  const toolKey = getToolKey(tool);
  if (!toolKey) return false;
  const r = Number(rating);
  if (!Number.isFinite(r) || r < 1 || r > 5) return false;

  const key = storageKeyForUser(email);
  const all = safeParse(window.localStorage.getItem(key));
  all[toolKey] = Math.round(r);
  window.localStorage.setItem(key, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent('aqua_my_rating_changed', { detail: { toolKey } }));
  return true;
}

export async function submitMyRating({ email, tool, rating }) {
  const toolKey = getToolKey(tool);
  if (!toolKey) return { ok: false, error: 'Missing tool key' };
  const r = Number(rating);
  if (!Number.isFinite(r) || r < 1 || r > 5) return { ok: false, error: 'Invalid rating' };

  const payload = {
    toolKey,
    toolId: String(tool?.id || ''),
    toolName: String(tool?.Nome || tool?.['Nome'] || ''),
    userEmail: String(email || '').trim().toLowerCase(),
    rating: Math.round(r),
  };

  try {
    const res = await fetch('/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.error || `Falha ao guardar (${res.status})` };
    window.dispatchEvent(new CustomEvent('aqua_ratings_changed'));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || 'Network error' };
  }
}

