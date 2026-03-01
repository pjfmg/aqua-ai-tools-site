import React, { useEffect, useMemo, useState } from 'react';
import ToolCard from '../components/ToolCard.jsx';
import { useTools } from '../hooks/useTools.js';
import { normalizeWebsiteUrl, pickLogoUrls } from '../lib/tools.js';
import { getPreviewCandidates, getPreviewUrl } from '../lib/sitePreview.js';
import SimplePage from './SimplePage.jsx';

function pickRandom(tools) {
  if (!tools.length) return null;
  const idx = Math.floor(Math.random() * tools.length);
  return tools[idx];
}

const PREVIEW_POLL_MS = 2500;
const PREVIEW_POLL_MAX = 8;

export default function SurpreendeMePage() {
  const { tools, loading, error, warning } = useTools();
  const [seed, setSeed] = useState(0);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [previewProviderIdx, setPreviewProviderIdx] = useState(0);
  const [previewDisplayedSrc, setPreviewDisplayedSrc] = useState('');
  const [previewPendingSrc, setPreviewPendingSrc] = useState('');

  const selected = useMemo(() => {
    // seed apenas para forçar novo pick sem depender de tools
    void seed;
    return pickRandom(tools);
  }, [tools, seed]);

  useEffect(() => {
    setPreviewFailed(false);
    setPreviewNonce(0);
    setPreviewProviderIdx(0);
    setPreviewDisplayedSrc('');
    setPreviewPendingSrc('');
  }, [selected?.id, selected?.['ID_Unico'], selected?.['Número'], selected?.['Nome']]);

  const site = useMemo(() => normalizeWebsiteUrl(selected?.Site || ''), [selected]);
  const logo = useMemo(() => (selected ? pickLogoUrls(selected).primary : ''), [selected]);
  const previewSrc = useMemo(() => {
    if (!site) return '';
    return getPreviewUrl(site, { width: 1200, providerIndex: previewProviderIdx, nonce: previewNonce });
  }, [site, previewProviderIdx, previewNonce]);

  const previewProvidersCount = useMemo(() => getPreviewCandidates(site, { width: 1200 }).length, [site]);

  const previewLoading = Boolean(
    previewSrc &&
      !previewFailed &&
      (previewPendingSrc === previewSrc || (!previewDisplayedSrc && previewPendingSrc)),
  );

  // mShots often returns a "Generating Preview..." placeholder first and updates later.
  // Poll a few times by bumping the nonce to encourage refresh.
  useEffect(() => {
    if (!site) return undefined;
    if (previewFailed) return undefined;
    const max = previewProviderIdx === 0 ? 3 : PREVIEW_POLL_MAX;
    const delay = previewProviderIdx === 0 ? 1400 : PREVIEW_POLL_MS;
    if (previewNonce >= max) return undefined;

    const t = window.setTimeout(() => {
      setPreviewNonce((n) => Math.min(PREVIEW_POLL_MAX, n + 1));
    }, delay);

    return () => window.clearTimeout(t);
  }, [site, previewProviderIdx, previewFailed, previewNonce]);

  useEffect(() => {
    if (!previewSrc) return undefined;
    if (previewFailed) return undefined;

    if (previewDisplayedSrc === previewSrc) return undefined;
    if (previewPendingSrc === previewSrc) return undefined;

    setPreviewPendingSrc(previewSrc);
    const controller = { aborted: false, abort() { this.aborted = true; } };

    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (controller.aborted) return;
      setPreviewDisplayedSrc(previewSrc);
      setPreviewPendingSrc('');
    };
    img.onerror = () => {
      if (controller.aborted) return;
      setPreviewPendingSrc('');
      if (previewProviderIdx + 1 < previewProvidersCount) {
        setPreviewProviderIdx((i) => i + 1);
        setPreviewNonce((n) => n + 1);
        return;
      }
      setPreviewFailed(true);
    };
    img.src = previewSrc;

    return () => controller.abort();
  }, [
    previewSrc,
    previewDisplayedSrc,
    previewPendingSrc,
    previewFailed,
    previewProviderIdx,
    previewProvidersCount,
  ]);

  return (
    <SimplePage title="Surpreende-me">
      {warning ? <p className="note">{warning}</p> : null}
      {loading ? <p className="no-results">A carregar…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <div className="surprise">
        <button
          className="sort-btn"
          onClick={() => setSeed((s) => s + 1)}
          disabled={loading || !tools.length}
        >
          Outra ferramenta
        </button>

        <div className="surprise__grid">
          <div className="surprise__card">
            {selected ? <ToolCard tool={selected} /> : !loading ? <p className="no-results">Sem dados.</p> : null}
          </div>

          <div className="surprise__preview" aria-label="Preview do site">
            <a
              className="surprise__frame"
              href={site || '#'}
              target={site ? '_blank' : undefined}
              rel={site ? 'noopener noreferrer' : undefined}
              aria-disabled={!site}
              onClick={(e) => {
                if (!site) e.preventDefault();
              }}
              title={site ? 'Abrir site' : 'Sem site'}
            >
              {previewSrc && !previewFailed ? (
                <>
                  {logo ? (
                    <div className="previewUnder" aria-hidden="true">
                      <img className="previewUnder__img" src={logo} alt="" />
                    </div>
                  ) : null}
                  <img
                    className="surprise__img"
                    src={previewDisplayedSrc || previewPendingSrc || previewSrc}
                    alt={site ? `Imagem do site ${site}` : ''}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    style={{ opacity: 1 }}
                  />
                  {previewLoading ? (
                    <div className={`previewLoading ${previewDisplayedSrc ? 'previewLoading--badge' : ''}`}>
                      A carregar preview…
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="surprise__fallback">
                  {logo ? (
                    <img className="surprise__fallbackImg" src={logo} alt="" aria-hidden="true" />
                  ) : (
                    <span className="surprise__fallbackText">Sem preview</span>
                  )}
                </div>
              )}
            </a>

            {site ? (
              <button
                className="surprise__refresh"
                type="button"
                onClick={() => {
                  setPreviewFailed(false);
                  setPreviewNonce((n) => n + 1);
                  setPreviewPendingSrc('');
                  setPreviewDisplayedSrc('');
                }}
              >
                Atualizar preview
              </button>
            ) : null}

            {site && previewProvidersCount > 1 ? (
              <button
                className="surprise__refresh"
                type="button"
                onClick={() => {
                  setPreviewFailed(false);
                  setPreviewProviderIdx((i) => (i + 1) % previewProvidersCount);
                  setPreviewNonce((n) => n + 1);
                  setPreviewPendingSrc('');
                  setPreviewDisplayedSrc('');
                }}
              >
                Trocar provider
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </SimplePage>
  );
}
