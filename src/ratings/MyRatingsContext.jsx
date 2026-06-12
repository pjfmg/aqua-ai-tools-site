import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'aqua_my_ratings_v1';
const MyRatingsContext = createContext(null);

function readRatings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeRatings(ratings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  } catch {
    // ignore unavailable storage
  }
}

export function MyRatingsProvider({ children }) {
  const [ratingsByToolKey, setRatingsByToolKey] = useState({});

  useEffect(() => {
    setRatingsByToolKey(readRatings());
  }, []);

  function setRatingLocal({ toolKey, rating }) {
    const key = String(toolKey || '').trim();
    const value = Number(rating);
    if (!key || !Number.isFinite(value) || value < 1 || value > 5) return false;

    setRatingsByToolKey((current) => {
      const next = { ...current, [key]: value };
      writeRatings(next);
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
