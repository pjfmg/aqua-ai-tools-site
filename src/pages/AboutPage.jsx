import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useLanguage } from '../i18n.jsx';
import { CATALOG_EVIDENCE, formatPublishedRecords } from '../lib/catalogEvidence.js';

export default function AboutPage() {
  const { path, isEn } = useLanguage();
  const publishedRecords = formatPublishedRecords(isEn ? 'en-GB' : 'pt-PT');
  return (
    <>
      <Hero
        title={isEn ? 'About' : 'Sobre'}
        subtitle={
          isEn
            ? 'A transparent catalogue and an editorial library for making better decisions about AI tools.'
            : 'Um catálogo transparente e uma biblioteca editorial para decidir melhor sobre ferramentas de IA.'
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
        title={isEn ? 'Editorial method' : 'Método editorial'}
        subtitle={
          isEn
            ? 'What the AQUA team writes, verifies and deliberately leaves unclaimed.'
            : 'O que a equipa AQUA escreve, verifica e escolhe não afirmar sem evidência.'
        }
      >
        <div className="grid-container">
          <article className="page"><div className="page__body">
            <h3 style={{ marginTop: 0 }}>{isEn ? 'Original guides' : 'Guias originais'}</h3>
            <p>{isEn
              ? 'Our guides are written as repeatable methods: tasks, checklists, scoring rules and decision criteria. They are reviewed by the AQUA editorial team and carry a visible review date.'
              : 'Os nossos guias são escritos como métodos repetíveis: tarefas, checklists, grelhas de pontuação e critérios de decisão. São revistos pela equipa editorial AQUA e apresentam uma data de revisão visível.'}</p>
          </div></article>
          <article className="page"><div className="page__body">
            <h3 style={{ marginTop: 0 }}>{isEn ? 'Catalogue records' : 'Registos do catálogo'}</h3>
            <p>{isEn
              ? 'A catalogue record is not a recommendation. Records without a substantive manual assessment are excluded from search indexing and advertising, even when they remain available for discovery.'
              : 'Um registo do catálogo não é uma recomendação. Registos sem uma avaliação manual substantiva ficam fora da indexação e da publicidade, mesmo quando continuam disponíveis para descoberta.'}</p>
          </div></article>
          <article className="page"><div className="page__body">
            <h3 style={{ marginTop: 0 }}>{isEn ? 'Corrections and independence' : 'Correções e independência'}</h3>
            <p>{isEn
              ? 'We distinguish automated catalogue checks from editorial verification, date the evidence we publish and provide a correction channel. Commercial contact does not turn an unverified record into an editorial endorsement.'
              : 'Distinguimos controlos automáticos do catálogo de verificação editorial, datamos a evidência publicada e disponibilizamos um canal de correção. Um contacto comercial não transforma um registo não verificado numa recomendação editorial.'}</p>
          </div></article>
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
                  ? 'Records live in the AQUA Data Platform on PostgreSQL/Supabase and are exposed through a governed API.'
                  : 'Os registos vivem na AQUA Data Platform em PostgreSQL/Supabase e são disponibilizados através de uma API governada.'}
              </p>
              <p>
                {isEn
                  ? 'The browser may show a recent cache while revalidating, but the Data Platform remains the only source of truth.'
                  : 'O browser pode mostrar uma cache recente durante a revalidação, mas a Data Platform continua a ser a única fonte oficial.'}
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
              <li>
                {isEn
                  ? `${publishedRecords} records were present in the automated catalogue audit dated 24 July 2026.`
                  : `${publishedRecords} registos estavam presentes na auditoria automática do catálogo de 24 de julho de 2026.`}
              </li>
              <li>
                {isEn
                  ? 'The audit checks taxonomy coverage, valid links and exact website duplicates; it does not certify that every tool is operational.'
                  : 'A auditoria controla cobertura taxonómica, links válidos e websites exatamente duplicados; não certifica que todas as ferramentas estejam operacionais.'}
              </li>
              <li>
                {isEn
                  ? 'Missing editorial descriptions remain clearly marked for review instead of being filled with invented generic copy.'
                  : 'Descrições editoriais em falta ficam claramente marcadas para revisão, em vez de serem preenchidas com texto genérico inventado.'}
              </li>
              <li>{isEn ? 'Links, prices and plans can change after the audit date.' : 'Links, preços e planos podem mudar depois da data da auditoria.'}</li>
            </ul>
            <p style={{ marginBottom: 0 }}>
              <time dateTime={CATALOG_EVIDENCE.auditedOn}>
                {isEn ? 'Evidence date: 24 July 2026.' : 'Data da evidência: 24 de julho de 2026.'}
              </time>{' '}
              <Link to={path('/sugestoes')}>{isEn ? 'Report a correction.' : 'Comunicar uma correção.'}</Link>
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
