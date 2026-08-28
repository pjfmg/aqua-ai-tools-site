import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import ToolCard from '../components/ToolCard.jsx';
import { useTools } from '../hooks/useTools.js';
import { useLanguage } from '../i18n.jsx';
import { pickNextRandomIndex } from '../lib/surprise.js';

export default function SurpreendeMePage() {
  const { path, isEn } = useLanguage();
  const { tools, loading, error, warning, refresh } = useTools({ initialPageSize: 10 });
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (!tools.length) {
      setSelectedIndex(-1);
      return;
    }
    setSelectedIndex((current) =>
      current >= 0 && current < tools.length
        ? current
        : pickNextRandomIndex(tools.length),
    );
  }, [tools]);

  const selected = selectedIndex >= 0 ? tools[selectedIndex] : null;
  const isInitialLoading = loading && tools.length === 0;

  function surpriseAgain() {
    setSelectedIndex((current) => pickNextRandomIndex(tools.length, current));
  }

  return (
    <>
      <Hero
        title={isEn ? 'Surprise me' : 'Surpreende-me'}
        subtitle={
          isEn
            ? 'Discover an AI tool chosen at random and find a new way to work, create or learn.'
            : 'Descobre uma ferramenta de IA escolhida ao acaso e encontra uma nova forma de trabalhar, criar ou aprender.'
        }
        badge={isEn ? 'A fresh discovery every time' : 'Uma descoberta nova de cada vez'}
        right={
          <button
            className="btn btn--ghost"
            type="button"
            onClick={surpriseAgain}
            disabled={isInitialLoading || !tools.length}
          >
            {isEn ? 'Another discovery' : 'Outra descoberta'}
          </button>
        }
      />

      <Section
        title={isEn ? 'Your discovery' : 'A tua descoberta'}
        subtitle={
          isEn
            ? 'One tool, picked from the AQUA AI Tools collection.'
            : 'Uma ferramenta escolhida da coleção AQUA AI Tools.'
        }
      >
        <div className="surprise" aria-live="polite" aria-busy={isInitialLoading}>
          {isInitialLoading ? (
            <div className="statePanel surprise__status">
              <strong>{isEn ? 'Choosing a tool for you…' : 'A escolher uma ferramenta para ti…'}</strong>
            </div>
          ) : error && !selected ? (
            <div className="statePanel statePanel--error surprise__status" role="alert">
              <div>
                <strong>{isEn ? 'We could not choose a tool right now.' : 'Não foi possível escolher uma ferramenta agora.'}</strong>
                <span>
                  {isEn
                    ? 'The catalogue may be temporarily unavailable. Try again or browse it directly.'
                    : 'O catálogo pode estar temporariamente indisponível. Tenta novamente ou explora-o diretamente.'}
                </span>
              </div>
              <div className="surprise__statusActions">
                <button className="btn btn--primary btn--sm" type="button" onClick={refresh}>
                  {isEn ? 'Try again' : 'Tentar novamente'}
                </button>
                <Link className="btn btn--ghost btn--sm" to={path('/ferramentas')}>
                  {isEn ? 'Browse tools' : 'Explorar ferramentas'}
                </Link>
              </div>
            </div>
          ) : !selected ? (
            <div className="surprise__empty">
              <strong>{isEn ? 'No tools are available yet.' : 'Ainda não existem ferramentas disponíveis.'}</strong>
              <span>
                {isEn
                  ? 'You can refresh the catalogue or return later for a new discovery.'
                  : 'Podes atualizar o catálogo ou regressar mais tarde para uma nova descoberta.'}
              </span>
              <div className="surprise__statusActions">
                <button className="btn btn--primary btn--sm" type="button" onClick={refresh}>
                  {isEn ? 'Refresh catalogue' : 'Atualizar catálogo'}
                </button>
                <Link className="btn btn--ghost btn--sm" to={path('/')}>
                  {isEn ? 'Back to home' : 'Voltar ao início'}
                </Link>
              </div>
            </div>
          ) : (
            <>
              {warning ? (
                <p className="statePanel statePanel--warning surprise__status">
                  {isEn
                    ? 'This discovery is available, but the catalogue may be incomplete.'
                    : 'Esta descoberta está disponível, mas o catálogo pode estar incompleto.'}
                </p>
              ) : null}
              <div className="surprise__grid">
                <div className="surprise__card surprise__card--center">
                  <ToolCard tool={selected} />
                </div>
              </div>
              <div className="surprise__controls">
                <button className="btn btn--primary" type="button" onClick={surpriseAgain}>
                  {isEn ? 'Show another tool' : 'Mostrar outra ferramenta'}
                </button>
                <Link className="btn btn--ghost" to={path('/ferramentas')}>
                  {isEn ? 'Explore the full directory' : 'Explorar o diretório completo'}
                </Link>
              </div>
            </>
          )}
        </div>
      </Section>
    </>
  );
}
