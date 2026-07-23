import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n.jsx';
import { useConsent } from '../privacy/ConsentContext.jsx';
import { openNewsletterSignup } from './NewsletterSignup.jsx';

export default function Footer() {
  const { isEn, path } = useLanguage();
  const { openPreferences } = useConsent();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <Link className="footer__brand" to={path('/')} aria-label={isEn ? 'AQUA AI Tools home' : 'Início do AQUA AI Tools'}>
          <img src="/assets/branding/aqua-ai-tools-inline.svg" alt="" aria-hidden="true" />
          <span>{isEn ? 'A curated directory for discovering AI tools.' : 'Um diretório curado para descobrir ferramentas de IA.'}</span>
        </Link>
        <nav className="footer__links" aria-label={isEn ? 'Footer navigation' : 'Navegação de rodapé'}>
          <Link to={path('/sobre')}>{isEn ? 'About' : 'Sobre'}</Link>
          <Link to={path('/contacto')}>{isEn ? 'Contact' : 'Contacto'}</Link>
          <Link to={path('/consultoria')}>{isEn ? 'Consulting' : 'Consultoria'}</Link>
          <Link to={path('/privacidade')}>{isEn ? 'Privacy' : 'Privacidade'}</Link>
          <Link to={path('/termos')}>{isEn ? 'Terms' : 'Termos'}</Link>
          <button className="footer__privacyButton" type="button" onClick={openNewsletterSignup}>Newsletter</button>
          <button className="footer__privacyButton" type="button" onClick={openPreferences}>{isEn ? 'Privacy settings' : 'Definições de privacidade'}</button>
        </nav>
        <div className="footer__meta">
          <strong>AQUA AI Tools</strong>
          <span>AQUATICUS · 2026</span>
        </div>
      </div>
    </footer>
  );
}
