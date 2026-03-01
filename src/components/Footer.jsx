import React from 'react';
import { NavLink } from 'react-router-dom';

function Item({ to, children }) {
  return (
    <NavLink to={to} className={({ isActive }) => `footer__link ${isActive ? 'is-active' : ''}`}>
      {children}
    </NavLink>
  );
}

export default function Footer() {
  return (
    <footer className="footer" aria-label="Rodapé">
      <div className="footer__inner">
        <Item to="/sobre">Sobre</Item>
        <span className="footer__sep">|</span>
        <Item to="/contacto">Contacto</Item>
        <span className="footer__sep">|</span>
        <Item to="/consultoria">Consultoria</Item>
        <span className="footer__sep">|</span>
        <Item to="/privacidade">Privacidade</Item>
        <span className="footer__sep">|</span>
        <Item to="/termos">Termos</Item>
      </div>
      <div className="footer__meta">AQUA AI Tools / AQUATICUS / 2026</div>
    </footer>
  );
}
