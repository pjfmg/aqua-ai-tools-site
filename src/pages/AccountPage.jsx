import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { getInitials, useAuth } from '../auth/auth.jsx';
import { fetchCheckoutSessionStatus } from '../lib/billing.js';
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

  if (!isAuthed) {
    return (
      <>
        <Hero title={isEn ? 'Account' : 'Conta'} subtitle={isEn ? 'Explore an example profile without loading personal data.' : 'Explora um perfil de exemplo sem carregar dados pessoais.'} badge={isEn ? 'Temporary preview' : 'Pré-visualização temporária'} />
        <Section title={isEn ? 'Example profile' : 'Perfil de exemplo'} subtitle={isEn ? 'Your real profile and subscription require sign-in.' : 'O teu perfil e subscrição reais exigem entrada na conta.'}>
          <div className="accountGrid" data-testid="guest-account-preview">
            <div className="accountCard"><div className="accountAvatar">IA</div><div className="accountName">{isEn ? 'Example visitor' : 'Visitante de exemplo'}</div><div className="accountPlan">Starter · {isEn ? 'example' : 'exemplo'}</div></div>
            <div className="accountCard"><div className="accountCard__title">{isEn ? 'Subscription' : 'Subscrição'}</div><p className="note">{isEn ? 'No subscription is active in this preview. No private account data is shown.' : 'Nenhuma subscrição está ativa nesta visita. Não são apresentados dados privados.'}</p><Link className="btn btn--ghost" to={path('/pro')}>{isEn ? 'Compare plans' : 'Comparar planos'}</Link></div>
          </div>
        </Section>
        <Section title={isEn ? 'Explore account areas' : 'Explorar áreas da conta'}>
          <div className="accountLinks">
            <Link className="btn btn--ghost btn--block" to={path('/favoritas')}>{isEn ? 'Favorites preview' : 'Exemplo de favoritas'}</Link>
            <Link className="btn btn--ghost btn--block" to={path('/visitadas')}>{isEn ? 'Visited preview' : 'Exemplo de visitadas'}</Link>
            <Link className="btn btn--ghost btn--block" to={path('/reviews')}>{isEn ? 'Reviews preview' : 'Exemplo de avaliações'}</Link>
            <Link className="btn btn--ghost btn--block" to={path('/submeter')}>{isEn ? 'Try a submission' : 'Experimentar submissão'}</Link>
          </div>
          <p className="note">{isEn ? 'Examples are temporary and are not saved or sent.' : 'Os exemplos são temporários e não são guardados nem enviados.'}</p>
          <Link className="btn btn--primary" to={path('/signin')}>{isEn ? 'Sign in for your account' : 'Entrar para aceder à tua conta'}</Link>
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
            onClick={async () => {
              await signOut();
              navigate(path('/'), { replace: true });
            }}
          >
            {isEn ? 'Sign out' : 'Sair'}
          </button>
        }
      />

      <Section title={isEn ? 'Profile' : 'Perfil'} subtitle={isEn ? 'Your identity is validated by Supabase Auth and billing is checked on the server.' : 'A tua identidade é validada pelo Supabase Auth e a subscrição é verificada no servidor.'}>
        <div className="accountGrid">
          <div className="accountCard">
            <div className="accountAvatar">{getInitials(user?.name || user?.email)}</div>
            <div className="accountName">{user?.name || (isEn ? 'No name' : 'Sem nome')}</div>
            <div className="accountEmail">{user?.email}</div>
            <div className={`accountPlan ${proActive ? 'is-pro' : ''}`}>{isEn ? 'AI Tools plan: ' : 'Plano AI Tools: '}{proActive ? (isEn ? 'Pro active' : getSubscriptionLabel(user)) : 'Starter'}</div>
          </div>

          <div className="accountCard">
            <div className="accountCard__title">{isEn ? 'AI Tools subscription' : 'Subscrição AI Tools'}</div>
            <p className="note">{isEn ? 'This account identifies you in AI Tools. The AI Tools plan is separate; signing in does not activate Pro.' : 'Esta conta identifica-te no AI Tools. O plano desta app é separado; entrar não ativa o Pro.'}</p>
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
                <span className="note" role="status">
                  {isEn
                    ? 'Billing management is temporarily unavailable while secure authentication is implemented.'
                    : 'A gestão de faturação está temporariamente indisponível enquanto implementamos autenticação segura.'}
                </span>
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
