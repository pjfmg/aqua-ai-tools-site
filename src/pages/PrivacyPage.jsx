import React from 'react';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useLanguage } from '../i18n.jsx';

export default function PrivacyPage() {
  const { isEn } = useLanguage();

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
                  ? 'Account data is currently stored locally in the browser, while subscription status can be checked through billing endpoints.'
                  : 'Dados de conta sao atualmente guardados localmente no browser, enquanto o estado da subscricao pode ser verificado por endpoints de billing.'}
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
                ? 'We do not sell submitted personal data. Some third-party services are required to run the product, including Airtable, Stripe, hosting, analytics and advertising providers.'
                : 'Nao vendemos dados pessoais submetidos. Alguns servicos terceiros sao necessarios para operar o produto, incluindo Airtable, Stripe, alojamento, analytics e publicidade.'}
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
