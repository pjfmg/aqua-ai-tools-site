import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import AdStrip from '../components/AdStrip.jsx';
import Footer from '../components/Footer.jsx';
import TopNav from '../components/TopNav.jsx';
import { LanguageProvider, useLanguage } from '../i18n.jsx';
import ConsentManager from '../privacy/ConsentManager.jsx';
import NewsletterSignup from '../components/NewsletterSignup.jsx';
import { useAuth } from '../auth/auth.jsx';

function AppFrame() {
  const { isEn } = useLanguage();
  const { guestMode } = useAuth();
  return (
    <div className="appShell">
      <TopNav />
      {guestMode ? <div className="guestModeBanner" role="status">{isEn ? 'Guest visit · examples are temporary; account data, submissions and purchases are unavailable.' : 'Visita sem conta · os exemplos são temporários; dados da conta, submissões e compras estão indisponíveis.'} <Link to={isEn ? '/en/signin' : '/signin'}>{isEn ? 'Sign in' : 'Entrar'}</Link></div> : null}
      <main className="appMain">
        <Outlet />
      </main>
      <AdStrip />
      <Footer />
      <ConsentManager />
      {guestMode ? null : <NewsletterSignup />}
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
