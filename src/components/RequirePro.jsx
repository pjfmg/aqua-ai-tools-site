import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/auth.jsx';
import Hero from './Hero.jsx';
import Section from './Section.jsx';

export default function RequirePro({ children, title = 'Área Pro' }) {
  const { isAuthed, billingLoaded, hasProAccess } = useAuth();

  if (!isAuthed) {
    return (
      <>
        <Hero title={title} subtitle="Precisas de entrar para continuar." badge="Acesso restrito" />
        <Section title="Entrar" subtitle="Cria conta ou entra antes de ativar o Pro.">
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

  if (!billingLoaded) {
    return (
      <>
        <Hero title={title} subtitle="A validar a tua subscrição." badge="A carregar" />
        <Section title="Aguarda" subtitle="Estamos a confirmar o teu acesso Pro no Airtable.">
          <div className="panel">
            <p className="note" style={{ margin: 0 }}>
              Isto demora apenas alguns instantes.
            </p>
          </div>
        </Section>
      </>
    );
  }

  if (!hasProAccess) {
    return (
      <>
        <Hero title={title} subtitle="Esta funcionalidade faz parte da subscrição Pro." badge="Upgrade necessário" />
        <Section title="Desbloquear" subtitle="Ativa o plano Pro para aceder a favoritos, histórico e reviews.">
          <div className="panel">
            <div className="form__actions" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--primary" to="/pro">
                Ver Pro
              </Link>
              <Link className="btn btn--ghost" to="/conta">
                Ir para conta
              </Link>
            </div>
          </div>
        </Section>
      </>
    );
  }

  return children;
}
