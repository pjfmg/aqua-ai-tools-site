import { useEffect, useState } from 'react';
import { fetchWithTimeout } from '../lib/http.js';

let cache = null;
let cachePromise = null;

async function loadRatingsSummary() {
  const res = await fetchWithTimeout('/ratings', { cache: 'no-store' }, 6000);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Falha ao carregar ratings (${res.status})`);
  return json?.ratings && typeof json.ratings === 'object' ? json.ratings : {};
}

export function useRatingsSummary() {
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        if (cache) {
          setRatings(cache);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError('');
        if (!cachePromise) cachePromise = loadRatingsSummary();
        const loaded = await cachePromise;
        if (!cancelled) {
          cache = loaded;
          setRatings(loaded);
        }
      } catch (e) {
        cachePromise = null;
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let isRefreshing = false;

    async function refresh() {
      if (isRefreshing) return;
      isRefreshing = true;
      try {
        cachePromise = loadRatingsSummary();
        const loaded = await cachePromise;
        cache = loaded;
        setRatings(loaded);
        setError('');
      } catch (e) {
        setError(e.message);
      } finally {
        isRefreshing = false;
      }
    }

    function onChange() {
      refresh();
    }

    window.addEventListener('aqua_ratings_changed', onChange);
    return () => window.removeEventListener('aqua_ratings_changed', onChange);
  }, []);

  return { ratings, loading, error };
}
