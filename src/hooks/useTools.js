import { useCallback, useEffect, useState } from 'react';
import { loadToolsPage, normalizeRecordStatus, normalizeToolFilters } from '../lib/tools.js';
import { applyUserLists } from '../lib/userLists.js';
import { useAuth } from '../auth/auth.jsx';

const cacheByQuery = new Map();
const initialPromiseByQuery = new Map();
const pagePromiseByQuery = new Map();
const subscribers = new Set();

const TOOLS_STORAGE_KEY = 'aqua_tools_cache_v1';
const TOOLS_STORAGE_VERSION = 3;
const REVALIDATE_AFTER_MS = 10 * 60 * 1000; // 10 min

function sanitizeWarning(value) {
  return String(value || '');
}

function getCacheKey(recordStatus, filters = {}, pageSize = 40) {
  const normalized = normalizeToolFilters(filters);
  return `${recordStatus}:${Math.max(1, Math.min(100, Number(pageSize) || 40))}:${JSON.stringify(normalized)}`;
}

function getStorageKey(cacheKey) {
  return `${TOOLS_STORAGE_KEY}:${cacheKey}`;
}

function publish(cacheKey, snapshot) {
  const next = { cacheKey, ...snapshot };
  cacheByQuery.set(cacheKey, next);
  for (const fn of subscribers) fn(next);
}

function readStoredTools(cacheKey) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(getStorageKey(cacheKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== TOOLS_STORAGE_VERSION) return null;
    if (!Array.isArray(parsed.tools) || typeof parsed.ts !== 'number') return null;
    return {
      cacheKey,
      rawTools: parsed.tools,
      nextOffset: typeof parsed.nextOffset === 'string' && parsed.nextOffset ? parsed.nextOffset : null,
      warning: sanitizeWarning(parsed.warning),
      source: String(parsed.source || ''),
      ts: parsed.ts,
    };
  } catch {
    return null;
  }
}

function writeStoredTools(cacheKey, snapshot) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      getStorageKey(cacheKey),
      JSON.stringify({
        v: TOOLS_STORAGE_VERSION,
        ts: snapshot.ts,
        tools: snapshot.rawTools,
        nextOffset: snapshot.nextOffset,
        warning: snapshot.warning || '',
        source: snapshot.source || '',
      }),
    );
  } catch {
    // Ignore unavailable storage and quota errors.
  }
}

function toolIdentity(tool, index) {
  return String(tool?.ID_Unico || tool?.id || tool?.Número || tool?.Nome || index);
}

function mergeTools(current, incoming) {
  const merged = [...current];
  const known = new Set(current.map(toolIdentity));
  for (const tool of incoming) {
    const identity = toolIdentity(tool, merged.length);
    if (known.has(identity)) continue;
    known.add(identity);
    merged.push(tool);
  }
  return merged;
}

export function useTools({ initialPageSize = 40, recordStatus = 'published', filters = {} } = {}) {
  const { user } = useAuth();
  const userId = user?.id || '';
  const normalizedRecordStatus = normalizeRecordStatus(recordStatus);
  const normalizedFilters = normalizeToolFilters(filters);
  const pageSize = Math.max(1, Math.min(100, Number(initialPageSize) || 40));
  const cacheKey = getCacheKey(normalizedRecordStatus, normalizedFilters, pageSize);
  const [tools, setTools] = useState([]);
  const [rawTools, setRawTools] = useState([]);
  const [nextOffset, setNextOffset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [updatedAt, setUpdatedAt] = useState(0);
  const [source, setSource] = useState('');
  const [refreshNonce, setRefreshNonce] = useState(0);

  const applySnapshot = useCallback((snapshot) => {
    const list = snapshot?.rawTools || [];
    setRawTools(list);
    setTools(applyUserLists(list, userId));
    setNextOffset(snapshot?.nextOffset || null);
    setWarning(sanitizeWarning(snapshot?.warning));
    setSource(String(snapshot?.source || ''));
    setUpdatedAt(typeof snapshot?.ts === 'number' ? snapshot.ts : 0);
    setError('');
  }, [userId]);

  const refresh = useCallback(() => {
    cacheByQuery.delete(cacheKey);
    initialPromiseByQuery.delete(cacheKey);
    for (const key of pagePromiseByQuery.keys()) {
      if (key.startsWith(`${cacheKey}:`)) pagePromiseByQuery.delete(key);
    }
    try {
      window.localStorage.removeItem(getStorageKey(cacheKey));
    } catch {
      // Ignore unavailable storage.
    }
    setRefreshNonce((value) => value + 1);
  }, [cacheKey]);

  useEffect(() => {
    function refreshFromLists() {
      setTools(applyUserLists(rawTools, userId));
    }

    function onStorage(event) {
      if (!event?.key) return;
      if (event.key === `aqua_tools_visitadas_v1:${userId}` || event.key === `aqua_tools_favoritas_v1:${userId}`) {
        refreshFromLists();
      }
    }

    window.addEventListener('storage', onStorage);
    window.addEventListener('aqua_lists_changed', refreshFromLists);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('aqua_lists_changed', refreshFromLists);
    };
  }, [rawTools, userId]);

  useEffect(() => {
    let cancelled = false;

    function onUpdate(snapshot) {
      if (cancelled || snapshot?.cacheKey !== cacheKey) return;
      applySnapshot(snapshot);
    }

    subscribers.add(onUpdate);

    async function run() {
      const now = Date.now();
      const memorySnapshot = cacheByQuery.get(cacheKey);
      const storedSnapshot = readStoredTools(cacheKey);
      const availableSnapshot = memorySnapshot || storedSnapshot;

      if (availableSnapshot) {
        applySnapshot(availableSnapshot);
        setLoading(false);
      } else {
        setRawTools([]);
        setTools([]);
        setNextOffset(null);
        setSource('');
        setUpdatedAt(0);
        setLoading(true);
        setError('');
        setWarning('');
      }

      const age = availableSnapshot ? now - availableSnapshot.ts : Infinity;
      if (availableSnapshot && age <= REVALIDATE_AFTER_MS) return;

      let initialPromise = initialPromiseByQuery.get(cacheKey);
      if (!initialPromise) {
        initialPromise = loadToolsPage({
          pageSize,
          recordStatus: normalizedRecordStatus,
          filters: normalizedFilters,
        });
        initialPromiseByQuery.set(cacheKey, initialPromise);
      }

      try {
        const page = await initialPromise;
        const snapshot = {
          rawTools: page.tools,
          nextOffset: page.nextOffset,
          warning: page.warning || '',
          source: page.source || '',
          ts: Date.now(),
        };
        publish(cacheKey, snapshot);
        writeStoredTools(cacheKey, snapshot);
      } catch (loadError) {
        if (import.meta?.env?.DEV) {
          // eslint-disable-next-line no-console
          console.error('[useTools] catalogue page load failed', loadError);
        }
        if (!cancelled && !availableSnapshot) setError('LOAD_FAILED');
      } finally {
        if (initialPromiseByQuery.get(cacheKey) === initialPromise) initialPromiseByQuery.delete(cacheKey);
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
      subscribers.delete(onUpdate);
    };
  }, [
    applySnapshot,
    cacheKey,
    normalizedFilters.area,
    normalizedFilters.number,
    normalizedFilters.price,
    normalizedFilters.q,
    normalizedRecordStatus,
    pageSize,
    refreshNonce,
  ]);

  const loadMore = useCallback(async () => {
    const snapshot = cacheByQuery.get(cacheKey) || readStoredTools(cacheKey);
    const offset = snapshot?.nextOffset || nextOffset;
    if (!offset || loadingMore) return;

    const pagePromiseKey = `${cacheKey}:${offset}`;
    let pagePromise = pagePromiseByQuery.get(pagePromiseKey);
    if (!pagePromise) {
      pagePromise = loadToolsPage({
        offset,
        pageSize,
        recordStatus: normalizedRecordStatus,
        filters: normalizedFilters,
      });
      pagePromiseByQuery.set(pagePromiseKey, pagePromise);
    }

    setLoadingMore(true);
    setError('');
    try {
      const page = await pagePromise;
      const latest = cacheByQuery.get(cacheKey) || snapshot || { rawTools: [] };
      const nextSnapshot = {
        rawTools: mergeTools(latest.rawTools || [], page.tools || []),
        nextOffset: page.nextOffset,
        warning: page.warning || latest.warning || '',
        source: page.source || latest.source || '',
        ts: Date.now(),
      };
      publish(cacheKey, nextSnapshot);
      writeStoredTools(cacheKey, nextSnapshot);
    } catch (loadError) {
      if (import.meta?.env?.DEV) {
        // eslint-disable-next-line no-console
        console.error('[useTools] next catalogue page failed', loadError);
      }
      setError('LOAD_MORE_FAILED');
    } finally {
      pagePromiseByQuery.delete(pagePromiseKey);
      setLoadingMore(false);
    }
  }, [
    cacheKey,
    loadingMore,
    nextOffset,
    normalizedFilters.area,
    normalizedFilters.number,
    normalizedFilters.price,
    normalizedFilters.q,
    normalizedRecordStatus,
    pageSize,
  ]);

  return {
    tools,
    rawTools,
    loading,
    loadingMore,
    error,
    warning,
    source,
    updatedAt,
    hasMore: Boolean(nextOffset),
    loadMore,
    refresh,
    recordStatus: normalizedRecordStatus,
  };
}
