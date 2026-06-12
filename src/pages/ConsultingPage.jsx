import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useLanguage } from '../i18n.jsx';

export default function ConsultingPage() {
  const { path, isEn } = useLanguage();

  const services = isEn
    ? [
        'AI tool audits by workflow',
        'Shortlists for teams and departments',
        'Automation and integration planning',
        'Training, playbooks and adoption support',
      ]
    : [
        'Auditoria de ferramentas por fluxo de trabalho',
        'Shortlists para equipas e departamentos',
        'Planeamento de automacoes e integracoes',
        'Formacao, playbooks e apoio a adocao',
      ];

  return (
    <>
      <Hero
        title={isEn ? 'Consulting' : 'Consultoria'}
        subtitle={
          isEn
            ? 'We help teams choose, implement and adopt AI tools with less noise.'
            : 'Ajudamos equipas a escolher, implementar e adotar ferramentas de IA com menos ruido.'
        }
        badge={isEn ? 'AI adoption' : 'Adocao de IA'}
        right={
          <div className="hero__search">
            <Link className="btn btn--primary" to={path('/contacto')}>
              {isEn ? 'Book a conversation' : 'Marcar conversa'}
            </Link>
            <Link className="btn btn--ghost" to={path('/ferramentas')}>
              {isEn ? 'Explore tools' : 'Explorar ferramentas'}
            </Link>
          </div>
        }
      />

      <Section
        title={isEn ? 'Services' : 'Servicos'}
        subtitle={
          isEn
            ? 'Practical support from discovery to implementation.'
            : 'Apoio pratico desde a descoberta ate a implementacao.'
        }
      >
        <div className="featureList">
          {services.map((service) => (
            <div className="featureItem" key={service}>
              {service}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title={isEn ? 'Typical process' : 'Processo tipico'}
        subtitle={isEn ? 'A lightweight approach focused on decisions.' : 'Uma abordagem leve focada em decisoes.'}
      >
        <div className="grid-container">
          {(isEn
            ? [
                ['1. Map', 'We identify workflows, constraints and current tools.'],
                ['2. Shortlist', 'We compare options and prioritize what is worth testing.'],
                ['3. Pilot', 'We define a practical pilot with success criteria.'],
                ['4. Adopt', 'We document playbooks and help the team use the tool consistently.'],
              ]
            : [
                ['1. Mapear', 'Identificamos fluxos, restricoes e ferramentas atuais.'],
                ['2. Selecionar', 'Comparamos opcoes e priorizamos o que vale a pena testar.'],
                ['3. Pilotar', 'Definimos um piloto pratico com criterios de sucesso.'],
                ['4. Adotar', 'Documentamos playbooks e ajudamos a equipa a usar a ferramenta com consistencia.'],
              ]
          ).map(([title, body]) => (
            <div className="page" key={title}>
              <div className="page__body">
                <h3 style={{ marginTop: 0 }}>{title}</h3>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
