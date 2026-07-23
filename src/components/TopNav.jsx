import React, { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getLanguageSwitchPath, useLanguage } from '../i18n.jsx';
import { useAuth } from '../auth/auth.jsx';

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
  const { isAuthed } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuId = useId();
  const mobileMenuButtonRef = useRef(null);
  const languagePath = getLanguageSwitchPath(location.pathname, isEn ? 'pt' : 'en');

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="topnav">
      <div className="topnav__inner">
        <div className="topnav__row">
          <Link className="topnav__brand" to={path('/')}>
            <img className="topnav__logo" src="/assets/branding/aqua-ai-tools-inline.svg" alt="AQUA AI Tools" />
          </Link>

          <nav
            id={mobileMenuId}
            className={`topnav__pill${mobileMenuOpen ? ' is-open' : ''}`}
            aria-label={isEn ? 'Main navigation' : 'Navegação principal'}
          >
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

          <div className="topnav__auth">
            <Link
              className="btn btn--ghost btn--small topnav__language"
              to={languagePath}
              aria-label={isEn ? 'Mudar idioma para português' : 'Switch language to English'}
            >
              {isEn ? 'PT' : 'EN'}
            </Link>
            {isAuthed ? (
              <Link className="btn btn--primary btn--small topnav__account" to={path('/conta')}>
                {isEn ? 'Account' : 'Conta'}
              </Link>
            ) : (
              <>
                <Link className="btn btn--ghost btn--small topnav__signin" to={path('/signin')}>
                  {isEn ? 'Sign in' : 'Entrar'}
                </Link>
                <Link className="btn btn--primary btn--small topnav__signup" to={path('/signup')}>
                  {isEn ? 'Sign up' : 'Criar conta'}
                </Link>
              </>
            )}
          </div>

          <button
            ref={mobileMenuButtonRef}
            className="topnav__menuButton"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls={mobileMenuId}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? (isEn ? 'Close menu' : 'Fechar menu') : 'Menu'}
          </button>
        </div>
      </div>
    </header>
  );
}
