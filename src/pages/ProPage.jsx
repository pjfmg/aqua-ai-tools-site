import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useAuth } from '../auth/auth.jsx';
import { createCheckoutSession } from '../lib/billing.js';
import { PRO_FEATURES, STARTER_FEATURES, SUBSCRIPTION_PLAN } from '../lib/subscription.js';

function SubscribeButton() {
  const location = useLocation();
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
      <Link className="btn btn--primary" to="/signup" state={{ from: location.pathname }}>
        Criar conta para subscrever
      </Link>
    );
  }

  if (hasProAccess) {
    return (
      <Link className="btn btn--primary" to="/conta">
        Gerir subscrição
      </Link>
    );
  }

  return (
    <>
      <button className="btn btn--primary" type="button" onClick={onSubscribe} disabled={loading}>
        {loading ? 'A abrir checkout…' : 'Subscrever Pro'}
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
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cancelled = params.get('checkout') === 'cancelled';

  return (
    <>
      <Hero
        title="Pro"
        subtitle="A subscrição desbloqueia funcionalidades pessoais do diretório e centraliza o teu histórico."
        badge="Starter vs Pro"
        right={
          <div className="hero__search">
            <SubscribeButton />
            <Link className="btn btn--ghost" to="/contacto">
              Falar connosco
            </Link>
          </div>
        }
      />

      {cancelled ? (
        <Section title="Checkout cancelado" subtitle="O pagamento não foi concluído.">
          <div className="panel">
            <p className="note" style={{ margin: 0 }}>
              Podes voltar a tentar a subscrição quando quiseres.
            </p>
          </div>
        </Section>
      ) : null}

      <Section title="Planos" subtitle="O Starter continua grátis; o Pro adiciona funcionalidades pessoais.">
        <div className="pricingGrid">
          <PriceCard
            title="Starter"
            price="€0"
            subtitle="Sem subscrição"
            bullets={STARTER_FEATURES}
            footer="Ideal para descobrir ferramentas e submeter novas entradas."
          >
            <Link className="btn btn--ghost btn--block" to="/ferramentas">
              Continuar grátis
            </Link>
          </PriceCard>

          <PriceCard
            title={SUBSCRIPTION_PLAN.name}
            price={SUBSCRIPTION_PLAN.priceLabel}
            subtitle="Cobrança mensal recorrente"
            bullets={PRO_FEATURES}
            footer="Checkout seguro via Stripe. Podes gerir a cobrança a partir da conta."
            highlight
          >
            <SubscribeButton />
          </PriceCard>

          <PriceCard
            title="Creator"
            price="€249/mês"
            subtitle="Para quem quer visibilidade e apoio editorial"
            bullets={[
              'Destaque no diretório',
              'Apoio na descrição e categorias',
              'Revisão rápida da landing page',
              'Relatório básico de presença',
            ]}
            footer="Serviço orientado a promoção e posicionamento da tua ferramenta."
          >
            <Link className="btn btn--ghost btn--block" to="/contacto">
              Pedir info
            </Link>
          </PriceCard>

          <PriceCard
            title="Business"
            price="Sob consulta"
            subtitle="Implementação, formação e integrações"
            bullets={[
              'Shortlist por caso de uso',
              'Integrações e automações',
              'Workshops e playbooks',
              'Governance e adoção',
            ]}
            footer="Serviço separado da subscrição Pro."
          >
            <Link className="btn btn--ghost btn--block" to="/consultoria">
              Falar sobre Business
            </Link>
          </PriceCard>
        </div>
      </Section>

      <Section title="O que fica bloqueado" subtitle="As áreas abaixo passam a exigir uma subscrição ativa.">
        <div className="planCompare">
          <div className="planCompare__row planCompare__row--head">
            <div className="planCompare__feature">Funcionalidade</div>
            <div className="planCompare__value">Starter</div>
            <div className="planCompare__value planCompare__value--pro">Pro</div>
          </div>
          <ComparisonRow label="Favoritas" starter="-" pro="Incluído" />
          <ComparisonRow label="Histórico de visitadas" starter="-" pro="Incluído" />
          <ComparisonRow label="Avaliação pessoal por estrela" starter="-" pro="Incluído" />
          <ComparisonRow label="Página Reviews" starter="-" pro="Incluído" />
          <ComparisonRow label="Pesquisa, filtros e destaques" starter="Incluído" pro="Incluído" />
          <ComparisonRow label="Submissão de ferramentas" starter="Incluído" pro="Incluído" />
        </div>
      </Section>
    </>
  );
}
