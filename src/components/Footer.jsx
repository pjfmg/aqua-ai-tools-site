import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n.jsx';

export default function Footer() {
  const { isEn, path } = useLanguage();

  return (
    <footer className="footer">
      <nav className="footer__links" aria-label={isEn ? 'Footer navigation' : 'Navegação de rodapé'}>
        <Link to={path('/sobre')}>{isEn ? 'About' : 'Sobre'}</Link>
        <Link to={path('/contacto')}>{isEn ? 'Contact' : 'Contacto'}</Link>
        <Link to={path('/consultoria')}>{isEn ? 'Consulting' : 'Consultoria'}</Link>
        <Link to={path('/privacidade')}>{isEn ? 'Privacy' : 'Privacidade'}</Link>
        <Link to={path('/termos')}>{isEn ? 'Terms' : 'Termos'}</Link>
      </nav>
      <strong>AQUA AI Tools / AQUATICUS / 2026</strong>
    </footer>
  );
}
