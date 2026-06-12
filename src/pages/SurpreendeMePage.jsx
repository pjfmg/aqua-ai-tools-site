import React, { useEffect, useMemo, useState } from 'react';
import ToolCard from '../components/ToolCard.jsx';
import { useTools } from '../hooks/useTools.js';
import SimplePage from './SimplePage.jsx';
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
    <SimplePage title={isEn ? 'Surprise me' : 'Surpreende-me'}>
      {warning ? <p className="note">{warning}</p> : null}
      {loading ? <p className="no-results">{isEn ? 'Loading…' : 'A carregar…'}</p> : null}
      {loadingMore && !loading ? <p className="note">{isEn ? 'Loading more tools…' : 'A carregar mais ferramentas…'}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <div className="surprise">
        <button
          className="sort-btn"
          onClick={() => setSeed((s) => s + 1)}
          disabled={loading || !tools.length}
        >
          {isEn ? 'Another tool' : 'Outra ferramenta'}
        </button>

        <div className="surprise__grid">
          <div className="surprise__card surprise__card--center">
            {selected ? <ToolCard tool={selected} /> : !loading ? <p className="no-results">{isEn ? 'No data.' : 'Sem dados.'}</p> : null}
          </div>
        </div>
      </div>
    </SimplePage>
  );
}
