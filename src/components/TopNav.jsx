import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getLanguageSwitchPath, useLanguage } from '../i18n.jsx';

const NAV_ITEMS = [
  { to: '/', pt: 'Home', en: 'Home' },
  { to: '/pro', pt: 'Pro', en: 'Pro' },
  { to: '/ferramentas', pt: 'Ferramentas', en: 'Tools' },
  { to: '/destaques', pt: 'Destaques', en: 'Featured' },
  { to: '/surpreende-me', pt: 'Surpreende-me', en: 'Surprise me' },
  { to: '/blog', pt: 'Blog', en: 'Blog' },
  { to: '/visitadas', pt: 'Visitadas', en: 'Visited' },
  { to: '/favoritas', pt: 'Favoritas', en: 'Favorites' },
  { to: '/reviews', pt: 'Reviews', en: 'Reviews' },
  { to: '/submeter', pt: 'Submeter', en: 'Submit' },
  { to: '/sugestoes', pt: 'Sugestões', en: 'Suggestions' },
];

export default function TopNav() {
  const location = useLocation();
  const { isEn, path } = useLanguage();
  const languagePath = getLanguageSwitchPath(location.pathname, isEn ? 'pt' : 'en');

  return (
    <header className="topnav">
      <div className="topnav__inner">
        <div className="topnav__row">
          <Link className="topnav__brand" to={path('/')}>
            <img className="topnav__logo" src="/assets/branding/aqua-ai-tools-inline.svg" alt="AQUA AI Tools" />
          </Link>

          <div className="topnav__auth">
            <Link className="btn btn--ghost btn--small" to={languagePath}>
              {isEn ? 'PT' : 'EN'}
            </Link>
            <Link className="btn btn--ghost btn--small" to={path('/signin')}>
              {isEn ? 'Sign in' : 'Entrar'}
            </Link>
            <Link className="btn btn--primary btn--small" to={path('/signup')}>
              {isEn ? 'SignUp' : 'SignUp'}
            </Link>
          </div>
        </div>

        <nav className="topnav__pill" aria-label={isEn ? 'Main navigation' : 'Navegação principal'}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => `topnav__link ${isActive ? 'is-active' : ''}`}
              to={path(item.to)}
            >
              {isEn ? item.en : item.pt}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
