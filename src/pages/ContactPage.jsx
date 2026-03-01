import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';

function buildMessage({ name, email, subject, message }) {
  const lines = [
    `Nome: ${name || ''}`.trim(),
    `Email: ${email || ''}`.trim(),
    `Assunto: ${subject || ''}`.trim(),
    '',
    (message || '').trim(),
  ];
  return lines.join('\n');
}

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const composed = useMemo(
    () => buildMessage({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
    [name, email, subject, message],
  );

  async function copyToClipboard() {
    setError('');
    setStatus('');
    if (!message.trim()) {
      setError('Escreve a mensagem primeiro.');
      return;
    }
    try {
      await navigator.clipboard.writeText(composed);
      setStatus('Mensagem copiada. Cola-a no email/DM que preferires.');
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = composed;
        ta.setAttribute('readonly', 'true');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setStatus('Mensagem copiada. Cola-a no email/DM que preferires.');
      } catch (e) {
        setError('Não foi possível copiar automaticamente. Seleciona o texto e copia manualmente.');
      }
    }
  }

  return (
    <>
      <Hero
        title="Contacto"
        subtitle="Fala connosco para sugestões, parcerias ou consultoria."
        badge="Resposta em breve"
        right={
          <div className="hero__search">
            <Link className="btn btn--primary" to="/consultoria">
              Consultoria →
            </Link>
            <Link className="btn btn--ghost" to="/submeter">
              Submeter
            </Link>
          </div>
        }
      />

      <Section title="Mensagem" subtitle="Copia o texto e envia pelo canal que preferires.">
        <div className="panel">
          <div className="form__grid">
            <div className="field">
              <label className="field__label" htmlFor="contact-name">
                Nome
              </label>
              <input
                id="contact-name"
                className="input"
                placeholder="O teu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                className="input"
                placeholder="o.teu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field field--span2">
              <label className="field__label" htmlFor="contact-subject">
                Assunto
              </label>
              <input
                id="contact-subject"
                className="input"
                placeholder="Ex: Parceria / Consultoria / Sugestão"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="field field--span2">
              <label className="field__label" htmlFor="contact-message">
                Mensagem *
              </label>
              <textarea
                id="contact-message"
                className="textarea"
                rows={6}
                placeholder="Escreve aqui…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>

          {error ? <p className="error">{error}</p> : null}
          {status ? <p className="success">{status}</p> : null}

          <div className="form__actions">
            <button className="btn btn--primary" type="button" onClick={copyToClipboard}>
              Copiar mensagem →
            </button>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => {
                setName('');
                setEmail('');
                setSubject('');
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

