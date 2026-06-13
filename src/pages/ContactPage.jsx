import React, { useMemo, useState } from 'react';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useLanguage } from '../i18n.jsx';

export default function ContactPage() {
  const { isEn } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const mailto = useMemo(() => {
    const subject = encodeURIComponent(isEn ? 'AQUA AI Tools contact' : 'Contacto AQUA AI Tools');
    const body = encodeURIComponent(
      `${isEn ? 'Name' : 'Nome'}: ${name}\n${isEn ? 'Email' : 'Email'}: ${email}\n\n${message}`,
    );
    return `mailto:aquaticus@mail.telepac.pt?subject=${subject}&body=${body}`;
  }, [email, isEn, message, name]);

  return (
    <>
      <Hero
        title={isEn ? 'Contact' : 'Contacto'}
        subtitle={
          isEn
            ? 'Talk to us about the directory, partnerships, submissions or consulting.'
            : 'Fala connosco sobre o diretório, parcerias, submissões ou consultoria.'
        }
        badge={isEn ? 'AQUATICUS' : 'AQUATICUS'}
      />

      <Section
        title={isEn ? 'Send a message' : 'Enviar mensagem'}
        subtitle={isEn ? 'Use the form to prepare an email.' : 'Usa o formulário para preparar um email.'}
      >
        <div className="panel">
          <div className="form__grid">
            <div className="field">
              <label className="field__label" htmlFor="contact-name">
                {isEn ? 'Name' : 'Nome'}
              </label>
              <input
                id="contact-name"
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={isEn ? 'Your name' : 'O teu nome'}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                className="input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="field field--span2">
              <label className="field__label" htmlFor="contact-message">
                {isEn ? 'Message' : 'Mensagem'}
              </label>
              <textarea
                id="contact-message"
                className="textarea"
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={
                  isEn
                    ? 'Tell us what you need.'
                    : 'Diz-nos o que precisas.'
                }
              />
            </div>
          </div>

          <div className="form__actions">
            <a className="btn btn--primary" href={mailto}>
              {isEn ? 'Open email' : 'Abrir email'}
            </a>
            <a className="btn btn--ghost" href="mailto:aquaticus@mail.telepac.pt">
              aquaticus@mail.telepac.pt
            </a>
          </div>
        </div>
      </Section>

      <Section
        title={isEn ? 'What we can help with' : 'Em que podemos ajudar'}
        subtitle={isEn ? 'Typical requests we handle.' : 'Pedidos comuns que tratamos.'}
      >
        <div className="featureList">
          {(isEn
            ? ['Tool submissions', 'Creator partnerships', 'AI tool shortlists', 'Business consulting']
            : ['Submissao de ferramentas', 'Parcerias com criadores', 'Shortlists de ferramentas IA', 'Consultoria para empresas']
          ).map((item) => (
            <div className="featureItem" key={item}>
              {item}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
