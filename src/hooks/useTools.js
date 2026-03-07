import { useEffect, useState } from 'react';
import { loadToolsPhased } from '../lib/tools.js';
import { applyUserLists } from '../lib/userLists.js';

let cache = null;
let partial = null;
let cachePromise = null;
const subscribers = new Set();

const TOOLS_STORAGE_KEY = 'aqua_tools_cache_v1';
const TOOLS_STORAGE_VERSION = 1;
const REVALIDATE_AFTER_MS = 10 * 60 * 1000; // 10 min

function isMockWarning(value) {
  const s = String(value || '');
  return s.includes('mock local') || s.includes('source: mock');
}

function publish(next) {
  partial = { ts: Date.now(), ...next };
  for (const fn of subscribers) fn(partial);
}

function readStoredTools() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(TOOLS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== TOOLS_STORAGE_VERSION) return null;
    if (!Array.isArray(parsed.tools)) return null;
    if (typeof parsed.ts !== 'number') return null;
    return { tools: parsed.tools, warning: String(parsed.warning || ''), ts: parsed.ts };
  } catch {
    return null;
  }
}

function writeStoredTools(tools, warning) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      TOOLS_STORAGE_KEY,
      JSON.stringify({ v: TOOLS_STORAGE_VERSION, ts: Date.now(), tools, warning: warning || '' }),
    );
  } catch {
    // ignore quota/blocked storage
  }
}

export function useTools({ initialPageSize = 20 } = {}) {
  const [tools, setTools] = useState([]);
  const [rawTools, setRawTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    function refreshFromLists() {
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    function applySnapshot(snapshot, { keepLoading = false } = {}) {
      const list = snapshot?.rawTools || snapshot?.tools || [];
      setRawTools(list);
      setTools(applyUserLists(list));
      setWarning(snapshot?.warning || '');
      setError('');
      setLoadingMore(Boolean(snapshot?.loadingMore));
      if (!keepLoading) setLoading(false);
    }

    function onUpdate(next) {
      if (cancelled) return;
      applySnapshot(next);
    }

    subscribers.add(onUpdate);

    async function run() {
      try {
        const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
        const now = Date.now();

        const stored = readStoredTools();
        const storedAge = stored ? now - stored.ts : Infinity;

        if (cache) {
          applySnapshot(cache);
          const cacheAge = typeof cache?.ts === 'number' ? now - cache.ts : Infinity;
          const shouldFetchCached =
            !cachePromise && (isMockWarning(cache?.warning) || cacheAge > REVALIDATE_AFTER_MS);
          if (!shouldFetchCached) return;
        }

        if (partial?.rawTools?.length) {
          applySnapshot(partial);
        } else if (stored?.tools?.length) {
          applySnapshot({ rawTools: stored.tools, warning: stored.warning });
        } else {
          setLoading(true);
          setWarning('');
        }

        const shouldFetch =
          !cachePromise &&
          (!stored?.tools?.length ||
            storedAge > REVALIDATE_AFTER_MS ||
            isMockWarning(stored?.warning) ||
            isMockWarning(partial?.warning) ||
            isMockWarning(cache?.warning));
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

        cachePromise = loadToolsPhased({
          initialPageSize,
          onChunk: showPhases
            ? (chunk, meta) => {
                merged = merged.concat(chunk || []);
                publish({
                  rawTools: merged,
                  warning: '',
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

        const { tools: loaded, warning: w } = await cachePromise;

        if (!cancelled) {
          cache = { rawTools: loaded, warning: w || '', ts: Date.now() };
          publish({ rawTools: loaded, warning: w || '', loadingMore: false });
          writeStoredTools(loaded, w || '');
          setLoadingMore(false);
          if (import.meta?.env?.DEV && t0) {
            const dt = performance.now() - t0;
            // eslint-disable-next-line no-console
            console.debug(`[useTools] full load in ${Math.round(dt)}ms (${loaded.length} tools)`);
          }
        }
      } catch (e) {
        cachePromise = null;
        if (!cancelled) setError(`Erro ao carregar dados: ${e.message}`);
      } finally {
        cachePromise = null;
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
      subscribers.delete(onUpdate);
    };
  }, []);

  return { tools, rawTools, loading, loadingMore, error, warning };
}
