import React from 'react';
import { Outlet } from 'react-router-dom';
import AdStrip from '../components/AdStrip.jsx';
import Footer from '../components/Footer.jsx';
import TopNav from '../components/TopNav.jsx';
import { LanguageProvider } from '../i18n.jsx';

export default function AppLayout() {
  return (
    <LanguageProvider>
      <div className="appShell">
        <TopNav />
        <main className="appMain">
          <Outlet />
        </main>
        <AdStrip />
        <Footer />
      </div>
    </LanguageProvider>
  );
}
