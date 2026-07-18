import React from 'react';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useLanguage } from '../i18n.jsx';
import { useConsent } from '../privacy/ConsentContext.jsx';

export default function PrivacyPage() {
  const { isEn } = useLanguage();
  const { consent, advertisingAvailable, advertisingAllowed, openPreferences } = useConsent();

  return (
    <>
      <Hero
        title={isEn ? 'Privacy' : 'Privacidade'}
        subtitle={
          isEn
            ? 'How AQUA AI Tools handles data used to operate the directory.'
            : 'Como o AQUA AI Tools trata dados usados para operar o diretorio.'
        }
        badge={isEn ? 'Privacy policy' : 'Politica de privacidade'}
      />

      <Section title={isEn ? 'What we collect' : 'O que recolhemos'} align="left">
        <div className="page">
          <div className="page__body">
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
              <li>
                {isEn
                  ? 'Tool submissions may include name, website, description, category and contact details if provided.'
                  : 'Submissoes de ferramentas podem incluir nome, site, descricao, categoria e dados de contacto se forem fornecidos.'}
              </li>
              <li>
                {isEn
                  ? 'Account identity is managed by Supabase Auth. The browser stores a signed session and billing endpoints validate it before accessing subscription data.'
                  : 'A identidade da conta é gerida pelo Supabase Auth. O browser guarda uma sessão assinada e os endpoints de billing validam-na antes de aceder a dados da subscrição.'}
              </li>
              <li>
                {isEn
                  ? 'Analytics, ads and infrastructure providers may process technical data such as page views, device data and IP addresses.'
                  : 'Fornecedores de analytics, anuncios e infraestrutura podem processar dados tecnicos como visualizacoes, dados do dispositivo e endereco IP.'}
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title={isEn ? 'Consent and choices' : 'Consentimento e escolhas'} align="left">
        <div className="page"><div className="page__body">
          <p>{isEn ? 'Necessary storage supports authentication, security and saved preferences. Google Analytics and Microsoft Clarity are analytics; Google AdSense is advertising. Optional providers remain off until you choose otherwise.' : 'O armazenamento necessário suporta autenticação, segurança e preferências. Google Analytics e Microsoft Clarity pertencem a analytics; Google AdSense pertence a publicidade. Os fornecedores opcionais permanecem desligados até escolheres o contrário.'}</p>
          {!advertisingAvailable ? <p>{isEn ? 'Advertising is currently suspended. It will only be enabled after a Google-certified consent platform with IAB TCF support is configured.' : 'A publicidade está atualmente suspensa. Só será ativada após estar configurada uma plataforma de consentimento certificada pela Google com suporte IAB TCF.'}</p> : null}
          <p>{isEn ? 'Your choice is stored in this browser for up to 180 days. You can reject or change it at any time. Global Privacy Control keeps advertising disabled.' : 'A escolha é guardada neste browser até 180 dias. Podes recusá-la ou alterá-la em qualquer momento. O Global Privacy Control mantém a publicidade desativada.'}</p>
          <p><strong>{isEn ? 'Current choice:' : 'Escolha atual:'}</strong> {consent ? `${consent.analytics ? 'Analytics ✓' : 'Analytics ✕'} · ${advertisingAllowed ? (isEn ? 'Advertising ✓' : 'Publicidade ✓') : (isEn ? 'Advertising ✕' : 'Publicidade ✕')}` : (isEn ? 'Not decided' : 'Não decidida')}</p>
          <button className="btn btn--primary" type="button" onClick={openPreferences}>{isEn ? 'Open privacy settings' : 'Abrir definições de privacidade'}</button>
        </div></div>
      </Section>

      <Section title={isEn ? 'How we use data' : 'Como usamos os dados'} align="left">
        <div className="page">
          <div className="page__body">
            <p>
              {isEn
                ? 'We use data to operate the directory, review submissions, provide billing features, improve the product and keep the service secure.'
                : 'Usamos dados para operar o diretorio, rever submissoes, fornecer funcionalidades de faturacao, melhorar o produto e manter o servico seguro.'}
            </p>
            <p>
              {isEn
                ? 'We do not sell submitted personal data. Some third-party services are required to run the product, including Supabase, Stripe, hosting, analytics and advertising providers.'
                : 'Nao vendemos dados pessoais submetidos. Alguns servicos terceiros sao necessarios para operar o produto, incluindo Supabase, Stripe, alojamento, analytics e publicidade.'}
            </p>
          </div>
        </div>
      </Section>

      <Section title={isEn ? 'Contact' : 'Contacto'} align="left">
        <div className="page">
          <div className="page__body">
            <p>
              {isEn
                ? 'For privacy questions or data requests, contact us at aquaticus@mail.telepac.pt.'
                : 'Para questoes de privacidade ou pedidos sobre dados, contacta-nos em aquaticus@mail.telepac.pt.'}
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
