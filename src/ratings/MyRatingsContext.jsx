import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/auth.jsx';

function storageKeyForUser(email) {
  const safe = String(email || '').trim().toLowerCase();
  return `aqua_tool_ratings_v1:${safe || 'anon'}`;
}

function safeParseObject(raw) {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function readRatings(email) {
  if (typeof window === 'undefined') return {};
  try {
    const key = storageKeyForUser(email);
    return safeParseObject(window.localStorage.getItem(key));
  } catch {
    return {};
  }
}

function writeRatings(email, obj) {
  if (typeof window === 'undefined') return;
  try {
    const key = storageKeyForUser(email);
    window.localStorage.setItem(key, JSON.stringify(obj || {}));
  } catch {
    // ignore (storage may be unavailable)
  }
}

const MyRatingsContext = createContext({
  ratingsByToolKey: {},
  setRatingLocal: () => false,
});

export function MyRatingsProvider({ children }) {
  const { user } = useAuth();
  const email = user?.email || '';

  const [ratingsByToolKey, setRatingsByToolKey] = useState({});

  useEffect(() => {
    setRatingsByToolKey(readRatings(email));
  }, [email]);

  useEffect(() => {
    function refresh() {
      setRatingsByToolKey(readRatings(email));
    }

    function onStorage(e) {
      if (!e?.key) return;
      if (e.key === storageKeyForUser(email)) refresh();
    }

    window.addEventListener('storage', onStorage);
    window.addEventListener('aqua_my_rating_changed', refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('aqua_my_rating_changed', refresh);
    };
  }, [email]);

  const value = useMemo(() => {
    return {
      ratingsByToolKey,
      setRatingLocal: ({ toolKey, rating }) => {
        const r = Number(rating);
        if (!toolKey) return false;
        if (!Number.isFinite(r) || r < 1 || r > 5) return false;
        const next = { ...(ratingsByToolKey || {}) };
        next[String(toolKey)] = Math.round(r);
        setRatingsByToolKey(next);
        writeRatings(email, next);
        window.dispatchEvent(new CustomEvent('aqua_my_rating_changed', { detail: { toolKey } }));
        return true;
      },
    };
  }, [ratingsByToolKey, email]);

  return <MyRatingsContext.Provider value={value}>{children}</MyRatingsContext.Provider>;
}

export function useMyRatings() {
  return useContext(MyRatingsContext);
}
