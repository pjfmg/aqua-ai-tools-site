import { useEffect, useState } from 'react';
import { loadLocalToolsSnapshot, loadToolsPhased, normalizeRecordStatus, normalizeToolFilters } from '../lib/tools.js';
import { applyUserLists } from '../lib/userLists.js';

const cacheByStatus = new Map();
const partialByStatus = new Map();
const promiseByStatus = new Map();
const subscribers = new Set();

const TOOLS_STORAGE_KEY = 'aqua_tools_cache_v1';
const TOOLS_STORAGE_VERSION = 2;
const REVALIDATE_AFTER_MS = 10 * 60 * 1000; // 10 min

function isMockWarning(value) {
  const s = String(value || '');
  return s.includes('mock local') || s.includes('source: mock');
}

function isMockSnapshot(value) {
  return value?.source === 'mock' || isMockWarning(value?.warning);
}

function sanitizeWarning(value) {
  return String(value || '');
}

function getCacheKey(recordStatus, filters = {}) {
  const normalized = normalizeToolFilters(filters);
  return `${recordStatus}:${JSON.stringify(normalized)}`;
}

function publish(cacheKey, next) {
  const partial = { cacheKey, ts: Date.now(), ...next };
  partialByStatus.set(cacheKey, partial);
  for (const fn of subscribers) fn(partial);
}

function getStorageKey(cacheKey) {
  return `${TOOLS_STORAGE_KEY}:${cacheKey}`;
}

function readStoredTools(cacheKey) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(getStorageKey(cacheKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== TOOLS_STORAGE_VERSION) return null;
    if (!Array.isArray(parsed.tools)) return null;
    if (typeof parsed.ts !== 'number') return null;
    return {
      tools: parsed.tools,
      warning: sanitizeWarning(parsed.warning || ''),
      source: String(parsed.source || ''),
      ts: parsed.ts,
    };
  } catch {
    return null;
  }
}

function writeStoredTools(cacheKey, tools, warning, source) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      getStorageKey(cacheKey),
      JSON.stringify({
        v: TOOLS_STORAGE_VERSION,
        ts: Date.now(),
        tools,
        warning: warning || '',
        source: source || '',
      }),
    );
  } catch {
    // ignore quota/blocked storage
  }
}

export function useTools({ initialPageSize = 20, recordStatus = 'eligible', filters = {} } = {}) {
  const normalizedRecordStatus = normalizeRecordStatus(recordStatus);
  const normalizedFilters = normalizeToolFilters(filters);
  const cacheKey = getCacheKey(normalizedRecordStatus, normalizedFilters);
  const [tools, setTools] = useState([]);
  const [rawTools, setRawTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [updatedAt, setUpdatedAt] = useState(0);
  const [source, setSource] = useState('');
  const [refreshNonce, setRefreshNonce] = useState(0);

  function refresh() {
    cacheByStatus.delete(cacheKey);
    partialByStatus.delete(cacheKey);
    promiseByStatus.delete(cacheKey);
    try {
      window.localStorage.removeItem(getStorageKey(cacheKey));
    } catch {
      // ignore
    }
    setRefreshNonce((value) => value + 1);
  }

  useEffect(() => {
    function refreshFromLists() {
      const cache = cacheByStatus.get(cacheKey);
      if (cache?.rawTools) setTools(applyUserLists(cache.rawTools));
      else setTools((prev) => applyUserLists(prev));
    }

    function onStorage(e) {
      if (!e?.key) return;
      if (e.key === 'aqua_tools_visitadas_v1' || e.key === 'aqua_tools_favoritas_v1') refreshFromLists();
    }

    window.addEventListener('storage', onStorage);
    window.addEventListener('aqua_lists_changed', refreshFromLists);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('aqua_lists_changed', refreshFromLists);
    };
  }, [cacheKey]);

  useEffect(() => {
    let cancelled = false;

    function applySnapshot(snapshot, { keepLoading = false } = {}) {
      const list = snapshot?.rawTools || snapshot?.tools || [];
      setRawTools(list);
      setTools(applyUserLists(list));
      setWarning(sanitizeWarning(snapshot?.warning || ''));
      setSource(String(snapshot?.source || ''));
      setUpdatedAt(typeof snapshot?.ts === 'number' ? snapshot.ts : 0);
      setError('');
      setLoadingMore(Boolean(snapshot?.loadingMore));
      if (!keepLoading) setLoading(false);
    }

    function onUpdate(next) {
      if (cancelled) return;
      if (next?.cacheKey !== cacheKey) return;
      applySnapshot(next);
    }

    subscribers.add(onUpdate);

    async function run() {
      try {
        const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
        const now = Date.now();

        const cache = cacheByStatus.get(cacheKey);
        const partial = partialByStatus.get(cacheKey);
        const cachePromise = promiseByStatus.get(cacheKey);
        const stored = readStoredTools(cacheKey);
        const storedAge = stored ? now - stored.ts : Infinity;

        if (cache) {
          applySnapshot(cache);
          const cacheAge = typeof cache?.ts === 'number' ? now - cache.ts : Infinity;
          const shouldFetchCached = !cachePromise && (isMockSnapshot(cache) || cacheAge > REVALIDATE_AFTER_MS);
          if (!shouldFetchCached) return;
        }

        if (partial?.rawTools?.length) {
          applySnapshot(partial);
        } else if (stored?.tools?.length) {
          applySnapshot({ rawTools: stored.tools, warning: stored.warning, source: stored.source, ts: stored.ts });
        } else {
          setLoading(true);
          setWarning('');

          loadLocalToolsSnapshot().then((seedTools) => {
            if (cancelled) return;
            if (!Array.isArray(seedTools) || !seedTools.length) return;
            if (cache?.rawTools?.length || partial?.rawTools?.length) return;

            applySnapshot(
              {
                rawTools: seedTools,
                warning: '',
                source: 'snapshot',
                loadingMore: true,
              },
              { keepLoading: false },
            );
          });
        }

        const shouldFetch =
          !cachePromise &&
          (!stored?.tools?.length ||
            storedAge > REVALIDATE_AFTER_MS ||
            isMockSnapshot(stored) ||
            isMockSnapshot(partial) ||
            isMockSnapshot(cache));
        if (!shouldFetch) {
          if (import.meta?.env?.DEV && t0) {
            const dt = performance.now() - t0;
            // eslint-disable-next-line no-console
            console.debug(`[useTools] hydrate in ${Math.round(dt)}ms`);
          }
          return;
        }

        setError('');
        setLoadingMore(true);

        const showPhases =
          !cache?.rawTools?.length && !stored?.tools?.length && !(partial?.rawTools?.length);
        let merged = [];
        let firstChunk = true;

        const nextPromise = loadToolsPhased({
          initialPageSize,
          recordStatus: normalizedRecordStatus,
          filters: normalizedFilters,
          onChunk: showPhases
            ? (chunk, meta) => {
                merged = merged.concat(chunk || []);
                publish(cacheKey, {
                  rawTools: merged,
                  warning: '',
                  source: 'airtable',
                  loadingMore: !meta?.done,
                });

                if (firstChunk) {
                  firstChunk = false;
                  if (!cancelled) setLoading(false);
                  if (import.meta?.env?.DEV && t0) {
                    const dt = performance.now() - t0;
                    // eslint-disable-next-line no-console
                    console.debug(`[useTools] first chunk in ${Math.round(dt)}ms`);
                  }
                }
              }
            : undefined,
        });
        promiseByStatus.set(cacheKey, nextPromise);

        const { tools: loaded, warning: w, source } = await nextPromise;

        if (!cancelled) {
          const nextCache = { rawTools: loaded, warning: w || '', source: source || '', ts: Date.now() };
          cacheByStatus.set(cacheKey, nextCache);
          publish(cacheKey, { rawTools: loaded, warning: w || '', source: source || '', loadingMore: false });
          writeStoredTools(cacheKey, loaded, w || '', source || '');
          setLoadingMore(false);
          if (import.meta?.env?.DEV && t0) {
            const dt = performance.now() - t0;
            // eslint-disable-next-line no-console
            console.debug(`[useTools] full load in ${Math.round(dt)}ms (${loaded.length} tools)`);
          }
        }
      } catch (e) {
        promiseByStatus.delete(cacheKey);
        if (!cancelled) setError(`Erro ao carregar dados: ${e.message}`);
      } finally {
        promiseByStatus.delete(cacheKey);
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
      subscribers.delete(onUpdate);
    };
  }, [initialPageSize, cacheKey, refreshNonce]);

  return { tools, rawTools, loading, loadingMore, error, warning, source, updatedAt, refresh, recordStatus: normalizedRecordStatus };
}
