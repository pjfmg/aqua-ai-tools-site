import React from 'react';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';

const LAST_UPDATED = '28 de fevereiro de 2026';

export default function TermsPage() {
  return (
    <>
      <Hero
        title="Termos"
        subtitle="Condições gerais de utilização do AQUA AI Tools."
        badge={`Atualizado: ${LAST_UPDATED}`}
      />

      <Section title="Uso do site" subtitle="Regras simples para manter a plataforma útil para todos.">
        <div className="page">
          <div className="page__body">
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
              <li>O diretório é informativo; a utilização das ferramentas é da responsabilidade do utilizador.</li>
              <li>Não garantimos disponibilidade, preços ou funcionalidades das ferramentas listadas.</li>
              <li>Podemos atualizar, remover ou reordenar conteúdos a qualquer momento.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Submissões" subtitle="O que acontece quando sugeres uma ferramenta.">
        <div className="page">
          <div className="page__body">
            <p>
              Ao submeteres uma ferramenta, declaras que tens direito a partilhar a informação fornecida e autorizas a
              sua revisão e possível publicação no diretório. Podemos editar campos (ex: normalização de links e
              categorias) para consistência.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Conteúdos e marcas" subtitle="Direitos de terceiros.">
        <div className="page">
          <div className="page__body">
            <p>
              Os nomes, logótipos e marcas apresentados pertencem aos respetivos proprietários. O AQUA AI Tools não é
              afiliado a essas marcas, salvo indicação explícita.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Limitação de responsabilidade" subtitle="Sem garantias absolutas.">
        <div className="page">
          <div className="page__body">
            <p>
              O site é disponibilizado “como está”. Na medida permitida por lei, não assumimos responsabilidade por
              perdas decorrentes do uso do diretório ou de ferramentas de terceiros.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}

