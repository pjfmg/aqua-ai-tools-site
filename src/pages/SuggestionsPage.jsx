import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useLanguage } from '../i18n.jsx';

function buildSuggestionText({ isEn, kind, toolName, toolUrl, email, message }) {
  const lines = [
    `${isEn ? 'Type' : 'Tipo'}: ${kind || ''}`.trim(),
    toolName ? `${isEn ? 'Tool' : 'Ferramenta'}: ${toolName}` : '',
    toolUrl ? `URL: ${toolUrl}` : '',
    email ? `${isEn ? 'Contact' : 'Contacto'}: ${email}` : '',
    '',
    (message || '').trim(),
  ].filter(Boolean);
  return lines.join('\n');
}

export default function SuggestionsPage() {
  const { path, isEn } = useLanguage();
  const [kind, setKind] = useState(isEn ? 'Suggestion' : 'Sugestão');
  const [toolName, setToolName] = useState('');
  const [toolUrl, setToolUrl] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const options = isEn
    ? ['Suggestion', 'Correction', 'Feature', 'New category']
    : ['Sugestão', 'Correção', 'Feature', 'Nova categoria'];

  const composed = useMemo(
    () =>
      buildSuggestionText({
        isEn,
        kind: kind.trim(),
        toolName: toolName.trim(),
        toolUrl: toolUrl.trim(),
        email: email.trim(),
        message: message.trim(),
      }),
    [email, isEn, kind, message, toolName, toolUrl],
  );

  async function copyToClipboard() {
    setError('');
    setStatus('');
    if (!message.trim()) {
      setError(isEn ? 'Write the suggestion first.' : 'Escreve a sugestão primeiro.');
      return;
    }
    try {
      await navigator.clipboard.writeText(composed);
      setStatus(
        isEn
          ? 'Suggestion copied. Paste it into the contact channel you prefer.'
          : 'Sugestão copiada. Cola-a no Contacto/DM que preferires.',
      );
    } catch {
      setError(
        isEn
          ? 'Could not copy automatically. Select the text and copy it manually.'
          : 'Não foi possível copiar automaticamente. Seleciona o texto e copia manualmente.',
      );
    }
  }

  return (
    <>
      <Hero
        title={isEn ? 'Suggestions' : 'Sugestões'}
        subtitle={
          isEn
            ? 'Help us improve the directory with ideas, corrections and requests.'
            : 'Ajuda-nos a melhorar o diretório: ideias, correções e pedidos.'
        }
        badge="Feedback"
        right={
          <div className="hero__search">
            <Link className="btn btn--primary" to={path('/contacto')}>
              {isEn ? 'Contact →' : 'Contactar →'}
            </Link>
            <Link className="btn btn--ghost" to={path('/submeter')}>
              {isEn ? 'Submit tool' : 'Submeter ferramenta'}
            </Link>
          </div>
        }
      />

      <Section
        title={isEn ? 'Send a suggestion' : 'Enviar sugestão'}
        subtitle={isEn ? 'Fill in and copy the message to send it.' : 'Preenche e copia a mensagem para enviares.'}
      >
        <div className="panel">
          <div className="form__grid">
            <div className="field">
              <label className="field__label" htmlFor="sug-kind">
                {isEn ? 'Type' : 'Tipo'}
              </label>
              <select id="sug-kind" className="select" value={kind} onChange={(e) => setKind(e.target.value)}>
                {options.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="sug-email">
                {isEn ? 'Email (optional)' : 'Email (opcional)'}
              </label>
              <input
                id="sug-email"
                className="input"
                placeholder={isEn ? 'you@example.com' : 'o.teu@email.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="sug-tool">
                {isEn ? 'Tool (optional)' : 'Ferramenta (opcional)'}
              </label>
              <input
                id="sug-tool"
                className="input"
                placeholder={isEn ? 'Tool name' : 'Nome da ferramenta'}
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="sug-url">
                URL {isEn ? '(optional)' : '(opcional)'}
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
                {isEn ? 'Suggestion *' : 'Sugestão *'}
              </label>
              <textarea
                id="sug-message"
                className="textarea"
                rows={6}
                placeholder={isEn ? 'Write what you would like to improve…' : 'Escreve aqui o que gostarias de ver melhorado…'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>

          {error ? <p className="error">{error}</p> : null}
          {status ? <p className="success">{status}</p> : null}

          <div className="form__actions">
            <button className="btn btn--primary" type="button" onClick={copyToClipboard}>
              {isEn ? 'Copy suggestion →' : 'Copiar sugestão →'}
            </button>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => {
                setKind(isEn ? 'Suggestion' : 'Sugestão');
                setToolName('');
                setToolUrl('');
                setEmail('');
                setMessage('');
                setError('');
                setStatus('');
              }}
            >
              {isEn ? 'Clear' : 'Limpar'}
            </button>
          </div>

          <div className="contactPreview">
            <div className="contactPreview__title">{isEn ? 'Preview' : 'Pré-visualização'}</div>
            <pre className="contactPreview__box">{composed}</pre>
          </div>
        </div>
      </Section>
    </>
  );
}
