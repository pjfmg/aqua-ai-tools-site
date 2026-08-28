import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdStrip from '../components/AdStrip.jsx';
import Footer from '../components/Footer.jsx';
import TopNav from '../components/TopNav.jsx';
import { LanguageProvider, useLanguage } from '../i18n.jsx';
import ConsentManager from '../privacy/ConsentManager.jsx';
import NewsletterSignup from '../components/NewsletterSignup.jsx';
import RouteMeta from '../components/RouteMeta.jsx';

function AppFrame() {
  const { isEn } = useLanguage();
  const { pathname } = useLocation();
  const isSignIn = pathname === '/signin' || pathname === '/en/signin';

  return (
    <div className={`appShell${isSignIn ? ' appShell--auth' : ''}`}>
      <RouteMeta />
      <a className="skipLink" href="#main-content">
        {isEn ? 'Skip to content' : 'Saltar para o conteúdo'}
      </a>
      {isSignIn ? null : <TopNav />}
      <ConsentManager />
      <main id="main-content" className="appMain" tabIndex={-1}>
        <Outlet />
      </main>
      {isSignIn ? null : <AdStrip />}
      {isSignIn ? null : <Footer />}
      {isSignIn ? null : <NewsletterSignup />}
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
