import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { getCategoryIconDataUrl } from '../lib/categoryIcons.js';
import { normalizeArea } from '../lib/tools.js';
import { useTools } from '../hooks/useTools.js';

export default function HomePage() {
  const { tools, loading, loadingMore, error, warning } = useTools();

  const categoryCounts = useMemo(() => {
    const counts = new Map();
    for (const t of tools) {
      for (const a of normalizeArea(t['Área/Categoria'])) {
        counts.set(a, (counts.get(a) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [tools]);

  return (
    <>
      <Hero
        title="AQUA AI Tools"
        subtitle="Encontra a ferramenta de IA certa para cada necessidade — pesquisa, filtros e listas."
        badge={`${tools.length} ferramentas disponíveis`}
        right={
          <div className="hero__search">
            <Link className="btn btn--primary" to="/ferramentas">
              Explorar ferramentas →
            </Link>
            <Link className="btn btn--ghost" to="/submeter">
              Submeter
            </Link>
          </div>
        }
      />

      {warning ? <p className="note">{warning}</p> : null}
      {loading ? <p className="no-results">A carregar…</p> : null}
      {loadingMore && !loading ? <p className="note">A carregar mais ferramentas…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <Section
        title="A confiança de milhares"
        subtitle="Junta-te à comunidade que descobre as melhores ferramentas."
      >
        <div className="stats">
          <div className="stat">
            <div className="stat__icon">⚡</div>
            <div className="stat__value">{tools.length}+</div>
            <div className="stat__label">Ferramentas</div>
          </div>
          <div className="stat">
            <div className="stat__icon">👥</div>
            <div className="stat__value">50 000+</div>
            <div className="stat__label">Utilizadores</div>
          </div>
          <div className="stat">
            <div className="stat__icon">⭐</div>
            <div className="stat__value">25 000+</div>
            <div className="stat__label">Avaliações</div>
          </div>
          <div className="stat">
            <div className="stat__icon">📈</div>
            <div className="stat__value">{Math.max(1, categoryCounts.length)}+</div>
            <div className="stat__label">Categorias</div>
          </div>
        </div>
      </Section>

      <Section
        title="Explorar por categoria"
        subtitle="Descobre ferramentas organizadas por caso de uso e indústria."
      >
        <div className="categoryGrid">
          {categoryCounts.length ? (
            categoryCounts.map(([name, count]) => (
              <Link className="categoryCard" key={name} to="/ferramentas">
                <div className="categoryCard__icon">
                  <img
                    className="categoryCard__iconImg"
                    src={getCategoryIconDataUrl(name)}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <div className="categoryCard__name">{name}</div>
                <div className="categoryCard__meta">{count}+ ferramentas</div>
              </Link>
            ))
          ) : (
            <div className="categoryGrid__empty">A carregar categorias…</div>
          )}
        </div>
      </Section>

      <Section title="Registo" subtitle="Cria um perfil para personalizar a tua experiência.">
        <div className="cta">
          <div className="cta__text">
            <div className="cta__title">Junta-te ao AQUA AI Tools</div>
            <div className="cta__subtitle">
              Guarda preferências, acede mais rápido às tuas listas e submete ferramentas com identidade.
            </div>
          </div>
          <div className="cta__actions">
            <Link className="btn btn--primary" to="/signup">
              Criar conta →
            </Link>
            <Link className="btn btn--ghost" to="/signin">
              Entrar
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
