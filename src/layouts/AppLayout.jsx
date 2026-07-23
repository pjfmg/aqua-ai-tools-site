import React from 'react';
import { Outlet } from 'react-router-dom';
import AdStrip from '../components/AdStrip.jsx';
import Footer from '../components/Footer.jsx';
import TopNav from '../components/TopNav.jsx';
import { LanguageProvider, useLanguage } from '../i18n.jsx';
import ConsentManager from '../privacy/ConsentManager.jsx';
import NewsletterSignup from '../components/NewsletterSignup.jsx';

function AppFrame() {
  const { isEn } = useLanguage();

  return (
    <div className="appShell">
      <a className="skipLink" href="#main-content">
        {isEn ? 'Skip to content' : 'Saltar para o conteúdo'}
      </a>
      <TopNav />
      <main id="main-content" className="appMain" tabIndex={-1}>
        <Outlet />
      </main>
      <AdStrip />
      <Footer />
      <ConsentManager />
      <NewsletterSignup />
    </div>
  );
}

export default function AppLayout() {
  return (
    <LanguageProvider>
      <AppFrame />
    </LanguageProvider>
  );
}
