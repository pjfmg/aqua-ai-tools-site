import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/auth.jsx';
import Hero from './Hero.jsx';
import Section from './Section.jsx';
import { useLanguage } from '../i18n.jsx';

export default function RequirePro({ children, title = 'Área Pro' }) {
  const { path, isEn } = useLanguage();
  const { isAuthed, billingLoaded, hasProAccess } = useAuth();

  if (!isAuthed) {
    return (
      <>
        <Hero title={title} subtitle={isEn ? 'You need to sign in to continue.' : 'Precisas de entrar para continuar.'} badge={isEn ? 'Restricted access' : 'Acesso restrito'} />
        <Section title={isEn ? 'Sign in' : 'Entrar'} subtitle={isEn ? 'Create an account or sign in before activating Pro.' : 'Cria conta ou entra antes de ativar o Pro.'}>
          <div className="panel">
            <div className="form__actions" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--primary" to={path('/signup')}>
                {isEn ? 'Create account' : 'Criar conta'}
              </Link>
              <Link className="btn btn--ghost" to={path('/signin')}>
                {isEn ? 'Sign in' : 'Entrar'}
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
        <Hero title={title} subtitle={isEn ? 'Validating your subscription.' : 'A validar a tua subscrição.'} badge={isEn ? 'Loading' : 'A carregar'} />
        <Section title={isEn ? 'Please wait' : 'Aguarda'} subtitle={isEn ? 'We are confirming your Pro access.' : 'Estamos a confirmar o teu acesso Pro no Airtable.'}>
          <div className="panel">
            <p className="note" style={{ margin: 0 }}>
              {isEn ? 'This only takes a few moments.' : 'Isto demora apenas alguns instantes.'}
            </p>
          </div>
        </Section>
      </>
    );
  }

  if (!hasProAccess) {
    return (
      <>
        <Hero title={title} subtitle={isEn ? 'This feature is part of the Pro subscription.' : 'Esta funcionalidade faz parte da subscrição Pro.'} badge={isEn ? 'Upgrade required' : 'Upgrade necessário'} />
        <Section title={isEn ? 'Unlock' : 'Desbloquear'} subtitle={isEn ? 'Activate Pro to access favorites, history and reviews.' : 'Ativa o plano Pro para aceder a favoritos, histórico e reviews.'}>
          <div className="panel">
            <div className="form__actions" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--primary" to={path('/pro')}>
                {isEn ? 'View Pro' : 'Ver Pro'}
              </Link>
              <Link className="btn btn--ghost" to={path('/conta')}>
                {isEn ? 'Go to account' : 'Ir para conta'}
              </Link>
            </div>
          </div>
        </Section>
      </>
    );
  }

  return children;
}
