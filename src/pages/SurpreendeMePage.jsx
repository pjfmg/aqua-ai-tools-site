import React, { useMemo, useState } from 'react';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import ToolCard from '../components/ToolCard.jsx';
import { useTools } from '../hooks/useTools.js';
import { useLanguage } from '../i18n.jsx';

function pickRandom(tools) {
  if (!tools.length) return null;
  const idx = Math.floor(Math.random() * tools.length);
  return tools[idx];
}

export default function SurpreendeMePage() {
  const { isEn } = useLanguage();
  const { tools, loading, loadingMore, error, warning } = useTools({ initialPageSize: 10 });
  const [seed, setSeed] = useState(0);

  const selected = useMemo(() => {
    // seed apenas para forçar novo pick sem depender de tools
    void seed;
    return pickRandom(tools);
  }, [tools, seed]);

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
            onClick={() => setSeed((s) => s + 1)}
            disabled={loading || !tools.length}
          >
            {isEn ? 'Surprise me again' : 'Surpreender-me novamente'} →
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
        <div className="surprise">
          {warning ? <p className="note surprise__status">{warning}</p> : null}
          {loading ? <p className="no-results surprise__status">{isEn ? 'Choosing a tool…' : 'A escolher uma ferramenta…'}</p> : null}
          {loadingMore && !loading ? <p className="note surprise__status">{isEn ? 'Loading more tools…' : 'A carregar mais ferramentas…'}</p> : null}
          {error ? <p className="error surprise__status">{error}</p> : null}

          <div className="surprise__grid">
            <div className="surprise__card surprise__card--center">
              {selected ? <ToolCard tool={selected} /> : !loading ? <p className="no-results">{isEn ? 'No data.' : 'Sem dados.'}</p> : null}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
