import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { getInitials, useAuth } from '../auth/auth.jsx';
import { createBillingPortalSession, fetchCheckoutSessionStatus } from '../lib/billing.js';
import { getSubscriptionLabel, hasProAccess as userHasProAccess, PRO_FEATURES } from '../lib/subscription.js';
import { useLanguage } from '../i18n.jsx';

const PRO_FEATURES_EN = {
  'Guardar favoritas': 'Save favorites',
  'Histórico de ferramentas visitadas': 'Visited tools history',
  'Avaliação pessoal de ferramentas': 'Personal tool ratings',
  'Acesso à página Reviews': 'Access to the Reviews page',
};

function formatDate(value, locale = 'pt-PT') {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { path, isEn } = useLanguage();
  const { user, isAuthed, setSubscription, signOut } = useAuth();
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState('');
  const [billingNotice, setBillingNotice] = useState('');
  const processedSessionIdRef = useRef('');

  useEffect(() => {
    if (!isAuthed) return;
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    const checkout = params.get('checkout');
    if (!sessionId || checkout !== 'success') return;
    if (processedSessionIdRef.current === sessionId) return;
    processedSessionIdRef.current = sessionId;

    let ignore = false;
    setBillingLoading(true);
    setBillingError('');
    setBillingNotice(isEn ? 'Confirming subscription…' : 'A confirmar subscrição…');

    fetchCheckoutSessionStatus(sessionId)
      .then((result) => {
        if (ignore) return;
        const paidEmail = String(result?.subscription?.customerEmail || '').trim().toLowerCase();
        if (paidEmail && paidEmail !== String(user?.email || '').trim().toLowerCase()) {
          throw new Error(isEn ? 'The returned subscription does not match the current user' : 'A subscrição devolvida não corresponde ao utilizador atual');
        }
        if (result?.subscription) setSubscription(result.subscription);
        setBillingNotice(isEn ? 'Pro subscription active.' : 'Subscrição Pro ativa.');
        navigate(path('/conta'), { replace: true });
      })
      .catch((err) => {
        if (ignore) return;
        processedSessionIdRef.current = '';
        setBillingError(err.message || (isEn ? 'Could not confirm the payment' : 'Não foi possível confirmar o pagamento'));
      })
      .finally(() => {
        if (ignore) return;
        setBillingLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [isAuthed, location.search, navigate, setSubscription, user?.email]);

  async function onOpenPortal() {
    if (!user?.subscription?.customerId) return;
    setBillingLoading(true);
    setBillingError('');
    try {
      const result = await createBillingPortalSession({ customerId: user.subscription.customerId });
      if (!result?.url) throw new Error(isEn ? 'Portal returned no URL' : 'Portal sem URL');
      window.location.href = result.url;
    } catch (err) {
      setBillingError(err.message || (isEn ? 'Could not open billing' : 'Não foi possível abrir a faturação'));
      setBillingLoading(false);
    }
  }

  if (!isAuthed) {
    return (
      <>
        <Hero title={isEn ? 'Account' : 'Conta'} subtitle={isEn ? 'You need to sign in to see this page.' : 'Precisas de entrar para ver esta página.'} badge={isEn ? 'Restricted access' : 'Acesso restrito'} />
        <Section title={isEn ? 'Sign in' : 'Entrar'} subtitle={isEn ? 'Create a local account or sign in with email.' : 'Cria uma conta (local) ou entra com email.'}>
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

  const proActive = userHasProAccess(user);
  const subscription = user?.subscription || null;

  return (
    <>
      <Hero
        title={isEn ? 'Account' : 'Conta'}
        subtitle={isEn ? 'Profile, subscription and shortcuts.' : 'Perfil, subscrição e atalhos.'}
        badge={user?.email || ''}
        right={
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => {
              signOut();
              navigate(path('/'), { replace: true });
            }}
          >
            {isEn ? 'Sign out' : 'Sair'}
          </button>
        }
      />

      <Section title={isEn ? 'Profile' : 'Perfil'} subtitle={isEn ? 'The account is still stored locally, but the subscription is validated through checkout.' : 'A conta continua guardada localmente, mas a subscrição é validada no checkout.'}>
        <div className="accountGrid">
          <div className="accountCard">
            <div className="accountAvatar">{getInitials(user?.name || user?.email)}</div>
            <div className="accountName">{user?.name || (isEn ? 'No name' : 'Sem nome')}</div>
            <div className="accountEmail">{user?.email}</div>
            <div className={`accountPlan ${proActive ? 'is-pro' : ''}`}>{proActive ? (isEn ? 'Pro active' : getSubscriptionLabel(user)) : 'Starter'}</div>
          </div>

          <div className="accountCard">
            <div className="accountCard__title">{isEn ? 'Subscription' : 'Subscrição'}</div>
            <div className="accountMeta">
              <div>
                <strong>{isEn ? 'Status' : 'Estado'}:</strong> {subscription?.status || (isEn ? 'no subscription' : 'sem subscrição')}
              </div>
              <div>
                <strong>{isEn ? 'Renewal' : 'Renovação'}:</strong> {formatDate(subscription?.currentPeriodEnd, isEn ? 'en-US' : 'pt-PT')}
              </div>
            </div>
            <div className="form__actions" style={{ justifyContent: 'flex-start' }}>
              {proActive ? (
                <button className="btn btn--primary" type="button" onClick={onOpenPortal} disabled={billingLoading}>
                  {billingLoading ? (isEn ? 'Opening…' : 'A abrir…') : (isEn ? 'Manage billing' : 'Gerir faturação')}
                </button>
              ) : (
                <Link className="btn btn--primary" to={path('/pro')}>
                  {isEn ? 'Activate Pro' : 'Ativar Pro'}
                </Link>
              )}
              <Link className="btn btn--ghost" to={path('/pro')}>
                {isEn ? 'View plans' : 'Ver planos'}
              </Link>
            </div>
            {billingNotice ? <p className="note" style={{ marginTop: 10 }}>{billingNotice}</p> : null}
            {billingError ? <p className="note" style={{ marginTop: 10 }}>{billingError}</p> : null}
          </div>
        </div>
      </Section>

      <Section title={isEn ? 'Features' : 'Funcionalidades'} subtitle={isEn ? 'What becomes available with Pro.' : 'O que fica disponível com a subscrição Pro.'}>
        <div className="featureList">
          {PRO_FEATURES.map((feature) => (
            <div key={feature} className={`featureItem ${proActive ? 'is-unlocked' : ''}`}>
              {isEn ? PRO_FEATURES_EN[feature] || feature : feature}
            </div>
          ))}
        </div>
      </Section>

      <Section title={isEn ? 'Shortcuts' : 'Atalhos'} subtitle={isEn ? 'Quick navigation to the main account areas.' : 'Navegação rápida para as áreas principais da tua conta.'}>
        <div className="accountLinks">
          <Link className="btn btn--primary btn--block" to={path('/submeter')}>
            {isEn ? 'Submit AI tool' : 'Submeter AI Tool'}
          </Link>
          <Link className="btn btn--ghost btn--block" to={proActive ? path('/favoritas') : path('/pro')}>
            {proActive ? (isEn ? 'Favorites' : 'Favoritas') : (isEn ? 'Favorites (Pro)' : 'Favoritas (Pro)')}
          </Link>
          <Link className="btn btn--ghost btn--block" to={proActive ? path('/visitadas') : path('/pro')}>
            {proActive ? (isEn ? 'Visited' : 'Visitadas') : (isEn ? 'Visited (Pro)' : 'Visitadas (Pro)')}
          </Link>
          <Link className="btn btn--ghost btn--block" to={proActive ? path('/reviews') : path('/pro')}>
            {proActive ? 'Reviews' : 'Reviews (Pro)'}
          </Link>
        </div>
      </Section>
    </>
  );
}
