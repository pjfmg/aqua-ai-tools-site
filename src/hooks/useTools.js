import { useEffect, useState } from 'react';
import { loadTools } from '../lib/tools.js';
import { applyUserLists } from '../lib/userLists.js';

let cache = null;
let cachePromise = null;

export function useTools() {
  const [tools, setTools] = useState([]);
  const [rawTools, setRawTools] = useState([]);
  const [loading, setLoading] = useState(true);
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

    async function run() {
      try {
        if (cache) {
          setRawTools(cache.rawTools || cache.tools || []);
          setTools(applyUserLists(cache.rawTools || cache.tools || []));
          setWarning(cache.warning || '');
          setLoading(false);
          return;
        }

        setLoading(true);
        setError('');
        setWarning('');

        if (!cachePromise) cachePromise = loadTools();
        const { tools: loaded, warning: w } = await cachePromise;

        if (!cancelled) {
          cache = { rawTools: loaded, warning: w || '' };
          setRawTools(loaded);
          setTools(applyUserLists(loaded));
          setWarning(w || '');
        }
      } catch (e) {
        if (!cancelled) setError(`Erro ao carregar dados: ${e.message}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { tools, rawTools, loading, error, warning };
}
