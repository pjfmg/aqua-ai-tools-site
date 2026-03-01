import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';

export default function ConsultingPage() {
  return (
    <>
      <Hero
        title="Consultoria"
        subtitle="Ajudamos a escolher, implementar e integrar ferramentas de IA no teu negócio."
        badge="B2B / Equipas"
        right={
          <div className="hero__search">
            <Link className="btn btn--primary" to="/contacto">
              Pedir proposta →
            </Link>
            <Link className="btn btn--ghost" to="/ferramentas">
              Ver ferramentas
            </Link>
          </div>
        }
      />

      <Section title="Serviços" subtitle="Um processo simples, orientado a impacto e resultados.">
        <div className="categoryGrid">
          <div className="page">
            <div className="page__body">
              <h3 style={{ marginTop: 0 }}>Mapeamento & seleção</h3>
              <p>Identificação de oportunidades, benchmark e shortlist por caso de uso.</p>
            </div>
          </div>
          <div className="page">
            <div className="page__body">
              <h3 style={{ marginTop: 0 }}>Implementação</h3>
              <p>Configuração, automações, integrações e boas práticas de adoção.</p>
            </div>
          </div>
          <div className="page">
            <div className="page__body">
              <h3 style={{ marginTop: 0 }}>Formação</h3>
              <p>Workshops, playbooks e templates para acelerar a produtividade.</p>
            </div>
          </div>
          <div className="page">
            <div className="page__body">
              <h3 style={{ marginTop: 0 }}>Governance</h3>
              <p>Recomendações para segurança, compliance e qualidade de outputs.</p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Próximo passo" subtitle="Diz-nos o teu contexto e devolvemos um plano.">
        <div className="cta">
          <div className="cta__text">
            <div className="cta__title">Vamos falar?</div>
            <div className="cta__subtitle">Partilha objetivo, equipa, stack e prazos. Respondemos com recomendações.</div>
          </div>
          <div className="cta__actions">
            <Link className="btn btn--primary" to="/contacto">
              Contactar →
            </Link>
            <Link className="btn btn--ghost" to="/sobre">
              Saber mais
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

