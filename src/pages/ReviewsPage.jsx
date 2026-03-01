import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import ToolCard from '../components/ToolCard.jsx';
import { normalizeWebsiteUrl } from '../lib/tools.js';
import { useTools } from '../hooks/useTools.js';

function findToolByName(tools, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return null;
  return tools.find((t) => String(t?.Nome || t?.['Nome'] || '').toLowerCase() === q) || null;
}

export default function ReviewsPage() {
  const { tools } = useTools();

  const [toolName, setToolName] = useState('');
  const [rating, setRating] = useState('5');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const selectedTool = useMemo(() => {
    const exact = findToolByName(tools, toolName);
    if (exact) return exact;
    const q = toolName.trim().toLowerCase();
    if (!q) return null;
    return tools.find((t) => String(t?.Nome || '').toLowerCase().includes(q)) || null;
  }, [tools, toolName]);

  const message = useMemo(() => {
    const tool = selectedTool?.Nome || toolName.trim() || 'Ferramenta';
    const url = normalizeWebsiteUrl(selectedTool?.Site || '');
    const lines = [
      `Review: ${tool}`,
      url ? `URL: ${url}` : '',
      `Rating: ${rating}/5`,
      pros.trim() ? `Pros: ${pros.trim()}` : '',
      cons.trim() ? `Cons: ${cons.trim()}` : '',
      notes.trim() ? `Notas: ${notes.trim()}` : '',
    ].filter(Boolean);
    return lines.join('\n');
  }, [selectedTool, toolName, rating, pros, cons, notes]);

  async function copyToClipboard() {
    setError('');
    setStatus('');
    if (!toolName.trim() && !selectedTool) {
      setError('Escolhe uma ferramenta para avaliar.');
      return;
    }
    try {
      await navigator.clipboard.writeText(message);
      setStatus('Review copiada. Envia-a via Contacto (por agora).');
    } catch {
      setError('Não foi possível copiar automaticamente. Seleciona o texto e copia manualmente.');
    }
  }

  return (
    <>
      <Hero
        title="Reviews"
        subtitle="Partilha a tua experiência com ferramentas de IA."
        badge="Beta"
        right={
          <div className="hero__search">
            <Link className="btn btn--primary" to="/contacto">
              Enviar review →
            </Link>
            <Link className="btn btn--ghost" to="/ferramentas">
              Ver ferramentas
            </Link>
          </div>
        }
      />

      <Section title="Criar review" subtitle="Preenche e copia a mensagem para enviares.">
        <div className="panel">
          <div className="form__grid">
            <div className="field field--span2">
              <label className="field__label" htmlFor="review-tool">
                Ferramenta *
              </label>
              <input
                id="review-tool"
                className="input"
                placeholder="Ex: Notion AI"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
              />
              <div className="hint">
                Dica: escreve o nome exato para encontrar a ferramenta e mostrar um preview.
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="review-rating">
                Rating
              </label>
              <select id="review-rating" className="select" value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="5">5/5</option>
                <option value="4">4/5</option>
                <option value="3">3/5</option>
                <option value="2">2/5</option>
                <option value="1">1/5</option>
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="review-notes">
                Resumo
              </label>
              <input
                id="review-notes"
                className="input"
                placeholder="Uma frase (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="field field--span2">
              <label className="field__label" htmlFor="review-pros">
                Pros
              </label>
              <textarea
                id="review-pros"
                className="textarea"
                rows={3}
                placeholder="O que gostaste?"
                value={pros}
                onChange={(e) => setPros(e.target.value)}
              />
            </div>

            <div className="field field--span2">
              <label className="field__label" htmlFor="review-cons">
                Cons
              </label>
              <textarea
                id="review-cons"
                className="textarea"
                rows={3}
                placeholder="O que podia ser melhor?"
                value={cons}
                onChange={(e) => setCons(e.target.value)}
              />
            </div>
          </div>

          {selectedTool ? (
            <div className="previewRow">
              <div className="previewRow__title">Preview</div>
              <div className="previewRow__grid">
                <ToolCard tool={selectedTool} />
              </div>
            </div>
          ) : null}

          {error ? <p className="error">{error}</p> : null}
          {status ? <p className="success">{status}</p> : null}

          <div className="form__actions">
            <button className="btn btn--primary" type="button" onClick={copyToClipboard}>
              Copiar review →
            </button>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => {
                setToolName('');
                setRating('5');
                setPros('');
                setCons('');
                setNotes('');
                setError('');
                setStatus('');
              }}
            >
              Limpar
            </button>
          </div>

          <div className="contactPreview">
            <div className="contactPreview__title">Mensagem</div>
            <pre className="contactPreview__box">{message}</pre>
          </div>
        </div>
      </Section>
    </>
  );
}

