import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useAuth } from '../auth/auth.jsx';
import { createCheckoutSession } from '../lib/billing.js';
import { PRO_FEATURES, STARTER_FEATURES, SUBSCRIPTION_PLAN } from '../lib/subscription.js';
import { useLanguage } from '../i18n.jsx';

function SubscribeButton() {
  const location = useLocation();
  const { path, isEn } = useLanguage();
  const { isAuthed, hasProAccess, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubscribe() {
    if (!isAuthed) return;
    setLoading(true);
    setError('');
    try {
      const session = await createCheckoutSession({ email: user?.email });
      if (!session?.url) throw new Error('Checkout sem URL de redirecionamento');
      window.location.href = session.url;
    } catch (err) {
      setError(err.message || 'Não foi possível iniciar a subscrição');
      setLoading(false);
    }
  }

  if (!isAuthed) {
    return (
      <Link className="btn btn--primary" to={path('/signup')} state={{ from: location.pathname }}>
        {isEn ? 'Create account to subscribe' : 'Criar conta para subscrever'}
      </Link>
    );
  }

  if (hasProAccess) {
    return (
      <Link className="btn btn--primary" to={path('/conta')}>
        {isEn ? 'Manage subscription' : 'Gerir subscrição'}
      </Link>
    );
  }

  return (
    <>
      <button className="btn btn--primary" type="button" onClick={onSubscribe} disabled={loading}>
        {loading ? (isEn ? 'Opening checkout…' : 'A abrir checkout…') : (isEn ? 'Subscribe to Pro' : 'Subscrever Pro')}
      </button>
      {error ? <p className="note" style={{ marginTop: 10 }}>{error}</p> : null}
    </>
  );
}

function ComparisonRow({ label, starter, pro }) {
  return (
    <div className="planCompare__row">
      <div className="planCompare__feature">{label}</div>
      <div className="planCompare__value">{starter}</div>
      <div className="planCompare__value planCompare__value--pro">{pro}</div>
    </div>
  );
}

function PriceCard({ title, price, subtitle, bullets, footer, highlight = false, children }) {
  return (
    <div className={`priceCard ${highlight ? 'priceCard--highlight' : ''}`}>
      <div className="priceCard__title">{title}</div>
      <div className="priceCard__price">{price}</div>
      {subtitle ? <div className="priceCard__subtitle">{subtitle}</div> : null}
      <ul className="priceCard__list">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      {children}
      {footer ? <div className="priceCard__footer">{footer}</div> : null}
    </div>
  );
}

export default function ProPage() {
  const { path, isEn } = useLanguage();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cancelled = params.get('checkout') === 'cancelled';

  return (
    <>
      <Hero
        title="Pro"
        subtitle={
          isEn
            ? 'The subscription unlocks personal directory features and centralizes your history.'
            : 'A subscrição desbloqueia funcionalidades pessoais do diretório e centraliza o teu histórico.'
        }
        badge="Starter vs Pro"
        right={
          <div className="hero__search">
            <SubscribeButton />
            <Link className="btn btn--ghost" to={path('/contacto')}>
              {isEn ? 'Contact us' : 'Falar connosco'}
            </Link>
          </div>
        }
      />

      {cancelled ? (
        <Section title={isEn ? 'Checkout cancelled' : 'Checkout cancelado'} subtitle={isEn ? 'The payment was not completed.' : 'O pagamento não foi concluído.'}>
          <div className="panel">
            <p className="note" style={{ margin: 0 }}>
              {isEn ? 'You can try subscribing again whenever you want.' : 'Podes voltar a tentar a subscrição quando quiseres.'}
            </p>
          </div>
        </Section>
      ) : null}

      <Section
        title={isEn ? 'Plans' : 'Planos'}
        subtitle={isEn ? 'Starter remains free; Pro adds personal features.' : 'O Starter continua grátis; o Pro adiciona funcionalidades pessoais.'}
      >
        <div className="pricingGrid">
          <PriceCard
            title="Starter"
            price="€0"
            subtitle={isEn ? 'No subscription' : 'Sem subscrição'}
            bullets={isEn ? ['Browse and search the directory', 'Filter by category, price and name', 'See daily picks', 'Submit new tools'] : STARTER_FEATURES}
            footer={isEn ? 'Best for discovering tools and submitting new entries.' : 'Ideal para descobrir ferramentas e submeter novas entradas.'}
          >
            <Link className="btn btn--ghost btn--block" to={path('/ferramentas')}>
              {isEn ? 'Continue free' : 'Continuar grátis'}
            </Link>
          </PriceCard>

          <PriceCard
            title={SUBSCRIPTION_PLAN.name}
            price={SUBSCRIPTION_PLAN.priceLabel}
            subtitle={isEn ? 'Monthly recurring billing' : 'Cobrança mensal recorrente'}
            bullets={isEn ? ['Save favorites', 'Visited tools history', 'Personal tool ratings', 'Access to Reviews'] : PRO_FEATURES}
            footer={isEn ? 'Secure checkout via Stripe. Billing can be managed from your account.' : 'Checkout seguro via Stripe. Podes gerir a cobrança a partir da conta.'}
            highlight
          >
            <SubscribeButton />
          </PriceCard>

          <PriceCard
            title="Creator"
            price="€249/mês"
            subtitle={isEn ? 'For teams that want visibility and editorial support' : 'Para quem quer visibilidade e apoio editorial'}
            bullets={[
              isEn ? 'Directory highlight' : 'Destaque no diretório',
              isEn ? 'Support with description and categories' : 'Apoio na descrição e categorias',
              isEn ? 'Quick landing page review' : 'Revisão rápida da landing page',
              isEn ? 'Basic presence report' : 'Relatório básico de presença',
            ]}
            footer={isEn ? 'A service focused on promotion and positioning for your tool.' : 'Serviço orientado a promoção e posicionamento da tua ferramenta.'}
          >
            <Link className="btn btn--ghost btn--block" to={path('/contacto')}>
              {isEn ? 'Request info' : 'Pedir info'}
            </Link>
          </PriceCard>

          <PriceCard
            title="Business"
            price={isEn ? 'Custom' : 'Sob consulta'}
            subtitle={isEn ? 'Implementation, training and integrations' : 'Implementação, formação e integrações'}
            bullets={[
              isEn ? 'Shortlist by use case' : 'Shortlist por caso de uso',
              isEn ? 'Integrations and automations' : 'Integrações e automações',
              isEn ? 'Workshops and playbooks' : 'Workshops e playbooks',
              isEn ? 'Governance and adoption' : 'Governance e adoção',
            ]}
            footer={isEn ? 'A separate service from the Pro subscription.' : 'Serviço separado da subscrição Pro.'}
          >
            <Link className="btn btn--ghost btn--block" to={path('/consultoria')}>
              {isEn ? 'Discuss Business' : 'Falar sobre Business'}
            </Link>
          </PriceCard>
        </div>
      </Section>

      <Section
        title={isEn ? 'What becomes unlocked' : 'O que fica bloqueado'}
        subtitle={isEn ? 'The areas below require an active subscription.' : 'As áreas abaixo passam a exigir uma subscrição ativa.'}
      >
        <div className="planCompare">
          <div className="planCompare__row planCompare__row--head">
            <div className="planCompare__feature">{isEn ? 'Feature' : 'Funcionalidade'}</div>
            <div className="planCompare__value">Starter</div>
            <div className="planCompare__value planCompare__value--pro">Pro</div>
          </div>
          <ComparisonRow label={isEn ? 'Favorites' : 'Favoritas'} starter="-" pro={isEn ? 'Included' : 'Incluído'} />
          <ComparisonRow label={isEn ? 'Visited history' : 'Histórico de visitadas'} starter="-" pro={isEn ? 'Included' : 'Incluído'} />
          <ComparisonRow label={isEn ? 'Personal star ratings' : 'Avaliação pessoal por estrela'} starter="-" pro={isEn ? 'Included' : 'Incluído'} />
          <ComparisonRow label="Reviews" starter="-" pro={isEn ? 'Included' : 'Incluído'} />
          <ComparisonRow label={isEn ? 'Search, filters and featured picks' : 'Pesquisa, filtros e destaques'} starter={isEn ? 'Included' : 'Incluído'} pro={isEn ? 'Included' : 'Incluído'} />
          <ComparisonRow label={isEn ? 'Tool submissions' : 'Submissão de ferramentas'} starter={isEn ? 'Included' : 'Incluído'} pro={isEn ? 'Included' : 'Incluído'} />
        </div>
      </Section>
    </>
  );
}
