import React from 'react';
import { Link } from 'react-router-dom';
import foundation from '../../aqua-app-foundation.v1.json';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useLanguage } from '../i18n.jsx';
import { useConsent } from '../privacy/ConsentContext.jsx';

export default function SettingsPage() {
  const { isEn, path } = useLanguage();
  const { openPreferences } = useConsent();
  const supportSubject = encodeURIComponent(`[${foundation.support.routingLabel}] ${isEn ? 'Support' : 'Suporte'}`);

  return (
    <>
      <Hero
        title={isEn ? 'Settings' : 'Definições'}
        subtitle={
          isEn
            ? 'Account, privacy, support and product preferences in one place.'
            : 'Conta, privacidade, suporte e preferências do produto num só lugar.'
        }
        badge="AQUA App Foundation"
      />

      <Section title={isEn ? 'Account and subscription' : 'Conta e subscrição'} align="left">
        <div className="featureList">
          <Link className="featureItem" to={path('/conta')}>
            {isEn ? 'Manage account and subscription' : 'Gerir conta e subscrição'}
          </Link>
          <Link className="featureItem" to={path('/pro')}>
            {isEn ? 'View Pro plan' : 'Ver plano Pro'}
          </Link>
        </div>
      </Section>

      <Section title={isEn ? 'Privacy and data' : 'Privacidade e dados'} align="left">
        <div className="featureList">
          <Link className="featureItem" to={path('/privacidade')}>
            {isEn ? 'Privacy policy and GDPR rights' : 'Política de privacidade e direitos RGPD'}
          </Link>
          <button className="featureItem" type="button" onClick={openPreferences}>
            {isEn ? 'Cookie and analytics preferences' : 'Preferências de cookies e análise'}
          </button>
        </div>
      </Section>

      <Section title={isEn ? 'Help and feedback' : 'Ajuda e feedback'} align="left">
        <div className="featureList">
          <a className="featureItem" href={`mailto:${foundation.support.email}?subject=${supportSubject}`}>
            {isEn ? 'Email support' : 'Suporte por email'}
          </a>
          <Link className="featureItem" to={path('/sugestoes')}>
            {isEn ? 'Send a suggestion' : 'Enviar uma sugestão'}
          </Link>
          <Link className="featureItem" to={path('/reviews')}>
            {isEn ? 'Rate an AI tool' : 'Avaliar uma ferramenta de IA'}
          </Link>
        </div>
      </Section>

      <Section title={isEn ? 'About this configuration' : 'Sobre esta configuração'} align="left">
        <div className="page">
          <div className="page__body">
            <p><strong>{foundation.application.name}</strong> · {foundation.application.version}</p>
            <p>
              {isEn
                ? 'AQUA AI Tools is a directory. It does not access your photo library or run a generative AI model on submitted content.'
                : 'O AQUA AI Tools é um diretório. Não acede à tua biblioteca de Fotos nem executa um modelo de IA generativa sobre conteúdo submetido.'}
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
