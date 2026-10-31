import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import ToolCard from '../components/ToolCard.jsx';
import { useTools } from '../hooks/useTools.js';
import { useLanguage } from '../i18n.jsx';
import { CATALOG_EVIDENCE } from '../lib/catalogEvidence.js';
import { getPreviewCandidates, getPreviewUrl } from '../lib/sitePreview.js';
import {
  getLocalizedToolAreas,
  getToolAreas,
  getToolDescription,
  getToolName,
  getToolNumber,
  getToolOperationalStatus,
  getToolPrice,
  getToolSite,
  getToolSlug,
  normalizeFuncoes,
  parseToolSlug,
  pickLogoUrls,
} from '../lib/tools.js';

function localizeOperationalStatus(value, isEn) {
  const normalized = String(value || '').trim().toLowerCase();
  const labels = {
    operational: { pt: 'Operacional', en: 'Operational' },
    inoperational: { pt: 'Não operacional', en: 'Not operational' },
    inactive: { pt: 'Inativo', en: 'Inactive' },
    active: { pt: 'Ativo', en: 'Active' },
  };
  return labels[normalized]?.[isEn ? 'en' : 'pt'] || value;
}

function ToolPreview({ tool, isEn }) {
  const [providerIndex, setProviderIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const site = getToolSite(tool);
  const logo = pickLogoUrls(tool).primary;
  const candidates = useMemo(() => getPreviewCandidates(site, { width: 1200 }), [site]);
  const preview = site && !failed ? getPreviewUrl(site, { width: 1200, providerIndex }) : '';

  useEffect(() => {
    setProviderIndex(0);
    setFailed(false);
  }, [site]);

  return (
    <div className="toolDetailPreview">
      {preview ? (
        <img
          className="toolDetailPreview__image"
          src={preview}
          alt={isEn ? `Website preview for ${getToolName(tool)}` : `Preview do site de ${getToolName(tool)}`}
          onError={() => {
            if (providerIndex + 1 < candidates.length) {
              setProviderIndex((value) => value + 1);
            } else {
              setFailed(true);
            }
          }}
        />
      ) : (
        <div className="toolDetailPreview__fallback">
          <img src={logo} alt="" aria-hidden="true" />
          <span>{isEn ? 'Website preview unavailable' : 'Preview do site indisponível'}</span>
        </div>
      )}
      <span className="toolDetailPreview__label">
        {isEn ? 'Website preview · may change after the catalogue audit' : 'Preview do website · pode mudar após a auditoria do catálogo'}
      </span>
    </div>
  );
}

function RelatedTools({ category, categoryKey, currentSlug, isEn }) {
  const { tools, loading } = useTools({
    initialPageSize: 8,
    filters: { area: categoryKey || category },
  });
  const related = tools.filter((tool) => getToolSlug(tool) !== currentSlug).slice(0, 3);
  if (loading || related.length === 0) return null;

  return (
    <Section
      title={isEn ? 'Related alternatives' : 'Alternativas relacionadas'}
      subtitle={
        isEn
          ? `Other catalogue records in ${category}. This is a category match, not an editorial ranking.`
          : `Outros registos do catálogo em ${category}. É uma correspondência de categoria, não um ranking editorial.`
      }
    >
      <div className="grid-container grid-container--modern toolDetailRelated">
        {related.map((tool) => <ToolCard key={getToolSlug(tool)} tool={tool} />)}
      </div>
    </Section>
  );
}

export default function ToolDetailPage() {
  const { toolSlug = '' } = useParams();
  const { path, isEn } = useLanguage();
  const lang = isEn ? 'en' : 'pt';
  const lookup = useMemo(() => parseToolSlug(toolSlug), [toolSlug]);
  const filters = lookup.number ? { number: lookup.number } : { q: lookup.nameQuery };
  const { tools, loading, error, refresh } = useTools({ initialPageSize: 12, filters });
  const tool = useMemo(
    () =>
      tools.find((item) => getToolSlug(item) === lookup.slug) ||
      tools.find((item) => lookup.number && getToolNumber(item) === lookup.number) ||
      (tools.length === 1 ? tools[0] : null),
    [tools, lookup.number, lookup.slug],
  );

  const name = tool ? getToolName(tool) : '';
  const description = tool ? getToolDescription(tool, lang) : '';
  const functions = tool ? normalizeFuncoes(tool['Funções']) : '';
  const areas = tool ? getLocalizedToolAreas(tool, lang) : [];
  const rawAreas = tool ? getToolAreas(tool) : [];
  const price = tool ? getToolPrice(tool) : '';
  const status = tool ? getToolOperationalStatus(tool) : '';
  const site = tool ? getToolSite(tool) : '';

  useEffect(() => {
    if (!tool) {
      if (!loading) {
        document.title = `${isEn ? 'Tool not found' : 'Ferramenta não encontrada'} | AQUA AI Tools`;
        document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex, follow');
      }
      return;
    }
    const title = `${name} | AQUA AI Tools`;
    const summary = description || (isEn ? 'Editorial description under review.' : 'Descrição editorial em revisão.');
    document.title = title;
    // Catalogue-only records stay out of the index until they contain a
    // substantive, manually reviewed editorial assessment.
    document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex, follow');
    document.querySelector('meta[name="description"]')?.setAttribute('content', summary);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', summary);
    const structuredData = document.querySelector('#aqua-structured-data');
    if (structuredData) {
      structuredData.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name,
        description: summary,
        applicationCategory: areas[0] || 'Artificial Intelligence',
        url: window.location.href,
        ...(site ? { sameAs: site } : {}),
        ...(price ? { offers: { '@type': 'Offer', description: price } } : {}),
      });
    }
  }, [areas, description, isEn, loading, name, price, site, tool]);

  if (loading && !tool) {
    return <p className="statePanel statePanel--loading">{isEn ? 'Loading tool details…' : 'A carregar detalhes da ferramenta…'}</p>;
  }

  if (!tool) {
    return (
      <div className="page toolDetailMissing">
        <h1>{isEn ? 'Tool not found' : 'Ferramenta não encontrada'}</h1>
        <p>
          {error
            ? (isEn ? 'The catalogue is temporarily unavailable.' : 'O catálogo está temporariamente indisponível.')
            : (isEn ? 'This record may have changed or left the public catalogue.' : 'Este registo pode ter mudado ou saído do catálogo público.')}
        </p>
        <div className="toolDetailMissing__actions">
          {error ? <button className="btn btn--primary" type="button" onClick={refresh}>{isEn ? 'Try again' : 'Tentar novamente'}</button> : null}
          <Link className="btn btn--ghost" to={path('/ferramentas')}>{isEn ? 'Back to directory' : 'Voltar ao diretório'}</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Hero
        title={name}
        subtitle={description || (isEn ? 'Editorial description under review.' : 'Descrição editorial em revisão.')}
        badge={getToolNumber(tool) ? `#${getToolNumber(tool)}` : (isEn ? 'Catalogue record' : 'Registo do catálogo')}
        right={
          <div className="hero__search">
            {site ? <a className="btn btn--primary" href={site} target="_blank" rel="noopener noreferrer">{isEn ? 'Visit tool ↗' : 'Visitar ferramenta ↗'}</a> : null}
            <Link className="btn btn--ghost" to={path('/ferramentas')}>{isEn ? 'Directory' : 'Diretório'}</Link>
          </div>
        }
      />

      <Section align="left" title={isEn ? 'Available information' : 'Informação disponível'}>
        <div className="toolDetailLayout">
          <ToolPreview tool={tool} isEn={isEn} />
          <aside className="toolDetailFacts" aria-label={isEn ? 'Tool facts' : 'Dados da ferramenta'}>
            <div>
              <span>{isEn ? 'Pricing model' : 'Modelo de preço'}</span>
              <strong>{price || (isEn ? 'Under review' : 'Em revisão')}</strong>
            </div>
            <div>
              <span>{isEn ? 'Operational status' : 'Estado operacional'}</span>
              <strong>{status ? localizeOperationalStatus(status, isEn) : (isEn ? 'Not verified' : 'Não verificado')}</strong>
            </div>
            <div>
              <span>{isEn ? 'Catalogue evidence' : 'Evidência do catálogo'}</span>
              <strong><time dateTime={CATALOG_EVIDENCE.auditedOn}>{isEn ? '24 Jul 2026' : '24 jul 2026'}</time></strong>
            </div>
          </aside>
        </div>
      </Section>

      <Section align="left" title={isEn ? 'Use and classification' : 'Utilização e classificação'}>
        <div className="toolDetailEditorial">
          <article>
            <h3>{isEn ? 'Reported functions' : 'Funções indicadas'}</h3>
            <p>{functions || (isEn ? 'Functions are still under editorial review.' : 'As funções continuam em revisão editorial.')}</p>
          </article>
          <article>
            <h3>{isEn ? 'Categories' : 'Categorias'}</h3>
            <div className="toolDetailTags">
              {areas.length
                ? areas.map((area, index) => (
                    <Link
                      key={area}
                      className="badge"
                      to={`${path('/ferramentas')}?area=${encodeURIComponent(area)}&areaKey=${encodeURIComponent(rawAreas[index] || area)}`}
                    >
                      {area}
                    </Link>
                  ))
                : <span className="badge badge--muted">{isEn ? 'Under review' : 'Em revisão'}</span>}
            </div>
          </article>
          <article className="toolDetailDisclosure">
            <h3>{isEn ? 'Editorial limits' : 'Limites editoriais'}</h3>
            <p>
              {isEn
                ? 'AQUA does not publish invented pros, cons, pricing or verification dates. Missing fields remain marked for review and the provider website remains the final source for current terms.'
                : 'A AQUA não publica prós, contras, preços ou datas de verificação inventados. Os campos em falta ficam marcados para revisão e o website do fornecedor é a fonte final para condições atuais.'}
            </p>
            <Link to={path('/sugestoes')}>{isEn ? 'Report a correction →' : 'Comunicar uma correção →'}</Link>
          </article>
        </div>
      </Section>

      {areas[0]
        ? <RelatedTools category={areas[0]} categoryKey={rawAreas[0]} currentSlug={getToolSlug(tool)} isEn={isEn} />
        : null}
    </>
  );
}
