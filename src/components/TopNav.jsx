import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  const { isAuthed, user, signOut } = useAuth();

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
                <span className="topnav__profileText">{user?.name || 'Conta'}</span>
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
            <PillItem to="/">Home</PillItem>
            <PillItem to="/pro">Pro</PillItem>
            <PillItem to="/ferramentas">Ferramentas</PillItem>
            <PillItem to="/destaques">Destaques</PillItem>
            <PillItem to="/surpreende-me">Surpreende-me</PillItem>
            <PillItem to="/blog">Blog</PillItem>
            <PillItem to="/visitadas">Visitadas</PillItem>
            <PillItem to="/favoritas">Favoritas</PillItem>
            <PillItem to="/reviews">Reviews</PillItem>
            <PillItem to="/submeter">Submeter</PillItem>
            <PillItem to="/sugestoes">Sugestões</PillItem>
          </div>
        </div>
      </div>
    </nav>
  );
}
