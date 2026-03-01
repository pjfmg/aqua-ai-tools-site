import React, { createContext, useContext } from 'react';
import { useRatingsSummary } from '../hooks/useRatings.js';

const RatingsContext = createContext({ ratings: {}, loading: true, error: '' });

export function RatingsProvider({ children }) {
  const { ratings, loading, error } = useRatingsSummary();
  return (
    <RatingsContext.Provider value={{ ratings, loading, error }}>
      {children}
    </RatingsContext.Provider>
  );
}

export function useRatings() {
  return useContext(RatingsContext);
}

