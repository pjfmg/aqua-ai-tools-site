import React, { useEffect, useMemo, useRef, useState } from 'react';
import ToolCard from '../components/ToolCard.jsx';
import Hero from '../components/Hero.jsx';
import {
  getHostnameFromWebsiteUrl,
  getLocalDateKey,
  normalizeArea,
  normalizeWebsiteUrl,
  pickDailyFeaturedTools,
  pickLogoUrls,
} from '../lib/tools.js';
import { getPreviewCandidates, getPreviewUrl } from '../lib/sitePreview.js';
import { useTools } from '../hooks/useTools.js';

function buildAreaOptions(tools) {
  const set = new Set();
  for (const t of tools) {
    for (const a of normalizeArea(t['Área/Categoria'])) set.add(a);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt'));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function ToolsPage({ title = 'AQUA AI Tools', mode = 'all', autoFocusSearch = false }) {
  const { tools, loading, loadingMore, error, warning } = useTools();

  const [filterNome, setFilterNome] = useState('');
  const [filterNumero, setFilterNumero] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterPreco, setFilterPreco] = useState('');
  const [filterVisitado, setFilterVisitado] = useState('');
  const [filterFavorito, setFilterFavorito] = useState('');
  const [sortDir, setSortDir] = useState(mode === 'destaques' ? 'RAND' : 'AZ'); // 'AZ' | 'ZA' | 'RAND'
  const [visibleCount, setVisibleCount] = useState(50);

  const areaOptions = useMemo(() => buildAreaOptions(tools), [tools]);

  const dateKey = useMemo(() => getLocalDateKey(), []);

  const baseTools = useMemo(() => {
    if (mode !== 'destaques') return tools;
    return pickDailyFeaturedTools(tools, 10, dateKey);
  }, [tools, mode, dateKey]);

  const filtered = useMemo(() => {
    const nome = filterNome.trim().toLowerCase();
    const numero = filterNumero.trim();

    let out = baseTools.filter((t) => {
      if (mode === 'favoritas' && String(t['Favorito'] || '') !== 'Sim') return false;
      if (mode === 'visitadas' && String(t['Visitado'] || '') !== 'Sim') return false;

      if (nome && !String(t['Nome'] || '').toLowerCase().includes(nome)) return false;
      if (numero && String(t['Número'] || '').trim() !== numero) return false;
      if (filterArea) {
        const areas = normalizeArea(t['Área/Categoria']);
        if (!areas.includes(filterArea)) return false;
      }
      if (filterPreco && String(t['Preço'] || '').trim() !== filterPreco) return false;
      if (filterVisitado && String(t['Visitado'] || '') !== filterVisitado) return false;
      if (filterFavorito && String(t['Favorito'] || '') !== filterFavorito) return false;
      return true;
    });

    if (sortDir !== 'RAND') {
      out = out.sort((a, b) => {
        const av = String(a['Nome'] || '');
        const bv = String(b['Nome'] || '');
        return sortDir === 'AZ' ? av.localeCompare(bv, 'pt') : bv.localeCompare(av, 'pt');
      });
    }

    return out;
  }, [
    baseTools,
    mode,
    filterNome,
    filterNumero,
    filterArea,
    filterPreco,
    filterVisitado,
    filterFavorito,
    sortDir,
  ]);

  useEffect(() => {
    setVisibleCount(50);
  }, [mode, filterNome, filterNumero, filterArea, filterPreco, filterVisitado, filterFavorito, sortDir]);

  useEffect(() => {
    if (mode !== 'destaques') return;
    setSortDir('RAND');
  }, [mode]);

  useEffect(() => {
    function onScroll() {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (!nearBottom) return;
      setVisibleCount((c) => Math.min(c + 50, filtered.length));
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [filtered.length]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const [hoveredTool, setHoveredTool] = useState(null);
  const [hoverAnchorRect, setHoverAnchorRect] = useState(null);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [hoverPreviewFailed, setHoverPreviewFailed] = useState(false);
  const [hoverNonce, setHoverNonce] = useState(0);
  const [hoverProviderIdx, setHoverProviderIdx] = useState(0);
  const [hoverDisplayedSrc, setHoverDisplayedSrc] = useState('');
  const [hoverPendingSrc, setHoverPendingSrc] = useState('');
  const [hoverLogoFailed, setHoverLogoFailed] = useState(false);

  const hoverEnterTimerRef = useRef(null);
  const hoverCloseTimerRef = useRef(null);
  const hoverOpenRef = useRef(false);
  const hoverPreviewSrcRef = useRef('');
  const hoverProviderIdxRef = useRef(0);
  const hoverProvidersCountRef = useRef(0);

  useEffect(() => {
    hoverOpenRef.current = hoverOpen;
  }, [hoverOpen]);

  function clearHoverTimers() {
    if (hoverEnterTimerRef.current) window.clearTimeout(hoverEnterTimerRef.current);
    if (hoverCloseTimerRef.current) window.clearTimeout(hoverCloseTimerRef.current);
    hoverEnterTimerRef.current = null;
    hoverCloseTimerRef.current = null;
  }

  function canHoverPreview() {
    if (typeof window === 'undefined') return false;
    // Avoid showing hover previews on touch devices.
    return window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches ?? true;
  }

  function openHoverPreview(tool, el) {
    if (mode !== 'all') return;
    if (!tool || !el) return;
    if (!canHoverPreview()) return;

    clearHoverTimers();
    setHoveredTool(tool);
    setHoverAnchorRect(el.getBoundingClientRect());
    setHoverPreviewFailed(false);
    setHoverNonce(0);
    setHoverProviderIdx(0);
    setHoverDisplayedSrc('');
    setHoverPendingSrc('');
    setHoverLogoFailed(false);
    hoverEnterTimerRef.current = window.setTimeout(() => setHoverOpen(true), 120);
  }

  function scheduleCloseHoverPreview() {
    clearHoverTimers();
    hoverCloseTimerRef.current = window.setTimeout(() => setHoverOpen(false), 140);
  }

  function keepHoverPreviewOpen() {
    if (hoverCloseTimerRef.current) window.clearTimeout(hoverCloseTimerRef.current);
    hoverCloseTimerRef.current = null;
  }

  useEffect(() => {
    if (!hoverOpen) return undefined;

    function close() {
      setHoverOpen(false);
    }

    window.addEventListener('scroll', close, { passive: true });
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
    };
  }, [hoverOpen]);

  useEffect(() => {
    if (!hoverOpen) {
      setHoverDisplayedSrc('');
      setHoverPendingSrc('');
    }
  }, [hoverOpen]);

  useEffect(() => {
    return () => clearHoverTimers();
  }, []);

  const hoverSite = useMemo(() => normalizeWebsiteUrl(hoveredTool?.Site || ''), [hoveredTool]);
  const hoverHostname = useMemo(() => getHostnameFromWebsiteUrl(hoverSite), [hoverSite]);
  const hoverLogo = useMemo(() => (hoveredTool ? pickLogoUrls(hoveredTool).primary : ''), [hoveredTool]);
  const hoverPreviewSrc = useMemo(() => {
    if (!hoverSite) return '';
    return getPreviewUrl(hoverSite, { width: 900, providerIndex: hoverProviderIdx, nonce: hoverNonce });
  }, [hoverSite, hoverProviderIdx, hoverNonce]);
  const hoverPreloadSrc = hoverPreviewSrc;

  const hoverProvidersCount = useMemo(() => getPreviewCandidates(hoverSite, { width: 900 }).length, [hoverSite]);

  useEffect(() => {
    hoverPreviewSrcRef.current = hoverPreviewSrc;
  }, [hoverPreviewSrc]);

  useEffect(() => {
    hoverProviderIdxRef.current = hoverProviderIdx;
  }, [hoverProviderIdx]);

  useEffect(() => {
    hoverProvidersCountRef.current = hoverProvidersCount;
  }, [hoverProvidersCount]);

  const hoverLoading = Boolean(
    hoverOpen &&
      hoverPreviewSrc &&
      !hoverPreviewFailed &&
      (hoverPendingSrc === hoverPreviewSrc || (!hoverDisplayedSrc && hoverPendingSrc)),
  );

  function failHoverPreview(expectedSrc) {
    if (!hoverOpenRef.current) return;
    if (!expectedSrc) return;
    // Ignore late events for older preview URLs.
    if (expectedSrc !== hoverPreviewSrcRef.current) return;

    setHoverPendingSrc('');
    const idx = hoverProviderIdxRef.current;
    const count = hoverProvidersCountRef.current;
    if (idx + 1 < count) {
      setHoverProviderIdx((i) => i + 1);
      setHoverNonce((n) => n + 1);
      return;
    }
    setHoverPreviewFailed(true);
  }

  useEffect(() => {
    if (!hoverOpen) return undefined;
    if (!hoverPreviewSrc) return undefined;
    if (hoverPreviewFailed) return undefined;

    // Mark as pending so the UI shows the loading badge while we wait for the hidden preloader <img>.
    if (hoverDisplayedSrc !== hoverPreviewSrc && hoverPendingSrc !== hoverPreviewSrc) {
      setHoverPendingSrc(hoverPreviewSrc);
    }

    // Some image requests can hang indefinitely and never fire onload/onerror.
    const expected = hoverPreviewSrc;
    const timeoutId = window.setTimeout(() => failHoverPreview(expected), 7000);
    return () => window.clearTimeout(timeoutId);
  }, [
    hoverOpen,
    hoverPreviewSrc,
    hoverDisplayedSrc,
    hoverPendingSrc,
    hoverPreviewFailed,
    hoverProviderIdx,
    hoverProvidersCount,
  ]);

  useEffect(() => {
    if (!hoverOpen) return undefined;
    if (!hoverSite) return undefined;
    if (hoverPreviewFailed) return undefined;
    const max = hoverProviderIdx === 0 ? 2 : 6;
    const delay = hoverProviderIdx === 0 ? 1200 : 1800;
    if (hoverNonce >= max) return undefined;

    const t = window.setTimeout(() => {
      setHoverNonce((n) => n + 1);
    }, delay);
    return () => window.clearTimeout(t);
  }, [hoverOpen, hoverSite, hoverProviderIdx, hoverPreviewFailed, hoverNonce]);

  const hoverStyle = useMemo(() => {
    if (!hoverOpen || !hoverAnchorRect || typeof window === 'undefined') return null;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 16;
    const maxW = 620;
    const minW = 380;
    const w = clamp(Math.round(vw * 0.36), minW, maxW);
    const h = Math.round(w * (10 / 16));

    let left = hoverAnchorRect.right + gap;
    if (left + w > vw - 12) left = hoverAnchorRect.left - gap - w;
    left = clamp(left, 12, vw - w - 12);

    let top = hoverAnchorRect.top + hoverAnchorRect.height / 2 - h / 2;
    top = clamp(top, 12, vh - h - 12);

    return { left, top, width: w, height: h };
  }, [hoverOpen, hoverAnchorRect]);

  function reset() {
    setFilterNome('');
    setFilterNumero('');
    setFilterArea('');
    setFilterPreco('');
    setFilterVisitado('');
    setFilterFavorito('');
    setSortDir('AZ');
  }

  return (
    <>
      <Hero
        title={title}
        subtitle={
          mode === 'favoritas'
            ? 'A tua lista de favoritas.'
            : mode === 'visitadas'
              ? 'Ferramentas que já visitaste.'
              : mode === 'destaques'
                ? `Seleção diária aleatória (atualiza em ${dateKey}).`
              : 'Explora e filtra a base de dados.'
        }
        badge={mode === 'destaques' ? `${Math.min(10, baseTools.length)} destaques` : `${filtered.length} resultados`}
        right={
          <div className="hero__miniSearch">
            <input
              className="input input--hero"
              type="text"
              placeholder="Pesquisar…"
              value={filterNome}
              autoFocus={autoFocusSearch}
              onChange={(e) => setFilterNome(e.target.value)}
            />
          </div>
        }
      >
        <div className="filters">
          <div className="filters__row">
            <div className="field field--numero">
              <label className="field__label" htmlFor="filter-numero">
                Número
              </label>
              <input
                className="input input--numero"
                type="text"
                id="filter-numero"
                placeholder="Número"
                value={filterNumero}
                onChange={(e) => setFilterNumero(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="filter-area">
                Categoria
              </label>
              <select
                id="filter-area"
                className="select"
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
              >
                <option value="">Todas</option>
                {areaOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="filter-preco">
                Preço
              </label>
              <select
                id="filter-preco"
                className="select"
                value={filterPreco}
                onChange={(e) => setFilterPreco(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Gratuito">Gratuito</option>
                <option value="Freemium">Freemium</option>
                <option value="Pago">Pago</option>
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="filter-visitado">
                Visitado
              </label>
              <select
                id="filter-visitado"
                className="select"
                value={filterVisitado}
                onChange={(e) => setFilterVisitado(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="filter-favorito">
                Favorito
              </label>
              <select
                id="filter-favorito"
                className="select"
                value={filterFavorito}
                onChange={(e) => setFilterFavorito(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>

            <div className="filters__actions">
              {mode === 'destaques' ? (
                <button
                  className={`btn btn--sm ${sortDir === 'RAND' ? 'btn--primary' : 'btn--ghost'}`}
                  onClick={() => setSortDir('RAND')}
                  type="button"
                >
                  Aleatório
                </button>
              ) : null}
              <button className={`btn btn--sm ${sortDir === 'AZ' ? 'btn--primary' : 'btn--ghost'}`} onClick={() => setSortDir('AZ')}>
                A-Z
              </button>
              <button className={`btn btn--sm ${sortDir === 'ZA' ? 'btn--primary' : 'btn--ghost'}`} onClick={() => setSortDir('ZA')}>
                Z-A
              </button>
              <button className="btn btn--sm btn--ghost" onClick={reset}>
                Limpar
              </button>
            </div>
          </div>
        </div>
      </Hero>

      {warning ? <p className="note">{warning}</p> : null}
      {loading ? <p className="no-results">A carregar…</p> : null}
      {loadingMore && !loading ? <p className="note">A carregar mais ferramentas…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <main id="tools-container" className="grid-container grid-container--modern">
        {!loading && visible.length === 0 ? (
          mode === 'favoritas' ? (
            <p className="no-results">Ainda não tens favoritas. Clica no ♥ numa ferramenta para a guardar.</p>
          ) : mode === 'visitadas' ? (
            <p className="no-results">Ainda não tens ferramentas visitadas. Clica em “Visitar a ferramenta ↗” para marcar.</p>
          ) : (
            <p className="no-results">Nenhuma ferramenta encontrada.</p>
          )
        ) : null}

        {visible.map((t, idx) => (
          <div
            key={`${t['Nome'] || 'tool'}-${t['Número'] || idx}`}
            className="toolHoverWrap"
            onPointerEnter={(e) => openHoverPreview(t, e.currentTarget)}
            onPointerLeave={scheduleCloseHoverPreview}
            onPointerMove={(e) => {
              if (!hoverOpen || hoveredTool !== t) return;
              setHoverAnchorRect(e.currentTarget.getBoundingClientRect());
            }}
            onFocus={() => {
              // keyboard users: show the preview after a short delay
              openHoverPreview(t, document.activeElement?.closest?.('.toolHoverWrap') || null);
            }}
            onBlur={scheduleCloseHoverPreview}
          >
            <ToolCard tool={t} />
          </div>
        ))}
      </main>

      {hoverOpen && hoveredTool && hoverStyle ? (
        <div
          className="hoverPreview"
          style={hoverStyle}
          aria-hidden="true"
          onPointerEnter={keepHoverPreviewOpen}
          onPointerLeave={scheduleCloseHoverPreview}
        >
          <div className="hoverPreview__head">
            <div className="hoverPreview__title">{String(hoveredTool?.Nome || '')}</div>
            <div className="hoverPreview__meta">{hoverHostname || 'Sem site'}</div>
          </div>
          <a
            className="hoverPreview__frame"
            href={hoverSite || '#'}
            target={hoverSite ? '_blank' : undefined}
            rel={hoverSite ? 'noopener noreferrer' : undefined}
            onClick={(e) => {
              if (!hoverSite) e.preventDefault();
            }}
            title={hoverSite ? 'Abrir site' : 'Sem site'}
          >
            {hoverPreviewSrc && !hoverPreviewFailed ? (
              <>
                {hoverLogo && !hoverLogoFailed && hoverLoading && !hoverDisplayedSrc ? (
                  <div className="previewUnder" aria-hidden="true">
                    <img
                      className="previewUnder__img"
                      src={hoverLogo}
                      alt=""
                      onError={() => setHoverLogoFailed(true)}
                    />
                  </div>
                ) : null}
                {hoverDisplayedSrc ? (
                  <img
                    className="hoverPreview__img"
                    src={hoverDisplayedSrc}
                    alt=""
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    style={{ opacity: 1 }}
                  />
                ) : null}
                {/* Hidden preloader: drives onLoad/onError so we can keep showing the last good image. */}
                {hoverPreviewSrc && hoverDisplayedSrc !== hoverPreviewSrc ? (
                  <img
                    key={hoverPreloadSrc}
                    src={hoverPreloadSrc}
                    alt=""
                    aria-hidden="true"
                    // Safari can skip fetching images with `display: none`, so keep it in the render tree
                    // but invisible/offscreen.
                    style={{
                      position: 'absolute',
                      width: 1,
                      height: 1,
                      opacity: 0,
                      pointerEvents: 'none',
                      left: -9999,
                      top: -9999,
                    }}
                    onLoad={() => {
                      if (hoverPreloadSrc !== hoverPreviewSrcRef.current) return;
                      setHoverDisplayedSrc(hoverPreloadSrc);
                      setHoverPendingSrc('');
                    }}
                    onError={() => {
                      failHoverPreview(hoverPreloadSrc);
                    }}
                  />
                ) : null}
                {hoverLoading ? (
                  <div className={`previewLoading ${hoverDisplayedSrc ? 'previewLoading--badge' : ''}`}>
                    A carregar preview…
                  </div>
                ) : null}
              </>
            ) : (
              <div className="hoverPreview__fallback">
                {hoverLogo ? (
                  <img className="hoverPreview__fallbackImg" src={hoverLogo} alt="" aria-hidden="true" />
                ) : (
                  <span className="hoverPreview__fallbackText">Sem preview</span>
                )}
              </div>
            )}
          </a>
        </div>
      ) : null}

      {!loading && visibleCount >= filtered.length && filtered.length > 0 ? (
        <div style={{ textAlign: 'center', color: '#888', padding: '16px 0' }}>Fim da lista.</div>
      ) : null}
    </>
  );
}
