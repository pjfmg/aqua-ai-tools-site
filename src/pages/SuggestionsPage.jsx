import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';

function buildSuggestionText({ kind, toolName, toolUrl, email, message }) {
  const lines = [
    `Tipo: ${kind || ''}`.trim(),
    toolName ? `Ferramenta: ${toolName}` : '',
    toolUrl ? `URL: ${toolUrl}` : '',
    email ? `Contacto: ${email}` : '',
    '',
    (message || '').trim(),
  ].filter(Boolean);
  return lines.join('\n');
}

export default function SuggestionsPage() {
  const [kind, setKind] = useState('Sugestão');
  const [toolName, setToolName] = useState('');
  const [toolUrl, setToolUrl] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const composed = useMemo(
    () =>
      buildSuggestionText({
        kind: kind.trim(),
        toolName: toolName.trim(),
        toolUrl: toolUrl.trim(),
        email: email.trim(),
        message: message.trim(),
      }),
    [kind, toolName, toolUrl, email, message],
  );

  async function copyToClipboard() {
    setError('');
    setStatus('');
    if (!message.trim()) {
      setError('Escreve a sugestão primeiro.');
      return;
    }
    try {
      await navigator.clipboard.writeText(composed);
      setStatus('Sugestão copiada. Cola-a no Contacto/DM que preferires.');
    } catch {
      setError('Não foi possível copiar automaticamente. Seleciona o texto e copia manualmente.');
    }
  }

  return (
    <>
      <Hero
        title="Sugestões"
        subtitle="Ajuda-nos a melhorar o diretório: ideias, correções e pedidos."
        badge="Feedback"
        right={
          <div className="hero__search">
            <Link className="btn btn--primary" to="/contacto">
              Contactar →
            </Link>
            <Link className="btn btn--ghost" to="/submeter">
              Submeter ferramenta
            </Link>
          </div>
        }
      />

      <Section title="Enviar sugestão" subtitle="Preenche e copia a mensagem para enviares.">
        <div className="panel">
          <div className="form__grid">
            <div className="field">
              <label className="field__label" htmlFor="sug-kind">
                Tipo
              </label>
              <select id="sug-kind" className="select" value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="Sugestão">Sugestão</option>
                <option value="Correção">Correção</option>
                <option value="Feature">Feature</option>
                <option value="Nova categoria">Nova categoria</option>
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="sug-email">
                Email (opcional)
              </label>
              <input
                id="sug-email"
                className="input"
                placeholder="o.teu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="sug-tool">
                Ferramenta (opcional)
              </label>
              <input
                id="sug-tool"
                className="input"
                placeholder="Nome da ferramenta"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="sug-url">
                URL (opcional)
              </label>
              <input
                id="sug-url"
                className="input"
                placeholder="https://..."
                value={toolUrl}
                onChange={(e) => setToolUrl(e.target.value)}
              />
            </div>

            <div className="field field--span2">
              <label className="field__label" htmlFor="sug-message">
                Sugestão *
              </label>
              <textarea
                id="sug-message"
                className="textarea"
                rows={6}
                placeholder="Escreve aqui o que gostarias de ver melhorado…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>

          {error ? <p className="error">{error}</p> : null}
          {status ? <p className="success">{status}</p> : null}

          <div className="form__actions">
            <button className="btn btn--primary" type="button" onClick={copyToClipboard}>
              Copiar sugestão →
            </button>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => {
                setKind('Sugestão');
                setToolName('');
                setToolUrl('');
                setEmail('');
                setMessage('');
                setError('');
                setStatus('');
              }}
            >
              Limpar
            </button>
          </div>

          <div className="contactPreview">
            <div className="contactPreview__title">Pré‑visualização</div>
            <pre className="contactPreview__box">{composed}</pre>
          </div>
        </div>
      </Section>
    </>
  );
}

