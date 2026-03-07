import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getInitials, useAuth } from '../auth/auth.jsx';

function Item({ to, children }) {
  return (
    <NavLink to={to} className={({ isActive }) => `topnav__link ${isActive ? 'is-active' : ''}`}>
      {children}
    </NavLink>
  );
}

function PillItem({ to, children }) {
  return (
    <NavLink to={to} className={({ isActive }) => `pillNav__item ${isActive ? 'is-active' : ''}`}>
      {children}
    </NavLink>
  );
}

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthed, hasProAccess, user, signOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryLinks = useMemo(
    () => [
      { to: '/', label: 'Home' },
      { to: '/pro', label: 'Pro' },
      { to: '/ferramentas', label: 'Ferramentas' },
      { to: '/destaques', label: 'Destaques' },
    ],
    [],
  );

  const extraLinks = useMemo(
    () => [
      { to: '/surpreende-me', label: 'Surpreende-me' },
      { to: '/blog', label: 'Blog' },
      { to: '/visitadas', label: 'Visitadas' },
      { to: '/favoritas', label: 'Favoritas' },
      { to: '/reviews', label: 'Reviews' },
      { to: '/submeter', label: 'Submeter' },
      { to: '/sugestoes', label: 'Sugestões' },
    ],
    [],
  );

  useEffect(() => {
    // Close the mobile menu on navigation.
    setMoreOpen(false);
  }, [location.pathname]);

  return (
    <nav className="topnav" aria-label="Menu principal">
      <div className="topnav__inner">
        <div className="topnav__row">
          <div className="topnav__brand">
            <span className="topnav__spark">✨</span>
            <span className="topnav__name">AQUA AI Tools</span>
          </div>

          <div className="topnav__auth">
          {isAuthed ? (
            <>
              <NavLink to="/conta" className="topnav__profile" title={user?.email || 'Conta'}>
                <span className="topnav__avatar">{getInitials(user?.name || user?.email)}</span>
                <span className="topnav__profileText">
                  {user?.name || 'Conta'}
                  <span className={`topnav__plan ${hasProAccess ? 'is-pro' : ''}`}>{hasProAccess ? 'Pro' : 'Starter'}</span>
                </span>
              </NavLink>
              <button
                className="topnav__signout"
                type="button"
                onClick={() => {
                  signOut();
                  navigate('/', { replace: true });
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/signin" className="btn btn--ghost btn--sm">
                Entrar
              </NavLink>
              <NavLink to="/signup" className="btn btn--primary btn--sm">
                SignUp
              </NavLink>
            </>
          )}
          </div>
        </div>

        <div className="pillNav" aria-label="Atalhos">
          <div className="pillNav__scroll">
            {primaryLinks.map((l) => (
              <PillItem key={l.to} to={l.to}>
                {l.label}
              </PillItem>
            ))}

            <button
              className="pillNav__item pillNav__moreBtn"
              type="button"
              aria-haspopup="dialog"
              aria-expanded={moreOpen ? 'true' : 'false'}
              onClick={() => setMoreOpen((v) => !v)}
            >
              Mais
            </button>

            <span className="pillNav__extra">
              {extraLinks.map((l) => (
                <PillItem key={l.to} to={l.to}>
                  {l.label}
                </PillItem>
              ))}
            </span>
          </div>
        </div>
      </div>

      {moreOpen ? (
        <div
          className="pillNav__overlay"
          role="dialog"
          aria-label="Mais opções"
          aria-modal="true"
          onClick={() => setMoreOpen(false)}
        >
          <div className="pillNav__sheet" onClick={(e) => e.stopPropagation()}>
            <div className="pillNav__sheetTitle">Menu</div>
            <div className="pillNav__sheetLinks">
              {extraLinks.map((l) => (
                <NavLink key={l.to} to={l.to} className="pillNav__sheetLink">
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
