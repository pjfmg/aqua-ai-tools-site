import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';

function PriceCard({ title, price, subtitle, bullets, ctaLabel, ctaTo, highlight = false }) {
  return (
    <div className={`priceCard ${highlight ? 'priceCard--highlight' : ''}`}>
      <div className="priceCard__title">{title}</div>
      <div className="priceCard__price">{price}</div>
      {subtitle ? <div className="priceCard__subtitle">{subtitle}</div> : null}
      <ul className="priceCard__list">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <Link className={`btn btn--block ${highlight ? 'btn--primary' : 'btn--ghost'}`} to={ctaTo}>
        {ctaLabel} →
      </Link>
    </div>
  );
}

export default function ProPage() {
  return (
    <>
      <Hero
        title="Pro"
        subtitle="Planos e opções para destacar ferramentas, obter apoio e acelerar integrações."
        badge="Em evolução"
        right={
          <div className="hero__search">
            <Link className="btn btn--primary" to="/contacto">
              Falar connosco →
            </Link>
            <Link className="btn btn--ghost" to="/submeter">
              Submeter
            </Link>
          </div>
        }
      />

      <Section title="Planos" subtitle="Escolhe o nível certo para o teu objetivo.">
        <div className="pricingGrid">
          <PriceCard
            title="Starter"
            price="€0"
            subtitle="Para começar"
            bullets={[
              'Acesso ao diretório',
              'Pesquisa e filtros',
              'Destaques diários',
              'Submissão de ferramentas',
            ]}
            ctaLabel="Explorar"
            ctaTo="/ferramentas"
          />
          <PriceCard
            title="Creator"
            price="€249/mês"
            subtitle="Para quem quer visibilidade (ou €690 pagamento único / 30 dias)"
            bullets={[
              'Destaque no diretório',
              'Apoio na descrição e categorias',
              'Revisão de landing page (rápida)',
              'Relatório básico de presença',
            ]}
            ctaLabel="Pedir info"
            ctaTo="/contacto"
            highlight
          />
          <PriceCard
            title="Business"
            price="Desde €1.490/mês"
            subtitle="Para equipas (mín. 2 meses) ou €2.900 kickstart (pagamento único)"
            bullets={[
              'Shortlist por caso de uso',
              'Integrações e automações',
              'Formação e playbooks',
              'Governance e boas práticas',
            ]}
            ctaLabel="Consultoria"
            ctaTo="/consultoria"
          />
        </div>
        <p className="note" style={{ marginTop: 14 }}>
          Preços indicados + IVA.
        </p>
      </Section>

      <Section title="O que inclui" subtitle="Benefícios típicos do Pro.">
        <div className="categoryGrid">
          <div className="page">
            <div className="page__body">
              <h3 style={{ marginTop: 0 }}>Destaque</h3>
              <p>Colocação em áreas de maior visibilidade e recomendações.</p>
            </div>
          </div>
          <div className="page">
            <div className="page__body">
              <h3 style={{ marginTop: 0 }}>Melhor descrição</h3>
              <p>Texto mais claro, consistente e orientado a conversão.</p>
            </div>
          </div>
          <div className="page">
            <div className="page__body">
              <h3 style={{ marginTop: 0 }}>Integração</h3>
              <p>Ajuda prática para ligar ferramentas ao teu stack e processos.</p>
            </div>
          </div>
          <div className="page">
            <div className="page__body">
              <h3 style={{ marginTop: 0 }}>Acompanhamento</h3>
              <p>Orientação, recomendações e melhoria contínua.</p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Próximo passo" subtitle="Conta-nos o objetivo e sugerimos o melhor caminho.">
        <div className="cta">
          <div className="cta__text">
            <div className="cta__title">Queres destacar a tua ferramenta?</div>
            <div className="cta__subtitle">Envia o link e o contexto. Respondemos com proposta e próximos passos.</div>
          </div>
          <div className="cta__actions">
            <Link className="btn btn--primary" to="/contacto">
              Contactar →
            </Link>
            <Link className="btn btn--ghost" to="/sobre">
              Sobre
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
