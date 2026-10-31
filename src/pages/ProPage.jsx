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
  const { isAuthed, hasProAccess } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubscribe() {
    if (!isAuthed) return;
    setLoading(true);
    setError('');
    try {
      const session = await createCheckoutSession();
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
      <div className="planCompare__value">
        <span className="planCompare__planLabel">Starter</span>
        {starter}
      </div>
      <div className="planCompare__value planCompare__value--pro">
        <span className="planCompare__planLabel">Pro</span>
        {pro}
      </div>
    </div>
  );
}

function ValueCard({ eyebrow, title, body }) {
  return (
    <article className="proValueCard">
      <div className="proValueCard__eyebrow">{eyebrow}</div>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

function PriceCard({ title, price, subtitle, bullets, footer, highlight = false, label = '', children }) {
  return (
    <div className={`priceCard ${highlight ? 'priceCard--highlight' : ''}`}>
      {label ? <div className="priceCard__label">{label}</div> : null}
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
        title={isEn ? 'Turn discovery into decisions' : 'Transforma descoberta em decisões'}
        subtitle={
          isEn
            ? 'Build your shortlist, remember what you explored and keep your personal tool evaluations together.'
            : 'Cria a tua shortlist, recupera o que exploraste e mantém as tuas avaliações pessoais num só lugar.'
        }
        badge={isEn ? 'Pro · €19/month' : 'Pro · €19/mês'}
        right={
          <div className="hero__search">
            <SubscribeButton />
            <Link className="btn btn--ghost" to={path('/ferramentas')}>
              {isEn ? 'Explore for free' : 'Explorar gratuitamente'}
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
        title={isEn ? 'A workspace for your AI research' : 'Um espaço para a tua pesquisa de IA'}
        subtitle={
          isEn
            ? 'Pro helps frequent users move from browsing to a repeatable decision process.'
            : 'O Pro ajuda quem pesquisa com frequência a passar da descoberta para um processo de decisão repetível.'
        }
      >
        <div className="proValueGrid">
          <ValueCard
            eyebrow={isEn ? '1 · Shortlist' : '1 · Shortlist'}
            title={isEn ? 'Keep the strongest candidates' : 'Guarda os candidatos mais fortes'}
            body={
              isEn
                ? 'Save favorites while browsing and return to a focused selection instead of starting over.'
                : 'Guarda favoritas enquanto exploras e regressa a uma seleção focada, sem recomeçar do zero.'
            }
          />
          <ValueCard
            eyebrow={isEn ? '2 · Memory' : '2 · Memória'}
            title={isEn ? 'Pick up where you left off' : 'Retoma onde ficaste'}
            body={
              isEn
                ? 'Your visited history keeps useful tools within reach across research sessions.'
                : 'O histórico de visitadas mantém as ferramentas úteis ao teu alcance entre sessões de pesquisa.'
            }
          />
          <ValueCard
            eyebrow={isEn ? '3 · Evaluation' : '3 · Avaliação'}
            title={isEn ? 'Record your own judgement' : 'Regista o teu próprio critério'}
            body={
              isEn
                ? 'Give tools a personal star rating and review those decisions from one dedicated area.'
                : 'Atribui uma avaliação pessoal por estrelas e revê essas decisões numa área dedicada.'
            }
          />
        </div>
      </Section>

      <Section
        title={isEn ? 'Choose how you use the directory' : 'Escolhe como usas o diretório'}
        subtitle={
          isEn
            ? 'Browsing remains free. Pro adds continuity and a personal decision layer.'
            : 'Explorar continua gratuito. O Pro acrescenta continuidade e uma camada pessoal de decisão.'
        }
      >
        <div className="pricingGrid pricingGrid--primary">
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
            price={isEn ? '€19/month' : SUBSCRIPTION_PLAN.priceLabel}
            subtitle={isEn ? 'Monthly recurring billing' : 'Cobrança mensal recorrente'}
            bullets={
              isEn
                ? ['Build a personal shortlist with favorites', 'Return to tools through visited history', 'Record a personal star rating', 'Review your decisions in one place']
                : PRO_FEATURES
            }
            footer={
              isEn
                ? 'For people who compare tools regularly and want to preserve their research.'
                : 'Para quem compara ferramentas regularmente e quer preservar a sua pesquisa.'
            }
            highlight
            label={isEn ? 'For frequent research' : 'Para pesquisa frequente'}
          >
            <SubscribeButton />
          </PriceCard>
        </div>

        <div className="proTrustStrip" role="note">
          <strong>{isEn ? 'Clear billing' : 'Cobrança transparente'}</strong>
          <span>
            {isEn
              ? 'Monthly recurring payment processed through Stripe. The self-service billing portal remains suspended until its secure flow is available.'
              : 'Pagamento mensal recorrente processado pela Stripe. O portal de gestão autónoma permanece suspenso até o fluxo seguro estar disponível.'}
          </span>
        </div>
      </Section>

      <Section
        title={isEn ? 'Looking for promotion or implementation?' : 'Procuras promoção ou implementação?'}
        subtitle={
          isEn
            ? 'Creator and Business are services for products and teams; they are separate from the personal Pro subscription.'
            : 'Creator e Business são serviços para produtos e equipas, separados da subscrição pessoal Pro.'
        }
      >
        <div className="pricingGrid pricingGrid--services">
          <PriceCard
            title="Creator"
            price={isEn ? '€249/month' : '€249/mês'}
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
        title={isEn ? 'Starter or Pro?' : 'Starter ou Pro?'}
        subtitle={
          isEn
            ? 'Compare exactly what is included before you decide.'
            : 'Compara exatamente o que está incluído antes de decidires.'
        }
      >
        <div className="planCompare">
          <div className="planCompare__row planCompare__row--head">
            <div className="planCompare__feature">{isEn ? 'Feature' : 'Funcionalidade'}</div>
            <div className="planCompare__value">Starter</div>
            <div className="planCompare__value planCompare__value--pro">Pro</div>
          </div>
          <ComparisonRow label={isEn ? 'Favorites' : 'Favoritas'} starter={isEn ? 'Not included' : 'Não incluído'} pro={isEn ? 'Included' : 'Incluído'} />
          <ComparisonRow label={isEn ? 'Visited history' : 'Histórico de visitadas'} starter={isEn ? 'Not included' : 'Não incluído'} pro={isEn ? 'Included' : 'Incluído'} />
          <ComparisonRow label={isEn ? 'Personal star ratings' : 'Avaliação pessoal por estrela'} starter={isEn ? 'Not included' : 'Não incluído'} pro={isEn ? 'Included' : 'Incluído'} />
          <ComparisonRow label="Reviews" starter={isEn ? 'Not included' : 'Não incluído'} pro={isEn ? 'Included' : 'Incluído'} />
          <ComparisonRow label={isEn ? 'Search, filters and featured picks' : 'Pesquisa, filtros e destaques'} starter={isEn ? 'Included' : 'Incluído'} pro={isEn ? 'Included' : 'Incluído'} />
          <ComparisonRow label={isEn ? 'Tool submissions' : 'Submissão de ferramentas'} starter={isEn ? 'Included' : 'Incluído'} pro={isEn ? 'Included' : 'Incluído'} />
        </div>
        <div className="proFinalCta">
          <div>
            <strong>{isEn ? 'Ready to preserve your research?' : 'Queres preservar a tua pesquisa?'}</strong>
            <span>
              {isEn
                ? 'Start free, then activate Pro when favorites, history and evaluations become useful to you.'
                : 'Começa gratuitamente e ativa o Pro quando favoritas, histórico e avaliações forem úteis para ti.'}
            </span>
          </div>
          <SubscribeButton />
        </div>
      </Section>
    </>
  );
}
