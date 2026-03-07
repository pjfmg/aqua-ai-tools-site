import React from 'react';
import {
  normalizeArea,
  normalizeDescricao,
  normalizeFuncoes,
  normalizeWebsiteUrl,
  pickLogoUrls,
} from '../lib/tools.js';
import { getToolKey, markVisited, toggleFavorite } from '../lib/userLists.js';
import { useAuth } from '../auth/auth.jsx';
import { useRatings } from '../ratings/RatingsContext.jsx';
import { useMyRatings } from '../ratings/MyRatingsContext.jsx';
import { submitMyRating } from '../lib/ratings.js';

function shouldOpenExternalInNewTab() {
  if (typeof window === 'undefined') return true;
  const nav = window.navigator;

  const ua = String(nav?.userAgent || '');
  const isIOSDevice =
    /iPad|iPhone|iPod/i.test(ua) ||
    // iPadOS can present as Macintosh with touch.
    (/\bMacintosh\b/i.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document);

  // On iOS (including in-app browsers like Notes/Instagram), `target="_blank"` is frequently ignored
  // or blocked, making links feel "dead". Prefer same-tab navigation there.
  if (isIOSDevice) return false;

  return true;
}

export default function ToolCard({ tool }) {
  const { isAuthed, hasProAccess, user } = useAuth();
  const { ratings } = useRatings();
  const { ratingsByToolKey, setRatingLocal } = useMyRatings();

  const logoUrls = pickLogoUrls(tool);
  const descricao = normalizeDescricao(tool['Descrição']);
  const funcoes = normalizeFuncoes(tool['Funções']);
  const desc = descricao || funcoes;
  const areas = normalizeArea(tool['Área/Categoria']);
  const site = normalizeWebsiteUrl(tool['Site']);
  const openInNewTab = shouldOpenExternalInNewTab();

  const toolKey = getToolKey(tool);
  const summary = toolKey ? ratings?.[toolKey] : null;
  const avg = summary && typeof summary.avg === 'number' ? summary.avg : null;
  const count = summary && typeof summary.count === 'number' ? summary.count : null;
  const myRating = isAuthed && hasProAccess && toolKey ? Number(ratingsByToolKey?.[toolKey] || 0) : 0;
  const isFav = String(tool?.Favorito || '') === 'Sim';

  async function onSetRating(v) {
    if (!isAuthed || !hasProAccess) return;
    if (!toolKey) return;
    if (!setRatingLocal({ toolKey, rating: v })) return;
    await submitMyRating({ email: user?.email, tool, rating: v });
  }

  return (
    <article className="toolCard">
      <div className="toolCard__top">
        <div className="toolCard__logoWrap">
          <img
            className="toolCard__logo"
            src={logoUrls.primary}
            data-fallback={logoUrls.secondary}
            data-fallbacks={
              Array.isArray(logoUrls.fallbacks) && logoUrls.fallbacks.length
                ? JSON.stringify(logoUrls.fallbacks)
                : ''
            }
            alt={`Logo de ${tool['Nome'] || 'ferramenta'}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const img = e.currentTarget;

              const listRaw = img.dataset.fallbacks;
              if (listRaw) {
                try {
                  const list = JSON.parse(listRaw);
                  const next = Array.isArray(list) ? list.shift() : '';
                  if (next) {
                    img.dataset.fallbacks = JSON.stringify(list);
                    img.src = next;
                    return;
                  }
                } catch {
                  // ignore malformed dataset
                }
                img.dataset.fallbacks = '';
              }

              const fallback = img.dataset.fallback;
              if (fallback) {
                img.dataset.fallback = '';
                img.src = fallback;
                return;
              }

              img.onerror = null;
              img.src = '/assets/img/placeholder-ai-tools.png';
            }}
          />
        </div>
        <div className="toolCard__meta">
          <div className="toolCard__titleRow">
            <h3 className="toolCard__title">{tool['Nome'] || ''}</h3>
            {isAuthed && hasProAccess ? (
              <button
                className={`favBtn ${isFav ? 'is-on' : ''}`}
                type="button"
                title={isFav ? 'Remover de favoritas' : 'Adicionar a favoritas'}
                aria-label={isFav ? 'Remover de favoritas' : 'Adicionar a favoritas'}
                onClick={() => toggleFavorite(tool)}
              >
                ♥
              </button>
            ) : null}
          </div>
          <div className="toolCard__badges">
            {areas.length ? <span className="badge">{areas[0]}</span> : <span className="badge">Sem categoria</span>}
            {typeof tool['Número'] !== 'undefined' && tool['Número'] !== '' ? (
              <span className="badge badge--muted">#{String(tool['Número'])}</span>
            ) : null}

            {isAuthed && hasProAccess ? (
              <div className="ratingRow" aria-label="Avaliações">
                <div className="ratingRow__line">
                  <span className="ratingRow__label">A tua avaliação</span>
                  <span className="stars" role="radiogroup" aria-label="A tua avaliação (1 a 5)">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={`starBtn ${myRating >= v ? 'is-on' : ''}`}
                        aria-label={`${v} estrela${v === 1 ? '' : 's'}`}
                        aria-checked={myRating === v}
                        role="radio"
                        onClick={() => onSetRating(v)}
                      >
                        ★
                      </button>
                    ))}
                  </span>
                </div>

                <div className="ratingRow__line">
                  <span className="ratingRow__label">Avaliação geral</span>
                  <span className="ratingRow__value">
                    {avg != null ? `${avg.toFixed(1)}/5` : '—'}
                    {count != null ? <span className="ratingRow__count">({count})</span> : null}
                  </span>
                </div>
              </div>
            ) : null}

            {isAuthed && !hasProAccess ? <span className="badge badge--muted">Pro: favoritas e reviews</span> : null}
          </div>
        </div>
      </div>

      {desc ? (
        <p className="toolCard__desc">{desc}</p>
      ) : (
        <p className="toolCard__desc toolCard__desc--muted">Sem descrição.</p>
      )}

      <div className="toolCard__bottom">
        {site ? (
          <a
            className="btn btn--primary btn--block"
            href={site}
            target={openInNewTab ? '_blank' : undefined}
            rel={openInNewTab ? 'noopener noreferrer' : undefined}
            onClick={() => {
              // Never let local list bookkeeping interfere with navigation.
              try {
                if (hasProAccess) markVisited(tool);
              } catch {
                // ignore
              }
            }}
          >
            Visitar a ferramenta ↗
          </a>
        ) : (
          <button className="btn btn--ghost btn--block" type="button" disabled>
            Sem link
          </button>
        )}
      </div>
    </article>
  );
}
