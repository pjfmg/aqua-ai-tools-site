import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import ToolCard from '../components/ToolCard.jsx';
import { normalizeWebsiteUrl } from '../lib/tools.js';
import { useTools } from '../hooks/useTools.js';
import { useRatingsSummary } from '../hooks/useRatings.js';
import { useLanguage } from '../i18n.jsx';

function findToolByName(tools, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return null;
  return tools.find((t) => String(t?.Nome || t?.['Nome'] || '').toLowerCase() === q) || null;
}

export default function ReviewsPage() {
  const { tools, loading, loadingMore, error: toolsError, warning: toolsWarning, source, updatedAt, refresh } = useTools();
  const { ratings, loading: ratingsLoading, error: ratingsError } = useRatingsSummary();
  const { path, isEn } = useLanguage();

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

  const ratingsCount = useMemo(() => Object.keys(ratings || {}).length, [ratings]);
  const dataIsLive = source === 'airtable' && !toolsError;
  const dataLabel = dataIsLive
    ? (isEn ? 'Connected to Airtable' : 'Ligado ao Airtable')
    : source === 'snapshot'
      ? (isEn ? 'Using local snapshot' : 'A usar snapshot local')
      : source
        ? (isEn ? `Source: ${source}` : `Fonte: ${source}`)
        : (isEn ? 'Checking data source' : 'A verificar fonte de dados');

  const message = useMemo(() => {
    const tool = selectedTool?.Nome || toolName.trim() || (isEn ? 'Tool' : 'Ferramenta');
    const url = normalizeWebsiteUrl(selectedTool?.Site || '');
    const lines = [
      `Review: ${tool}`,
      url ? `URL: ${url}` : '',
      `Rating: ${rating}/5`,
      pros.trim() ? `Pros: ${pros.trim()}` : '',
      cons.trim() ? `Cons: ${cons.trim()}` : '',
      notes.trim() ? `${isEn ? 'Notes' : 'Notas'}: ${notes.trim()}` : '',
    ].filter(Boolean);
    return lines.join('\n');
  }, [selectedTool, toolName, rating, pros, cons, notes, isEn]);

  async function copyToClipboard() {
    setError('');
    setStatus('');
    if (!toolName.trim() && !selectedTool) {
      setError(isEn ? 'Choose a tool to review.' : 'Escolhe uma ferramenta para avaliar.');
      return;
    }
    try {
      await navigator.clipboard.writeText(message);
      setStatus(isEn ? 'Review copied. Send it through Contact for now.' : 'Review copiada. Envia-a via Contacto (por agora).');
    } catch {
      setError(isEn ? 'Could not copy automatically. Select the text and copy it manually.' : 'Não foi possível copiar automaticamente. Seleciona o texto e copia manualmente.');
    }
  }

  return (
    <>
      <Hero
        title="Reviews"
        subtitle={isEn ? 'Share your experience with AI tools.' : 'Partilha a tua experiência com ferramentas de IA.'}
        badge="Beta"
        right={
          <div className="hero__search">
            <Link className="btn btn--primary" to={path('/contacto')}>
              {isEn ? 'Send review' : 'Enviar review'} →
            </Link>
            <Link className="btn btn--ghost" to={path('/ferramentas')}>
              {isEn ? 'View tools' : 'Ver ferramentas'}
            </Link>
          </div>
        }
      />

      <Section title={isEn ? 'Create review' : 'Criar review'} subtitle={isEn ? 'Fill this in and copy the message to send.' : 'Preenche e copia a mensagem para enviares.'}>
        <div className={`dbStatus ${dataIsLive ? 'is-live' : 'is-local'}`}>
          <div>
            <div className="dbStatus__eyebrow">{isEn ? 'Database status' : 'Estado da base de dados'}</div>
            <h2 className="dbStatus__title">{dataLabel}</h2>
            <p className="dbStatus__text">
              {dataIsLive
                ? (isEn
                    ? `${tools.length} tools loaded from Airtable.`
                    : `${tools.length} ferramentas carregadas do Airtable.`)
                : (isEn
                    ? 'Local preview is not connected to Airtable right now. Start the proxy with AIRTABLE_* variables to test live data.'
                    : 'A pré-visualização local não está ligada ao Airtable neste momento. Arranca o proxy com as variáveis AIRTABLE_* para testar dados reais.')}
            </p>
            {toolsError ? <p className="dbStatus__error">{toolsError}</p> : null}
            {toolsWarning ? <p className="dbStatus__warning">{toolsWarning}</p> : null}
          </div>
          <div className="dbStatus__facts">
            <span>{loading || loadingMore ? (isEn ? 'Loading...' : 'A carregar...') : `${tools.length} tools`}</span>
            <span>{ratingsLoading ? (isEn ? 'Ratings...' : 'Ratings...') : `${ratingsCount} rating groups`}</span>
            <span>{updatedAt ? new Date(updatedAt).toLocaleTimeString() : (isEn ? 'No live timestamp' : 'Sem hora live')}</span>
            {ratingsError ? <span className="is-error">{ratingsError}</span> : null}
          </div>
          <button className="btn btn--ghost btn--small" type="button" onClick={refresh}>
            {isEn ? 'Refresh data' : 'Atualizar dados'}
          </button>
        </div>

        <div className="panel">
          <div className="form__grid">
            <div className="field field--span2">
              <label className="field__label" htmlFor="review-tool">
                {isEn ? 'Tool *' : 'Ferramenta *'}
              </label>
              <input
                id="review-tool"
                className="input"
                placeholder={isEn ? 'Example: Notion AI' : 'Ex: Notion AI'}
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
              />
              <div className="hint">
                {isEn ? 'Tip: write the exact name to find the tool and show a preview.' : 'Dica: escreve o nome exato para encontrar a ferramenta e mostrar um preview.'}
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
                {isEn ? 'Summary' : 'Resumo'}
              </label>
              <input
                id="review-notes"
                className="input"
                placeholder={isEn ? 'One sentence (optional)' : 'Uma frase (opcional)'}
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
                placeholder={isEn ? 'What did you like?' : 'O que gostaste?'}
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
                placeholder={isEn ? 'What could be better?' : 'O que podia ser melhor?'}
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
              {isEn ? 'Copy review' : 'Copiar review'} →
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
              {isEn ? 'Clear' : 'Limpar'}
            </button>
          </div>

          <div className="contactPreview">
            <div className="contactPreview__title">{isEn ? 'Message' : 'Mensagem'}</div>
            <pre className="contactPreview__box">{message}</pre>
          </div>
        </div>
      </Section>
    </>
  );
}
