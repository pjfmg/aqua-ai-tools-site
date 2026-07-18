import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/auth.jsx';

const STORAGE_KEY = 'aqua_my_ratings_v1';
const MyRatingsContext = createContext(null);

function getStorageKey(userId) {
  const id = String(userId || '').trim();
  return id ? `${STORAGE_KEY}:${id}` : '';
}

function readRatings(userId) {
  try {
    const storageKey = getStorageKey(userId);
    if (!storageKey) return {};
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeRatings(userId, ratings) {
  try {
    const storageKey = getStorageKey(userId);
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(ratings));
  } catch {
    // ignore unavailable storage
  }
}

export function MyRatingsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id || '';
  const [ratingsByToolKey, setRatingsByToolKey] = useState({});

  useEffect(() => {
    setRatingsByToolKey(readRatings(userId));
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore unavailable storage while removing the legacy global key.
    }
  }, [userId]);

  function setRatingLocal({ toolKey, rating }) {
    const key = String(toolKey || '').trim();
    const value = Number(rating);
    if (!userId || !key || !Number.isFinite(value) || value < 1 || value > 5) return false;

    setRatingsByToolKey((current) => {
      const next = { ...current, [key]: value };
      writeRatings(userId, next);
      return next;
    });
    return true;
  }

  const value = useMemo(
    () => ({
      ratingsByToolKey,
      setRatingLocal,
    }),
    [ratingsByToolKey],
  );

  return <MyRatingsContext.Provider value={value}>{children}</MyRatingsContext.Provider>;
}

export function useMyRatings() {
  const ctx = useContext(MyRatingsContext);
  if (!ctx) throw new Error('useMyRatings must be used within <MyRatingsProvider>');
  return ctx;
}
