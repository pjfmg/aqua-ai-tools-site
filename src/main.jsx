import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './auth/auth.jsx';
import { MyRatingsProvider } from './ratings/MyRatingsContext.jsx';
import { RatingsProvider } from './ratings/RatingsContext.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RatingsProvider>
        <MyRatingsProvider>
          <App />
        </MyRatingsProvider>
      </RatingsProvider>
    </AuthProvider>
  </React.StrictMode>,
);
