import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { getCategoryIconDataUrl } from '../lib/categoryIcons.js';
import {
  getLocalizedToolAreas,
  getToolAreas,
  getLocalDateKey,
  getToolName,
  getToolNumber,
  getToolSlug,
  getToolSite,
  pickDailyFeaturedTools,
  pickLogoUrls,
} from '../lib/tools.js';
import { useTools } from '../hooks/useTools.js';
import { useLanguage } from '../i18n.jsx';
import { openNewsletterSignup } from '../components/NewsletterSignup.jsx';
import { CATALOG_EVIDENCE, formatPublishedRecords } from '../lib/catalogEvidence.js';
import { localizePost, posts } from '../blog/posts.js';

export default function HomePage() {
  const { path, isEn } = useLanguage();
  const lang = isEn ? 'en' : 'pt';
  const { tools, loading, error, warning, refresh } = useTools({ initialPageSize: 12 });

  const dateKey = useMemo(() => getLocalDateKey(), []);

  const featuredTools = useMemo(() => pickDailyFeaturedTools(tools, 6, dateKey), [tools, dateKey]);
  const isInitialLoading = loading && tools.length === 0;
  const publishedRecords = formatPublishedRecords(isEn ? 'en-GB' : 'pt-PT');
  const editorialGuides = useMemo(
    () => posts.map((post) => localizePost(post, isEn ? 'en' : 'pt')),
    [isEn],
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map();
    for (const t of tools) {
      const localized = getLocalizedToolAreas(t, lang);
      const raw = getToolAreas(t);
      for (const [index, label] of localized.entries()) {
        const current = counts.get(label) || { count: 0, key: raw[index] || label };
        counts.set(label, { ...current, count: current.count + 1 });
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8);
  }, [tools, lang]);

  return (
    <>
      <h1 className="srOnly">
        {isEn ? 'AQUA AI Tools — AI tools directory' : 'AQUA AI Tools — diretório de ferramentas de IA'}
      </h1>
      <Hero
        className="hero--home"
        showMark={false}
        subtitle={
          isEn
            ? 'Find the right AI tool for every need.'
            : 'Encontra a ferramenta de IA certa para cada necessidade.'
        }
        badge={
          isInitialLoading
            ? isEn ? 'Loading tools…' : 'A carregar ferramentas…'
            : error
              ? isEn ? 'Temporarily unavailable' : 'Temporariamente indisponível'
              : isEn
                ? `${publishedRecords} published records · audited 24 Jul 2026`
                : `${publishedRecords} registos publicados · auditoria em 24 jul 2026`
        }
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
            {isInitialLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
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
              ))
            ) : featuredTools.length ? (
              featuredTools.map((tool, idx) => {
                  const site = getToolSite(tool);
                  const area = getLocalizedToolAreas(tool, lang)[0] || (isEn ? 'Uncategorized' : 'Sem categoria');
                  const nome = getToolName(tool) || (isEn ? 'Tool' : 'Ferramenta');
                  const numero = getToolNumber(tool) || String(idx + 1);
                  const logoUrls = pickLogoUrls(tool);
                  return (
                    <article className="heroQuickCard" key={`${tool.id || numero || idx}`}>
                      <div className="heroQuickCard__meta">
                        <span className="heroQuickCard__badge">{area}</span>
                        <span className="heroQuickCard__number">#{numero}</span>
                      </div>
                      <div className="heroQuickCard__identity">
                        <span className="heroQuickCard__logoWrap">
                          <img
                            className="heroQuickCard__logo"
                            src={logoUrls.primary}
                            data-fallback={logoUrls.secondary}
                            data-fallbacks={
                              Array.isArray(logoUrls.fallbacks) && logoUrls.fallbacks.length
                                ? JSON.stringify(logoUrls.fallbacks)
                                : ''
                            }
                            alt={isEn ? `Logo for ${nome}` : `Logótipo de ${nome}`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(event) => {
                              const image = event.currentTarget;
                              const rawFallbacks = image.dataset.fallbacks;

                              if (rawFallbacks) {
                                try {
                                  const fallbacks = JSON.parse(rawFallbacks);
                                  const next = Array.isArray(fallbacks) ? fallbacks.shift() : '';
                                  if (next) {
                                    image.dataset.fallbacks = JSON.stringify(fallbacks);
                                    image.src = next;
                                    return;
                                  }
                                } catch {
                                  image.dataset.fallbacks = '';
                                }
                              }

                              const fallback = image.dataset.fallback;
                              if (fallback) {
                                image.dataset.fallback = '';
                                image.src = fallback;
                                return;
                              }

                              image.onerror = null;
                              image.src = '/assets/img/placeholder-ai-tools.png';
                            }}
                          />
                        </span>
                        <h2 className="heroQuickCard__title">{nome}</h2>
                      </div>
                      <div className="heroQuickCard__actions">
                        <Link className="btn btn--ghost btn--sm" to={path(`/ferramentas/${getToolSlug(tool)}`)}>
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
            ) : (
              <div className="heroQuick__empty">
                <strong>{error ? (isEn ? 'Tools are unavailable right now.' : 'As ferramentas estão temporariamente indisponíveis.') : (isEn ? 'No tools available yet.' : 'Ainda não existem ferramentas disponíveis.')}</strong>
                {error ? (
                  <button className="btn btn--ghost btn--sm" type="button" onClick={refresh}>{isEn ? 'Try again' : 'Tentar novamente'}</button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </Hero>

      <div className="catalogueStatus" aria-live="polite" aria-atomic="true">
        {!isInitialLoading && error ? (
          <div className="statePanel statePanel--error" role="alert">
            <div>
              <strong>{isEn ? 'We could not load the catalogue.' : 'Não foi possível carregar o catálogo.'}</strong>
              <span>{isEn ? 'Try again to continue exploring.' : 'Tenta novamente para continuares a explorar.'}</span>
            </div>
            <button className="btn btn--primary btn--sm" type="button" onClick={refresh}>{isEn ? 'Try again' : 'Tentar novamente'}</button>
          </div>
        ) : !isInitialLoading && warning ? (
          <p className="statePanel statePanel--warning">{warning}</p>
        ) : null}
      </div>

      <Section
        className="homeCategories"
        title={isEn ? 'Browse by category' : 'Explorar por categoria'}
        subtitle={
          isEn
            ? 'Discover tools grouped by use case and industry.'
            : 'Descobre ferramentas organizadas por caso de uso e indústria.'
        }
      >
        <div className="categoryGrid">
          {categoryCounts.length ? (
            categoryCounts.map(([name, category]) => (
              <Link
                className="categoryCard"
                key={name}
                to={`${path('/ferramentas')}?area=${encodeURIComponent(name)}&areaKey=${encodeURIComponent(category.key)}`}
              >
                <div className="categoryCard__icon">
                  <img
                    className="categoryCard__iconImg"
                    src={getCategoryIconDataUrl(name)}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <div className="categoryCard__name">{name}</div>
                <div className="categoryCard__meta">
                  {isEn ? `${category.count} in this selection` : `${category.count} nesta seleção`}
                </div>
              </Link>
            ))
          ) : (
            <div className="categoryGrid__empty">
              {isInitialLoading
                ? (isEn ? 'Loading categories…' : 'A carregar categorias…')
                : error
                  ? (isEn ? 'Categories are temporarily unavailable.' : 'As categorias estão temporariamente indisponíveis.')
                  : (isEn ? 'No categories available yet.' : 'Ainda não existem categorias disponíveis.')}
            </div>
          )}
        </div>
      </Section>

      <Section
        className="homeTrust"
        title={isEn ? 'How we build trust' : 'Como construímos confiança'}
        subtitle={
          isEn
            ? 'Clear provenance, dated evidence and honest limits.'
            : 'Origem clara, evidência datada e limites assumidos.'
        }
      >
        <div className="trustGrid">
          <article className="trustCard">
            <span className="trustCard__eyebrow">{isEn ? 'Published base' : 'Base publicada'}</span>
            <strong>{publishedRecords}</strong>
            <p>{isEn ? 'catalogue records in the last release audit' : 'registos do catálogo na última auditoria de release'}</p>
          </article>
          <article className="trustCard">
            <span className="trustCard__eyebrow">{isEn ? 'Last catalogue audit' : 'Última auditoria do catálogo'}</span>
            <strong><time dateTime={CATALOG_EVIDENCE.auditedOn}>{isEn ? '24 Jul 2026' : '24 jul 2026'}</time></strong>
            <p>{isEn ? 'automated checks for taxonomy, links and duplicates' : 'controlos automáticos de taxonomia, links e duplicados'}</p>
          </article>
          <article className="trustCard">
            <span className="trustCard__eyebrow">{isEn ? 'Editorial status' : 'Estado editorial'}</span>
            <strong>{isEn ? 'In review' : 'Em revisão'}</strong>
            <p>{isEn ? 'descriptions and operational status are not presented as verified' : 'descrições e estado operacional não são apresentados como verificados'}</p>
          </article>
        </div>
        <div className="trustActions">
          <Link className="btn btn--ghost" to={path('/sobre')}>
            {isEn ? 'Read the methodology' : 'Consultar metodologia'}
          </Link>
          <Link className="trustActions__link" to={path('/sugestoes')}>
            {isEn ? 'Report a correction →' : 'Comunicar uma correção →'}
          </Link>
        </div>
      </Section>

      <Section
        className="homeEditorial"
        title={isEn ? 'Make a better decision' : 'Decide melhor, não apenas mais depressa'}
        subtitle={
          isEn
            ? 'Original, step-by-step guides for selecting and evaluating AI tools with evidence.'
            : 'Guias originais, passo a passo, para escolher e avaliar ferramentas de IA com evidência.'
        }
      >
        <div className="grid-container homeEditorial__grid">
          {editorialGuides.map((guide) => (
            <Link key={guide.slug} className="blogCard homeEditorialCard" to={path(`/blog/${guide.slug}`)}>
              <div className="blogCard__meta">
                <span className="badge badge--muted">{guide.readingTime}</span>
                <span className="badge">{guide.tags?.[0]}</span>
              </div>
              <h2 className="blogCard__title">{guide.title}</h2>
              <p className="blogCard__excerpt">{guide.excerpt}</p>
              <span className="homeEditorialCard__link">{isEn ? 'Read the guide →' : 'Ler o guia →'}</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title={isEn ? 'A better AI shortlist, every week' : 'Uma seleção melhor de IA, todas as semanas'}
        subtitle={isEn ? 'A short, useful newsletter tailored to your interests.' : 'Uma newsletter curta, útil e ajustada aos teus interesses.'}
      >
        <div className="newsletterCta">
          <div className="newsletterCta__mark" aria-hidden="true">✦</div>
          <div className="newsletterCta__text">
            <div className="newsletterCta__eyebrow">AQUA WEEKLY</div>
            <div className="newsletterCta__title">{isEn ? '5 tools. One theme. Zero noise.' : '5 ferramentas. Um tema. Zero ruído.'}</div>
            <div className="newsletterCta__subtitle">{isEn ? 'Choose your themes and receive hand-picked recommendations every week.' : 'Escolhe os teus temas e recebe recomendações selecionadas todas as semanas.'}</div>
          </div>
          <button className="btn btn--primary" type="button" onClick={openNewsletterSignup}>{isEn ? 'Choose themes →' : 'Escolher temas →'}</button>
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
