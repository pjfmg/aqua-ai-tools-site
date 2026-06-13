import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { getCategoryIconDataUrl } from '../lib/categoryIcons.js';
import { getLocalizedToolAreas, getLocalDateKey, getToolName, getToolNumber, getToolSite, pickDailyFeaturedTools } from '../lib/tools.js';
import { useTools } from '../hooks/useTools.js';
import { useLanguage } from '../i18n.jsx';

const TOP_AI_TOOL_GROUPS = [
  {
    pt: 'Texto e Conteúdo',
    en: 'Text and Content',
    tools: [
      { name: 'Jasper', affiliateProgramUrl: '', affiliateStatus: 'pending' },
      { name: 'Writesonic', affiliateProgramUrl: '', affiliateStatus: 'pending' },
      { name: 'Copy.ai', affiliateProgramUrl: '', affiliateStatus: 'pending' },
      { name: 'QuillBot', affiliateProgramUrl: '', affiliateStatus: 'pending' },
    ],
  },
  {
    pt: 'Vídeo',
    en: 'Video',
    tools: [
      { name: 'Synthesia', affiliateProgramUrl: '', affiliateStatus: 'pending' },
      { name: 'Pictory', affiliateProgramUrl: '', affiliateStatus: 'pending' },
      { name: 'DeepBrain', affiliateProgramUrl: '', affiliateStatus: 'pending' },
    ],
  },
  {
    pt: 'Voz',
    en: 'Voice',
    tools: [
      { name: 'ElevenLabs', affiliateProgramUrl: '', affiliateStatus: 'pending' },
      { name: 'Murf', affiliateProgramUrl: '', affiliateStatus: 'pending' },
    ],
  },
  {
    pt: 'Produtividade',
    en: 'Productivity',
    tools: [
      { name: 'Notion AI', affiliateProgramUrl: '', affiliateStatus: 'pending' },
      { name: 'ClickUp AI', affiliateProgramUrl: '', affiliateStatus: 'pending' },
    ],
  },
  {
    pt: 'SEO e Marketing',
    en: 'SEO and Marketing',
    tools: [
      { name: 'Surfer SEO', affiliateProgramUrl: '', affiliateStatus: 'pending' },
      { name: 'Semrush', affiliateProgramUrl: '', affiliateStatus: 'pending' },
      { name: 'AdCreative', affiliateProgramUrl: '', affiliateStatus: 'pending' },
    ],
  },
  {
    pt: 'Criação de Apps',
    en: 'App Creation',
    tools: [
      { name: 'Lovable', affiliateProgramUrl: '', affiliateStatus: 'pending' },
      { name: 'Durable', affiliateProgramUrl: '', affiliateStatus: 'pending' },
    ],
  },
];

const AQUATICUS_AFFILIATE_PROFILE = {
  brand: 'AQUATICUS / AQUA AI Tools',
  contactEmail: 'aquaticus@mail.telepac.pt',
  website: 'AQUA AI Tools',
  channel: {
    pt: 'Diretório curado de ferramentas de IA, com pesquisa, filtros, destaques editoriais e páginas de descoberta.',
    en: 'Curated AI tools directory with search, filters, editorial picks and discovery pages.',
  },
  audience: {
    pt: 'Criadores, freelancers, pequenas empresas e equipas que procuram ferramentas de IA para conteúdo, vídeo, voz, produtividade, marketing e criação de apps.',
    en: 'Creators, freelancers, small businesses and teams looking for AI tools for content, video, voice, productivity, marketing and app creation.',
  },
};

function getAffiliateStatusLabel(status, isEn) {
  if (status === 'ready') return isEn ? 'Ready' : 'Pronto';
  if (status === 'applied') return isEn ? 'Applied' : 'Candidatado';
  return isEn ? 'Link pending' : 'Link pendente';
}

export default function HomePage() {
  const { path, isEn } = useLanguage();
  const lang = isEn ? 'en' : 'pt';
  const { tools, loading, loadingMore, error, warning } = useTools({ initialPageSize: 12 });

  const dateKey = useMemo(() => getLocalDateKey(), []);

  const featuredTools = useMemo(() => pickDailyFeaturedTools(tools, 6, dateKey), [tools, dateKey]);

  const categoryCounts = useMemo(() => {
    const counts = new Map();
    for (const t of tools) {
      for (const a of getLocalizedToolAreas(t, lang)) {
        counts.set(a, (counts.get(a) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [tools, lang]);

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
                  const area = getLocalizedToolAreas(tool, lang)[0] || (isEn ? 'Uncategorized' : 'Sem categoria');
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
        title={isEn ? 'Top AI Tools' : 'Top Ferramentas AI'}
        subtitle={
          isEn
            ? 'A curated starting point for high-quality affiliate tools, organized by the use cases most likely to convert.'
            : 'Um ponto de partida curado para ferramentas afiliadas de qualidade, organizado pelos casos de uso com maior potencial de conversão.'
        }
        align="left"
      >
        <div className="topTools">
          <div className="topTools__intro">
            <div>
              <div className="topTools__eyebrow">{isEn ? 'Monetization focus' : 'Foco de monetização'}</div>
              <p className="topTools__text">
                {isEn
                  ? 'For a young directory, the strongest first target is 30-50 carefully selected tools instead of hundreds of low-intent listings.'
                  : 'Para um diretório ainda pequeno, o melhor objetivo inicial é chegar a 30-50 ferramentas bem selecionadas, em vez de centenas de listagens pouco qualificadas.'}
              </p>
            </div>
            <div className="topTools__actions">
              <Link className="btn btn--primary" to={path('/ferramentas')}>
                {isEn ? 'Explore tools' : 'Explorar ferramentas'}
              </Link>
              <Link className="btn btn--ghost" to={path('/submeter')}>
                {isEn ? 'Suggest a tool' : 'Sugerir ferramenta'}
              </Link>
            </div>
          </div>

          <div className="topTools__grid">
            {TOP_AI_TOOL_GROUPS.map((group) => (
              <article className="topToolsCard" key={group.en}>
                <div className="topToolsCard__head">
                  <h3>{isEn ? group.en : group.pt}</h3>
                  <span>{group.tools.length}</span>
                </div>
                <div className="topToolsCard__list">
                  {group.tools.map((tool) => (
                    <div className="topToolsCard__toolRow" key={tool.name}>
                      <Link className="topToolsCard__tool" to={path(`/ferramentas?search=${encodeURIComponent(tool.name)}`)}>
                        {tool.name}
                      </Link>
                      {tool.affiliateProgramUrl ? (
                        <a
                          className="topToolsCard__affiliate"
                          href={tool.affiliateProgramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {isEn ? 'Affiliate program' : 'Programa afiliado'}
                        </a>
                      ) : (
                        <span className="topToolsCard__affiliate topToolsCard__affiliate--pending">
                          {getAffiliateStatusLabel(tool.affiliateStatus, isEn)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="affiliateProfile">
            <div>
              <div className="affiliateProfile__eyebrow">{isEn ? 'Application data' : 'Dados para candidatura'}</div>
              <h3>{AQUATICUS_AFFILIATE_PROFILE.brand}</h3>
              <p>{isEn ? AQUATICUS_AFFILIATE_PROFILE.channel.en : AQUATICUS_AFFILIATE_PROFILE.channel.pt}</p>
            </div>
            <dl className="affiliateProfile__facts">
              <div>
                <dt>{isEn ? 'Contact' : 'Contacto'}</dt>
                <dd>{AQUATICUS_AFFILIATE_PROFILE.contactEmail}</dd>
              </div>
              <div>
                <dt>{isEn ? 'Website' : 'Website'}</dt>
                <dd>{AQUATICUS_AFFILIATE_PROFILE.website}</dd>
              </div>
              <div>
                <dt>{isEn ? 'Audience' : 'Audiência'}</dt>
                <dd>{isEn ? AQUATICUS_AFFILIATE_PROFILE.audience.en : AQUATICUS_AFFILIATE_PROFILE.audience.pt}</dd>
              </div>
            </dl>
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
