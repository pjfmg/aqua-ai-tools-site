import React, { useEffect, useMemo, useRef } from 'react';

function ensureAdSenseScriptLoaded(client) {
  if (typeof document === 'undefined') return;
  const normalizedClient = String(client || '').trim();
  if (!normalizedClient) return;

  const base = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  const expectedSrc = `${base}?client=${encodeURIComponent(normalizedClient)}`;

  const existing = Array.from(document.scripts || []).find((s) => {
    const src = String(s?.src || '');
    return src === expectedSrc || src.startsWith(`${base}?client=`);
  });
  if (existing) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = expectedSrc;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

export default function AdStrip({
  label = 'Publicidade',
  client = 'ca-pub-8295677733502537',
  slot = '8526175787',
  format = 'auto',
}) {
  const insRef = useRef(null);
  const adClient = useMemo(() => String(client || '').trim(), [client]);
  const adSlot = useMemo(() => String(slot || '').trim(), [slot]);
  const adTest = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const host = String(window.location?.hostname || '').toLowerCase();
    // Preview / staging domains are often not authorized in AdSense, resulting in empty units.
    if (host.endsWith('.pages.dev')) return 'on';
    if (host === 'localhost' || host.endsWith('.localhost')) return 'on';
    if (/^127\.\d+\.\d+\.\d+$/.test(host)) return 'on';
    return '';
  }, []);
  const adFormat = useMemo(() => {
    const f = String(format || '').trim().toLowerCase();
    // Keep the default robust for display units; "horizontal" often leads to no-fill unless the unit expects it.
    if (!f || f === 'horizontal') return 'auto';
    return f;
  }, [format]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    ensureAdSenseScriptLoaded(adClient);

    try {
      const el = insRef.current;
      if (!el) return;

      // React 18 StrictMode can run effects twice in dev; AdSense is sensitive to double-initialization.
      // Mark the element as "init scheduled" immediately to prevent multiple pushes before AdSense sets status.
      if (el.getAttribute('data-aqua-ads-init') === '1') return;
      el.setAttribute('data-aqua-ads-init', '1');

      // Avoid pushing on an <ins> that was already filled by AdSense.
      if (el.getAttribute('data-adsbygoogle-status')) return;

      // Defer one tick to ensure the element is in DOM before push (helps on Safari/WebView).
      window.setTimeout(() => {
        try {
          // eslint-disable-next-line no-underscore-dangle
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
          // ignore (blocked script, no-fill, etc.)
        }
      }, 0);
    } catch {
      // ignore (blocked script, dev double-invoke, etc.)
    }
  }, [adClient, adSlot, adFormat]);

  return (
    <section className="adsStrip" aria-label={label}>
      <div className="adsStrip__inner">
        <div className="adsStrip__label">{label}</div>
        <div className="adsStrip__slot">
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-format={adFormat || undefined}
            data-ad-client={adClient || undefined}
            data-ad-slot={adSlot || undefined}
            data-adtest={adTest || undefined}
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </section>
  );
}
