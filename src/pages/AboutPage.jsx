import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';

export default function AboutPage() {
  return (
    <>
      <Hero
        title="Sobre"
        subtitle="O AQUA AI Tools é um diretório curado para descobrir e comparar ferramentas de IA."
        badge="AQUA"
        right={
          <div className="hero__search">
            <Link className="btn btn--primary" to="/ferramentas">
              Explorar ferramentas →
            </Link>
            <Link className="btn btn--ghost" to="/submeter">
              Submeter
            </Link>
          </div>
        }
      />

      <Section title="Missão" subtitle="Ajudar-te a encontrar a ferramenta certa, rápido.">
        <div className="page">
          <div className="page__body">
            <p>
              Há cada vez mais ferramentas de IA. O objetivo do AQUA AI Tools é simplificar a descoberta com uma base de
              dados pesquisável, com categorias e links diretos para experimentares cada solução.
            </p>
            <p>
              Estamos a evoluir continuamente: mais filtros, mais informação útil por ferramenta e páginas dedicadas
              (reviews, sugestões e destaques).
            </p>
          </div>
        </div>
      </Section>

      <Section title="Como funciona" subtitle="De onde vêm os dados e como manter a base atualizada.">
        <div className="grid-container">
          <div className="page">
            <div className="page__body">
              <h3 style={{ marginTop: 0 }}>Base de dados</h3>
              <p>
                Os registos vivem no Airtable e são carregados através de um endpoint do servidor (para manter as chaves
                fora do browser).
              </p>
              <p>
                Quando o endpoint não está disponível, usamos um mock local para manter a app funcional em ambiente de
                desenvolvimento.
              </p>
            </div>
          </div>

          <div className="page">
            <div className="page__body">
              <h3 style={{ marginTop: 0 }}>Submissões</h3>
              <p>
                Podes sugerir novas ferramentas na página <Link to="/submeter">Submeter</Link>. As submissões são
                revistas manualmente antes de serem adicionadas ao diretório.
              </p>
              <p>
                Se quiseres destacar uma ferramenta, entra em contacto ou usa a área de consultoria (em construção).
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Transparência" subtitle="Notas importantes para expectativas corretas.">
        <div className="page">
          <div className="page__body">
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
              <li>Links e logos podem mudar; tentamos manter tudo atualizado.</li>
              <li>Preços/planos podem não refletir a oferta mais recente de cada produto.</li>
              <li>Algumas páginas estão em desenvolvimento e serão melhoradas gradualmente.</li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}

