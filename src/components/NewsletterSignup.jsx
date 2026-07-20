import React, { useEffect, useId, useRef, useState } from 'react';
import { useLanguage } from '../i18n.jsx';
import { NEWSLETTER_TOPICS, subscribeToNewsletter } from '../lib/newsletter.js';
import { useConsent } from '../privacy/ConsentContext.jsx';

const STATUS_KEY = 'aqua_newsletter_status_v1';
const DISMISSED_KEY = 'aqua_newsletter_dismissed_v1';
const DISMISS_DAYS = 30;

function recentlyDismissed() {
  const dismissedAt = Number(window.localStorage.getItem(DISMISSED_KEY) || 0);
  return dismissedAt > Date.now() - DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

function isSubscribed() {
  return window.localStorage.getItem(STATUS_KEY) === 'subscribed';
}

export function openNewsletterSignup() {
  window.dispatchEvent(new CustomEvent('aqua:newsletter-open'));
}

export default function NewsletterSignup() {
  const { isEn, lang } = useLanguage();
  const { hasDecision, preferencesOpen } = useConsent();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [topics, setTopics] = useState(['productivity', 'content-design', 'code-automation']);
  const [permission, setPermission] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const show = () => {
      setStatus('idle');
      setMessage('');
      setOpen(true);
    };
    window.addEventListener('aqua:newsletter-open', show);
    return () => window.removeEventListener('aqua:newsletter-open', show);
  }, []);

  useEffect(() => {
    if (!hasDecision || preferencesOpen || isSubscribed() || recentlyDismissed()) return undefined;
    const timer = window.setTimeout(() => setOpen(true), 8000);
    return () => window.clearTimeout(timer);
  }, [hasDecision, preferencesOpen]);

  useEffect(() => {
    if (!open) return undefined;
    previousFocus.current = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.querySelector('input')?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') dismiss();
      if (event.key !== 'Tab' || !dialog) return;
      const items = [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled])')];
      if (!items.length) return;
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [open]);

  function dismiss() {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setOpen(false);
  }

  function toggleTopic(topicId) {
    setTopics((current) => current.includes(topicId)
      ? current.filter((item) => item !== topicId)
      : [...current, topicId]);
  }

  async function submit(event) {
    event.preventDefault();
    if (!permission || !topics.length || status === 'submitting') return;
    setStatus('submitting');
    setMessage('');
    try {
      await subscribeToNewsletter({ email, topics, locale: lang });
      window.localStorage.setItem(STATUS_KEY, 'subscribed');
      window.localStorage.removeItem(DISMISSED_KEY);
      setStatus('success');
      setMessage(isEn ? 'You’re in. Your first curated edition arrives soon.' : 'Está feito. A primeira edição selecionada chega em breve.');
    } catch {
      setStatus('error');
      setMessage(isEn ? 'We could not complete your subscription. Please try again.' : 'Não foi possível concluir a subscrição. Tenta novamente.');
    }
  }

  if (!open || preferencesOpen) return null;

  return (
    <div className="newsletterModal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) dismiss(); }}>
      <section
        ref={dialogRef}
        className="newsletterDialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <button className="newsletterDialog__close" type="button" onClick={dismiss} aria-label={isEn ? 'Close newsletter invitation' : 'Fechar convite da newsletter'}>×</button>
        <div className="newsletterDialog__visual" aria-hidden="true">
          <span className="newsletterDialog__spark">✦</span>
          <strong>5</strong>
          <small>{isEn ? 'tools / week' : 'ferramentas / semana'}</small>
          <div className="newsletterDialog__miniCards"><i /><i /><i /></div>
        </div>
        <div className="newsletterDialog__content">
          <div className="newsletterDialog__eyebrow">AQUA WEEKLY</div>
          <h2 id={titleId}>{isEn ? 'The right AI tools, without the noise.' : 'As ferramentas de IA certas, sem ruído.'}</h2>
          <p id={descriptionId}>{isEn ? 'Every week, get a short selection matched to the themes you care about.' : 'Todas as semanas, recebe uma seleção curta ajustada aos temas que te interessam.'}</p>

          {status === 'success' ? (
            <div className="newsletterDialog__success" role="status">
              <span>✓</span>
              <strong>{message}</strong>
              <button className="btn btn--primary" type="button" onClick={() => setOpen(false)}>{isEn ? 'Done' : 'Concluir'}</button>
            </div>
          ) : (
            <form className="newsletterForm" onSubmit={submit}>
              <label className="field__label" htmlFor={`${titleId}-email`}>{isEn ? 'Your email' : 'O teu email'}</label>
              <div className="newsletterForm__emailRow">
                <input id={`${titleId}-email`} className="input" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder={isEn ? 'you@example.com' : 'o.teu@email.com'} />
                <button className="btn btn--primary" type="submit" disabled={!permission || !topics.length || status === 'submitting'}>{status === 'submitting' ? (isEn ? 'Joining…' : 'A subscrever…') : (isEn ? 'Join free →' : 'Subscrever grátis →')}</button>
              </div>

              <fieldset className="newsletterTopics">
                <legend>{isEn ? 'Choose your themes' : 'Escolhe os teus temas'}</legend>
                <div className="newsletterTopics__grid">
                  {NEWSLETTER_TOPICS.map((topic) => (
                    <label className={`newsletterTopic${topics.includes(topic.id) ? ' is-selected' : ''}`} key={topic.id}>
                      <input type="checkbox" checked={topics.includes(topic.id)} onChange={() => toggleTopic(topic.id)} />
                      <span>{isEn ? topic.en : topic.pt}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="newsletterPermission">
                <input type="checkbox" checked={permission} onChange={(event) => setPermission(event.target.checked)} required />
                <span>{isEn ? 'I agree to receive the weekly newsletter. I can unsubscribe at any time.' : 'Aceito receber a newsletter semanal. Posso cancelar a qualquer momento.'}</span>
              </label>
              {message ? <p className="newsletterForm__error" role="alert">{message}</p> : null}
              <small className="newsletterForm__finePrint">{isEn ? 'One useful email per week. No spam.' : 'Um email útil por semana. Sem spam.'}</small>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
