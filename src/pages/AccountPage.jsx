import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { getInitials, useAuth } from '../auth/auth.jsx';
import { createBillingPortalSession, fetchCheckoutSessionStatus } from '../lib/billing.js';
import { getSubscriptionLabel, hasProAccess as userHasProAccess, PRO_FEATURES } from '../lib/subscription.js';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
    setBillingNotice('A confirmar subscrição…');

    fetchCheckoutSessionStatus(sessionId)
      .then((result) => {
        if (ignore) return;
        const paidEmail = String(result?.subscription?.customerEmail || '').trim().toLowerCase();
        if (paidEmail && paidEmail !== String(user?.email || '').trim().toLowerCase()) {
          throw new Error('A subscrição devolvida não corresponde ao utilizador atual');
        }
        if (result?.subscription) setSubscription(result.subscription);
        setBillingNotice('Subscrição Pro ativa.');
        navigate('/conta', { replace: true });
      })
      .catch((err) => {
        if (ignore) return;
        processedSessionIdRef.current = '';
        setBillingError(err.message || 'Não foi possível confirmar o pagamento');
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
      if (!result?.url) throw new Error('Portal sem URL');
      window.location.href = result.url;
    } catch (err) {
      setBillingError(err.message || 'Não foi possível abrir a faturação');
      setBillingLoading(false);
    }
  }

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

  const proActive = userHasProAccess(user);
  const subscription = user?.subscription || null;

  return (
    <>
      <Hero
        title="Conta"
        subtitle="Perfil, subscrição e atalhos."
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

      <Section title="Perfil" subtitle="A conta continua guardada localmente, mas a subscrição é validada no checkout.">
        <div className="accountGrid">
          <div className="accountCard">
            <div className="accountAvatar">{getInitials(user?.name || user?.email)}</div>
            <div className="accountName">{user?.name || 'Sem nome'}</div>
            <div className="accountEmail">{user?.email}</div>
            <div className={`accountPlan ${proActive ? 'is-pro' : ''}`}>{getSubscriptionLabel(user)}</div>
          </div>

          <div className="accountCard">
            <div className="accountCard__title">Subscrição</div>
            <div className="accountMeta">
              <div>
                <strong>Estado:</strong> {subscription?.status || 'sem subscrição'}
              </div>
              <div>
                <strong>Renovação:</strong> {formatDate(subscription?.currentPeriodEnd)}
              </div>
            </div>
            <div className="form__actions" style={{ justifyContent: 'flex-start' }}>
              {proActive ? (
                <button className="btn btn--primary" type="button" onClick={onOpenPortal} disabled={billingLoading}>
                  {billingLoading ? 'A abrir…' : 'Gerir faturação'}
                </button>
              ) : (
                <Link className="btn btn--primary" to="/pro">
                  Ativar Pro
                </Link>
              )}
              <Link className="btn btn--ghost" to="/pro">
                Ver planos
              </Link>
            </div>
            {billingNotice ? <p className="note" style={{ marginTop: 10 }}>{billingNotice}</p> : null}
            {billingError ? <p className="note" style={{ marginTop: 10 }}>{billingError}</p> : null}
          </div>
        </div>
      </Section>

      <Section title="Funcionalidades" subtitle="O que fica disponível com a subscrição Pro.">
        <div className="featureList">
          {PRO_FEATURES.map((feature) => (
            <div key={feature} className={`featureItem ${proActive ? 'is-unlocked' : ''}`}>
              {feature}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Atalhos" subtitle="Navegação rápida para as áreas principais da tua conta.">
        <div className="accountLinks">
          <Link className="btn btn--primary btn--block" to="/submeter">
            Submeter AI Tool
          </Link>
          <Link className="btn btn--ghost btn--block" to={proActive ? '/favoritas' : '/pro'}>
            {proActive ? 'Favoritas' : 'Favoritas (Pro)'}
          </Link>
          <Link className="btn btn--ghost btn--block" to={proActive ? '/visitadas' : '/pro'}>
            {proActive ? 'Visitadas' : 'Visitadas (Pro)'}
          </Link>
          <Link className="btn btn--ghost btn--block" to={proActive ? '/reviews' : '/pro'}>
            {proActive ? 'Reviews' : 'Reviews (Pro)'}
          </Link>
        </div>
      </Section>
    </>
  );
}
