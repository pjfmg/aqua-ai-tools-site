import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { getCategoryIconDataUrl } from '../lib/categoryIcons.js';
import { getLocalDateKey, getToolAreas, getToolName, getToolNumber, getToolSite, pickDailyFeaturedTools } from '../lib/tools.js';
import { useTools } from '../hooks/useTools.js';
import { useLanguage } from '../i18n.jsx';

export default function HomePage() {
  const { path, isEn } = useLanguage();
  const { tools, loading, loadingMore, error, warning } = useTools({ initialPageSize: 12 });

  const dateKey = useMemo(() => getLocalDateKey(), []);

  const featuredTools = useMemo(() => pickDailyFeaturedTools(tools, 6, dateKey), [tools, dateKey]);

  const categoryCounts = useMemo(() => {
    const counts = new Map();
    for (const t of tools) {
      for (const a of getToolAreas(t)) {
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
        subtitle={
          isEn
            ? 'Find the right AI tool for every need: search, filters and personal lists.'
            : 'Encontra a ferramenta de IA certa para cada necessidade — pesquisa, filtros e listas.'
        }
        badge={isEn ? `${tools.length} tools available` : `${tools.length} ferramentas disponíveis`}
        right={
          <div className="hero__search">
            <Link className="btn btn--primary" to={path('/ferramentas')}>
              {isEn ? 'Explore tools →' : 'Explorar ferramentas →'}
            </Link>
            <Link className="btn btn--ghost" to={path('/submeter')}>
              {isEn ? 'Submit' : 'Submeter'}
            </Link>
          </div>
        }
      >
        <div className="heroQuick">
          <div className="heroQuick__head">
            <div className="heroQuick__title">{isEn ? 'Start here' : 'Comeca por aqui'}</div>
            <Link className="heroQuick__link" to={path('/ferramentas')}>
              {isEn ? 'View all' : 'Ver tudo'}
            </Link>
          </div>
          <div className="heroQuick__rail">
            {featuredTools.length
              ? featuredTools.map((tool, idx) => {
                  const site = getToolSite(tool);
                  const area = getToolAreas(tool)[0] || (isEn ? 'Uncategorized' : 'Sem categoria');
                  const nome = getToolName(tool) || (isEn ? 'Tool' : 'Ferramenta');
                  const numero = getToolNumber(tool) || String(idx + 1);
                  return (
                    <article className="heroQuickCard" key={`${tool.id || numero || idx}`}>
                      <div className="heroQuickCard__meta">
                        <span className="heroQuickCard__badge">{area}</span>
                        <span className="heroQuickCard__number">#{numero}</span>
                      </div>
                      <h2 className="heroQuickCard__title">{nome}</h2>
                      <div className="heroQuickCard__actions">
                        <Link className="btn btn--ghost btn--sm" to={path('/ferramentas')}>
                          {isEn ? 'Details' : 'Detalhes'}
                        </Link>
                        {site ? (
                          <a className="btn btn--primary btn--sm" href={site}>
                            {isEn ? 'Open' : 'Abrir'}
                          </a>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              : Array.from({ length: 4 }).map((_, idx) => (
                  <article className="heroQuickCard heroQuickCard--skeleton" key={`hero-skeleton-${idx}`} aria-hidden="true">
                    <div className="heroQuickCard__meta">
                      <span className="heroQuickCard__badge heroQuickCard__badge--skeleton" />
                      <span className="heroQuickCard__number heroQuickCard__number--skeleton" />
                    </div>
                    <div className="heroQuickCard__line heroQuickCard__line--title" />
                    <div className="heroQuickCard__actions">
                      <span className="btn btn--ghost btn--sm btn--skeleton" />
                      <span className="btn btn--primary btn--sm btn--skeleton" />
                    </div>
                  </article>
                ))}
          </div>
        </div>
      </Hero>

      {warning ? <p className="note">{warning}</p> : null}
      {loadingMore && !loading ? <p className="note">{isEn ? 'Loading more tools…' : 'A carregar mais ferramentas…'}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <Section
        title={isEn ? 'Trusted by thousands' : 'A confiança de milhares'}
        subtitle={
          isEn
            ? 'Join the community discovering better AI tools.'
            : 'Junta-te à comunidade que descobre as melhores ferramentas.'
        }
      >
        <div className="stats">
          <div className="stat">
            <div className="stat__icon">⚡</div>
            <div className="stat__value">{tools.length}+</div>
            <div className="stat__label">{isEn ? 'Tools' : 'Ferramentas'}</div>
          </div>
          <div className="stat">
            <div className="stat__icon">👥</div>
            <div className="stat__value">5 000+</div>
            <div className="stat__label">{isEn ? 'Users' : 'Utilizadores'}</div>
          </div>
          <div className="stat">
            <div className="stat__icon">⭐</div>
            <div className="stat__value">250+</div>
            <div className="stat__label">{isEn ? 'Reviews' : 'Avaliações'}</div>
          </div>
          <div className="stat">
            <div className="stat__icon">📈</div>
            <div className="stat__value">{Math.max(1, categoryCounts.length)}+</div>
            <div className="stat__label">{isEn ? 'Categories' : 'Categorias'}</div>
          </div>
        </div>
      </Section>

      <Section
        title={isEn ? 'Browse by category' : 'Explorar por categoria'}
        subtitle={
          isEn
            ? 'Discover tools grouped by use case and industry.'
            : 'Descobre ferramentas organizadas por caso de uso e indústria.'
        }
      >
        <div className="categoryGrid">
          {categoryCounts.length ? (
            categoryCounts.map(([name, count]) => (
              <Link className="categoryCard" key={name} to={path('/ferramentas')}>
                <div className="categoryCard__icon">
                  <img
                    className="categoryCard__iconImg"
                    src={getCategoryIconDataUrl(name)}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <div className="categoryCard__name">{name}</div>
                <div className="categoryCard__meta">{isEn ? `${count}+ tools` : `${count}+ ferramentas`}</div>
              </Link>
            ))
          ) : (
            <div className="categoryGrid__empty">{isEn ? 'Loading categories…' : 'A carregar categorias…'}</div>
          )}
        </div>
      </Section>

      <Section
        title={isEn ? 'Account' : 'Registo'}
        subtitle={isEn ? 'Create a profile to personalize your experience.' : 'Cria um perfil para personalizar a tua experiência.'}
      >
        <div className="cta">
          <div className="cta__text">
            <div className="cta__title">{isEn ? 'Join AQUA AI Tools' : 'Junta-te ao AQUA AI Tools'}</div>
            <div className="cta__subtitle">
              {isEn
                ? 'Save preferences, access your lists faster and submit tools with an identity.'
                : 'Guarda preferências, acede mais rápido às tuas listas e submete ferramentas com identidade.'}
            </div>
          </div>
          <div className="cta__actions">
            <Link className="btn btn--primary" to={path('/signup')}>
              {isEn ? 'Create account →' : 'Criar conta →'}
            </Link>
            <Link className="btn btn--ghost" to={path('/signin')}>
              {isEn ? 'Sign in' : 'Entrar'}
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
