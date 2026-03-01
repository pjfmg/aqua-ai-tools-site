import React from 'react';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';

const LAST_UPDATED = '28 de fevereiro de 2026';

export default function PrivacyPage() {
  return (
    <>
      <Hero
        title="Privacidade"
        subtitle="Resumo de como tratamos dados neste site."
        badge={`Atualizado: ${LAST_UPDATED}`}
      />

      <Section title="Resumo" subtitle="Versão simples e transparente (não substitui aconselhamento jurídico).">
        <div className="page">
          <div className="page__body">
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
              <li>Não pedimos password nem dados sensíveis para criar conta (perfil local no browser).</li>
              <li>Ao submeter uma ferramenta, enviamos os dados para a nossa base (Airtable) para revisão.</li>
              <li>Usamos pedidos ao endpoint do servidor para carregar dados (sem expor chaves no browser).</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Dados que recolhemos" subtitle="O mínimo necessário para a experiência do site.">
        <div className="grid-container">
          <div className="page">
            <div className="page__body">
              <h3 style={{ marginTop: 0 }}>Perfil local</h3>
              <p>
                Se usares SignUp/SignIn, guardamos apenas <strong>nome</strong> e <strong>email</strong> no teu browser
                (localStorage). Isto não é uma conta “server-side” e pode ser apagado limpando dados do site no
                navegador.
              </p>
            </div>
          </div>
          <div className="page">
            <div className="page__body">
              <h3 style={{ marginTop: 0 }}>Submissões</h3>
              <p>
                No formulário <strong>Submeter</strong>, recolhemos os campos introduzidos (ex: Nome, Site, Categoria,
                Descrição) para revisão e possível publicação no diretório.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Partilha e fornecedores" subtitle="Onde os dados podem ser processados.">
        <div className="page">
          <div className="page__body">
            <p>
              Os dados de ferramentas e submissões podem ser armazenados e processados em serviços de terceiros usados
              para operar o produto (por exemplo, Airtable). Tentamos limitar o acesso e manter apenas o necessário para
              o funcionamento do diretório.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Direitos e contacto" subtitle="Como pedir alterações ou remoção.">
        <div className="page">
          <div className="page__body">
            <p>
              Se quiseres atualizar ou remover informação associada a uma ferramenta ou submissão, contacta-nos através
              da página <strong>Contacto</strong>.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}

