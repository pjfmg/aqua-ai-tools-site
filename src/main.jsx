import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './auth/auth.jsx';
import { MyRatingsProvider } from './ratings/MyRatingsContext.jsx';
import { RatingsProvider } from './ratings/RatingsContext.jsx';
import './styles.css';
import { ConsentProvider } from './privacy/ConsentContext.jsx';
import { registerAquaServiceWorker } from './pwa/registerServiceWorker.js';

function mountApp() {
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ConsentProvider>
        <AuthProvider>
          <RatingsProvider>
            <MyRatingsProvider><App /></MyRatingsProvider>
          </RatingsProvider>
        </AuthProvider>
      </ConsentProvider>
    </React.StrictMode>,
  );
}

if (document.documentElement.classList.contains('aqua-entry-active')) {
  window.addEventListener('aqua-entry-finished', mountApp, { once: true });
} else {
  mountApp();
}

registerAquaServiceWorker();
