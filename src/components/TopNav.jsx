import React, { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getLanguageSwitchPath, useLanguage } from '../i18n.jsx';
import { useAuth } from '../auth/auth.jsx';

const PRIMARY_NAV_ITEMS = [
  { to: '/', pt: 'Home', en: 'Home' },
  { to: '/pro', pt: 'Pro', en: 'Pro' },
  { to: '/ferramentas', pt: 'Ferramentas', en: 'Tools' },
  { to: '/destaques', pt: 'Destaques', en: 'Featured' },
  { to: '/surpreende-me', pt: 'Surpreende-me', en: 'Surprise me' },
  { to: '/blog', pt: 'Blog', en: 'Blog' },
];

const SECONDARY_NAV_ITEMS = [
  { to: '/visitadas', pt: 'Visitadas', en: 'Visited' },
  { to: '/favoritas', pt: 'Favoritas', en: 'Favorites' },
  { to: '/reviews', pt: 'Reviews', en: 'Reviews' },
  { to: '/submeter', pt: 'Submeter', en: 'Submit' },
  { to: '/sugestoes', pt: 'Sugestões', en: 'Suggestions' },
  { to: '/definicoes', pt: 'Definições', en: 'Settings' },
];

export default function TopNav() {
  const location = useLocation();
  const { isEn, path } = useLanguage();
  const { isAuthed } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const mobileMenuId = useId();
  const moreMenuId = useId();
  const mobileMenuButtonRef = useRef(null);
  const moreMenuButtonRef = useRef(null);
  const moreMenuRef = useRef(null);
  const languagePath = getLanguageSwitchPath(location.pathname, isEn ? 'pt' : 'en');
  const secondaryActive = SECONDARY_NAV_ITEMS.some((item) => path(item.to) === location.pathname);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen && !moreMenuOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        if (moreMenuOpen) {
          setMoreMenuOpen(false);
          moreMenuButtonRef.current?.focus();
          return;
        }
        setMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen, moreMenuOpen]);

  useEffect(() => {
    if (!moreMenuOpen) return undefined;
    function onPointerDown(event) {
      if (!moreMenuRef.current?.contains(event.target)) setMoreMenuOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [moreMenuOpen]);

  function renderNavLink(item) {
    return (
      <NavLink
        key={item.to}
        className={({ isActive }) => `topnav__link ${isActive ? 'is-active' : ''}`}
        to={path(item.to)}
      >
        {isEn ? item.en : item.pt}
      </NavLink>
    );
  }

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
            {PRIMARY_NAV_ITEMS.map(renderNavLink)}
            <div ref={moreMenuRef} className={`topnav__more${moreMenuOpen ? ' is-open' : ''}`}>
              <button
                ref={moreMenuButtonRef}
                className={`topnav__link topnav__moreButton${secondaryActive ? ' is-active' : ''}`}
                type="button"
                aria-expanded={moreMenuOpen}
                aria-controls={moreMenuId}
                onClick={() => setMoreMenuOpen((open) => !open)}
              >
                {isEn ? 'More' : 'Mais'}
              </button>
              <div
                id={moreMenuId}
                className="topnav__moreMenu"
                role="group"
                aria-label={isEn ? 'More destinations' : 'Mais destinos'}
              >
                {SECONDARY_NAV_ITEMS.map(renderNavLink)}
              </div>
            </div>
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
