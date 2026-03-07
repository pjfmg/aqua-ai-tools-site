export function getPreviewCandidates(site, { width = 1200 } = {}) {
  const url = String(site || '').trim();
  if (!url) return [];

  // Provider order:
  // 1) Same-origin `/preview` (server fetch + CDN cache; can use PageSpeed screenshot, fall back to mShots)
  // 2) Direct mShots as last resort (helps if `/preview` isn't available on the current host)
  return [
    `/preview?url=${encodeURIComponent(url)}&w=${Math.max(200, Math.round(width))}`,
    `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=${Math.max(200, Math.round(width))}`,
  ];
}

export function getPreviewUrl(site, { width = 1200, providerIndex = 0, nonce = 0 } = {}) {
  const candidates = getPreviewCandidates(site, { width });
  if (!candidates.length) return '';
  const idx = Math.max(0, Math.min(candidates.length - 1, Number(providerIndex) || 0));
  const base = candidates[idx];
  const n = Number(nonce) || 0;
  // Keep `/preview` cache-friendly; use nonce only for direct third-party URLs.
  if (base.startsWith('/preview?')) return n ? `${base}&r=${n}` : base;
  return n ? `${base}${base.includes('?') ? '&' : '?'}r=${n}` : base;
}
