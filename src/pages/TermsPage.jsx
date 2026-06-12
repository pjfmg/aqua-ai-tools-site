import React from 'react';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useLanguage } from '../i18n.jsx';

export default function TermsPage() {
  const { isEn } = useLanguage();

  return (
    <>
      <Hero
        title={isEn ? 'Terms' : 'Termos'}
        subtitle={
          isEn
            ? 'Basic terms for using AQUA AI Tools.'
            : 'Termos basicos para usar o AQUA AI Tools.'
        }
        badge={isEn ? 'Terms of use' : 'Termos de utilizacao'}
      />

      <Section title={isEn ? 'Use of the service' : 'Uso do servico'} align="left">
        <div className="page">
          <div className="page__body">
            <p>
              {isEn
                ? 'AQUA AI Tools is a directory for discovering AI tools. Information is provided for convenience and may change over time.'
                : 'O AQUA AI Tools e um diretorio para descobrir ferramentas de IA. A informacao e fornecida por conveniencia e pode mudar ao longo do tempo.'}
            </p>
            <p>
              {isEn
                ? 'You are responsible for evaluating each external tool, its terms, pricing, privacy policy and suitability for your use case.'
                : 'Tu es responsavel por avaliar cada ferramenta externa, os seus termos, precos, politica de privacidade e adequacao ao teu caso de uso.'}
            </p>
          </div>
        </div>
      </Section>

      <Section title={isEn ? 'Submissions and accounts' : 'Submissoes e contas'} align="left">
        <div className="page">
          <div className="page__body">
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
              <li>
                {isEn
                  ? 'Submitted tools may be reviewed, edited, rejected or removed.'
                  : 'Ferramentas submetidas podem ser revistas, editadas, rejeitadas ou removidas.'}
              </li>
              <li>
                {isEn
                  ? 'Paid features depend on active billing status and may change as the product evolves.'
                  : 'Funcionalidades pagas dependem de subscricao ativa e podem mudar com a evolucao do produto.'}
              </li>
              <li>
                {isEn
                  ? 'Do not submit unlawful, misleading or infringing content.'
                  : 'Nao submetas conteudo ilegal, enganador ou que viole direitos de terceiros.'}
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title={isEn ? 'Liability' : 'Responsabilidade'} align="left">
        <div className="page">
          <div className="page__body">
            <p>
              {isEn
                ? 'The service is provided as is. We try to keep data accurate, but we cannot guarantee completeness, availability or results from third-party tools.'
                : 'O servico e fornecido tal como esta. Tentamos manter os dados corretos, mas nao garantimos completude, disponibilidade ou resultados de ferramentas terceiras.'}
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
