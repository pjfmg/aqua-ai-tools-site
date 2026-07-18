const VISITED_KEY = 'aqua_tools_visitadas_v1';
const FAVORITES_KEY = 'aqua_tools_favoritas_v1';

function userStorageKey(baseKey, userId) {
  const id = String(userId || '').trim();
  return id ? `${baseKey}:${id}` : '';
}

function safeParseJsonArray(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readSet(storageKey) {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(storageKey);
    return new Set(safeParseJsonArray(raw).map(String).filter(Boolean));
  } catch {
    return new Set();
  }
}

function writeSet(storageKey, set) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(set)));
  } catch {
    // ignore (storage may be unavailable)
  }
}

function emitChange() {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('aqua_lists_changed'));
  } catch {
    // ignore
  }
}

export function getToolKey(tool) {
  const key = String(
    tool?.ID_Unico ||
      tool?.['ID_Unico'] ||
      tool?.id ||
      tool?.['Número'] ||
      tool?.Numero ||
      tool?.['Number'] ||
      tool?.Number ||
      tool?.Nome ||
      tool?.['Nome'] ||
      tool?.Name ||
      tool?.['Name'] ||
      '',
  ).trim();
  return key || '';
}

export function markVisited(tool, userId) {
  const k = getToolKey(tool);
  const storageKey = userStorageKey(VISITED_KEY, userId);
  if (!k || !storageKey) return false;
  const set = readSet(storageKey);
  if (set.has(k)) return false;
  set.add(k);
  writeSet(storageKey, set);
  emitChange();
  return true;
}

export function toggleFavorite(tool, userId) {
  const k = getToolKey(tool);
  const storageKey = userStorageKey(FAVORITES_KEY, userId);
  if (!k || !storageKey) return false;
  const set = readSet(storageKey);
  if (set.has(k)) set.delete(k);
  else set.add(k);
  writeSet(storageKey, set);
  emitChange();
  return true;
}

export function applyUserLists(tools, userId) {
  let visited;
  let favorites;
  try {
    visited = readSet(userStorageKey(VISITED_KEY, userId));
    favorites = readSet(userStorageKey(FAVORITES_KEY, userId));
  } catch {
    visited = new Set();
    favorites = new Set();
  }

  return (Array.isArray(tools) ? tools : []).map((t) => {
    const k = getToolKey(t);
    const visitado = (k && visited.has(k)) || String(t?.Visitado || '') === 'Sim' ? 'Sim' : 'Não';
    const favorito = (k && favorites.has(k)) || String(t?.Favorito || '') === 'Sim' ? 'Sim' : 'Não';
    return { ...t, Visitado: visitado, Favorito: favorito };
  });
}
