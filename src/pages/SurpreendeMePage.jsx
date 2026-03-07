import React, { useEffect, useMemo, useState } from 'react';
import ToolCard from '../components/ToolCard.jsx';
import { useTools } from '../hooks/useTools.js';
import SimplePage from './SimplePage.jsx';

function pickRandom(tools) {
  if (!tools.length) return null;
  const idx = Math.floor(Math.random() * tools.length);
  return tools[idx];
}

export default function SurpreendeMePage() {
  const { tools, loading, loadingMore, error, warning } = useTools({ initialPageSize: 10 });
  const [seed, setSeed] = useState(0);

  const selected = useMemo(() => {
    // seed apenas para forçar novo pick sem depender de tools
    void seed;
    return pickRandom(tools);
  }, [tools, seed]);

  return (
    <SimplePage title="Surpreende-me">
      {warning ? <p className="note">{warning}</p> : null}
      {loading ? <p className="no-results">A carregar…</p> : null}
      {loadingMore && !loading ? <p className="note">A carregar mais ferramentas…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <div className="surprise">
        <button
          className="sort-btn"
          onClick={() => setSeed((s) => s + 1)}
          disabled={loading || !tools.length}
        >
          Outra ferramenta
        </button>

        <div className="surprise__grid">
          <div className="surprise__card surprise__card--center">
            {selected ? <ToolCard tool={selected} /> : !loading ? <p className="no-results">Sem dados.</p> : null}
          </div>
        </div>
      </div>
    </SimplePage>
  );
}
