import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { AuthProvider } from './auth/auth.jsx';
import { RatingsProvider } from './ratings/RatingsContext.jsx';
import { MyRatingsProvider } from './ratings/MyRatingsContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
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
