import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useLanguage } from '../i18n.jsx';

export default function AboutPage() {
  const { path, isEn } = useLanguage();
  return (
    <>
      <Hero
        title={isEn ? 'About' : 'Sobre'}
        subtitle={
          isEn
            ? 'AQUA AI Tools is a curated directory for discovering and comparing AI tools.'
            : 'O AQUA AI Tools é um diretório curado para descobrir e comparar ferramentas de IA.'
        }
        badge="AQUA"
        right={
          <div className="hero__search">
            <Link className="btn btn--primary" to={path('/ferramentas')}>
              {isEn ? 'Explore tools →' : 'Explorar ferramentas →'}
            </Link>
            <Link className="btn btn--ghost" to={path('/submeter')}>
              {isEn ? 'Submit' : 'Submeter'}
            </Link>
          </div>
        }
      />

      <Section
        title={isEn ? 'Mission' : 'Missão'}
        subtitle={isEn ? 'Help you find the right tool faster.' : 'Ajudar-te a encontrar a ferramenta certa, rápido.'}
      >
        <div className="page">
          <div className="page__body">
            {isEn ? (
              <>
                <p>
                  The number of AI tools keeps growing. AQUA AI Tools makes discovery simpler with a searchable
                  database, clear categories and direct links to try each product.
                </p>
                <p>
                  We are continuously improving the product with better filters, richer tool information and dedicated
                  pages for reviews, suggestions and featured picks.
                </p>
              </>
            ) : (
              <>
                <p>
                  Há cada vez mais ferramentas de IA. O objetivo do AQUA AI Tools é simplificar a descoberta com uma base de
                  dados pesquisável, com categorias e links diretos para experimentares cada solução.
                </p>
                <p>
                  Estamos a evoluir continuamente: mais filtros, mais informação útil por ferramenta e páginas dedicadas
                  (reviews, sugestões e destaques).
                </p>
              </>
            )}
          </div>
        </div>
      </Section>

      <Section
        title={isEn ? 'How it works' : 'Como funciona'}
        subtitle={isEn ? 'Where the data comes from and how the directory stays current.' : 'De onde vêm os dados e como manter a base atualizada.'}
      >
        <div className="grid-container">
          <div className="page">
            <div className="page__body">
              <h3 style={{ marginTop: 0 }}>{isEn ? 'Database' : 'Base de dados'}</h3>
              <p>
                {isEn
                  ? 'Records live in Airtable and are loaded through a server endpoint so credentials never reach the browser.'
                  : 'Os registos vivem no Airtable e são carregados através de um endpoint do servidor (para manter as chaves fora do browser).'}
              </p>
              <p>
                {isEn
                  ? 'When the endpoint is unavailable, a local mock keeps development usable.'
                  : 'Quando o endpoint não está disponível, usamos um mock local para manter a app funcional em ambiente de desenvolvimento.'}
              </p>
            </div>
          </div>

          <div className="page">
            <div className="page__body">
              <h3 style={{ marginTop: 0 }}>{isEn ? 'Submissions' : 'Submissões'}</h3>
              <p>
                {isEn ? (
                  <>
                    You can suggest new tools on the <Link to={path('/submeter')}>Submit</Link> page. Submissions are
                    manually reviewed before they are added to the directory.
                  </>
                ) : (
                  <>
                    Podes sugerir novas ferramentas na página <Link to={path('/submeter')}>Submeter</Link>. As submissões são
                    revistas manualmente antes de serem adicionadas ao diretório.
                  </>
                )}
              </p>
              <p>
                {isEn
                  ? 'If you want to promote a tool, contact us or use the consulting area as it evolves.'
                  : 'Se quiseres destacar uma ferramenta, entra em contacto ou usa a área de consultoria (em construção).'}
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title={isEn ? 'Transparency' : 'Transparência'}
        subtitle={isEn ? 'Important notes for accurate expectations.' : 'Notas importantes para expectativas corretas.'}
      >
        <div className="page">
          <div className="page__body">
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
              <li>{isEn ? 'Links and logos can change; we try to keep everything current.' : 'Links e logos podem mudar; tentamos manter tudo atualizado.'}</li>
              <li>{isEn ? 'Prices and plans may not reflect the latest offer from each product.' : 'Preços/planos podem não refletir a oferta mais recente de cada produto.'}</li>
              <li>{isEn ? 'Some pages are still evolving and will be improved gradually.' : 'Algumas páginas estão em desenvolvimento e serão melhoradas gradualmente.'}</li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
