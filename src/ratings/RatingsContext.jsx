import React, { createContext, useContext, useMemo, useState } from 'react';

const RatingsContext = createContext(null);

export function RatingsProvider({ children }) {
  const [ratings, setRatings] = useState({});

  const value = useMemo(
    () => ({
      ratings,
      setRatings,
    }),
    [ratings],
  );

  return <RatingsContext.Provider value={value}>{children}</RatingsContext.Provider>;
}

export function useRatings() {
  const ctx = useContext(RatingsContext);
  if (!ctx) throw new Error('useRatings must be used within <RatingsProvider>');
  return ctx;
}
