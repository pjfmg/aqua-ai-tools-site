import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { getInitials, useAuth } from '../auth/auth.jsx';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, isAuthed, signOut } = useAuth();

  if (!isAuthed) {
    return (
      <>
        <Hero title="Conta" subtitle="Precisas de entrar para ver esta página." badge="Acesso restrito" />
        <Section title="Entrar" subtitle="Cria uma conta (local) ou entra com email.">
          <div className="panel">
            <div className="form__actions" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--primary" to="/signup">
                Criar conta
              </Link>
              <Link className="btn btn--ghost" to="/signin">
                Entrar
              </Link>
            </div>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <Hero
        title="Conta"
        subtitle="Perfil e atalhos."
        badge={user?.email || ''}
        right={
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => {
              signOut();
              navigate('/', { replace: true });
            }}
          >
            Sign out
          </button>
        }
      />

      <Section title="Perfil" subtitle="Isto é guardado localmente no teu browser.">
        <div className="accountGrid">
          <div className="accountCard">
            <div className="accountAvatar">{getInitials(user?.name || user?.email)}</div>
            <div className="accountName">{user?.name || 'Sem nome'}</div>
            <div className="accountEmail">{user?.email}</div>
          </div>

          <div className="accountCard">
            <div className="accountCard__title">Atalhos</div>
            <div className="accountLinks">
              <Link className="btn btn--primary btn--block" to="/submeter">
                Submeter AI Tool
              </Link>
              <Link className="btn btn--ghost btn--block" to="/favoritas">
                Favoritas (lista atual)
              </Link>
              <Link className="btn btn--ghost btn--block" to="/visitadas">
                Visitadas (lista atual)
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
