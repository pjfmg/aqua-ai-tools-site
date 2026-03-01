import React, { useEffect, useMemo, useRef } from 'react';

export default function AdStrip({
  label = 'Publicidade',
  client = 'ca-pub-8295677733502537',
  slot = '8526175787',
  format = 'horizontal',
}) {
  const pushedRef = useRef(false);
  const adClient = useMemo(() => String(client || '').trim(), [client]);
  const adSlot = useMemo(() => String(slot || '').trim(), [slot]);
  const adFormat = useMemo(() => String(format || '').trim(), [format]);

  useEffect(() => {
    if (pushedRef.current) return;
    pushedRef.current = true;
    if (typeof window === 'undefined') return;
    try {
      // eslint-disable-next-line no-underscore-dangle
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore (blocked script, dev double-invoke, etc.)
    }
  }, []);

  return (
    <section className="adsStrip" aria-label={label}>
      <div className="adsStrip__inner">
        <div className="adsStrip__label">{label}</div>
        <div className="adsStrip__slot">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-format={adFormat || undefined}
            data-ad-client={adClient || undefined}
            data-ad-slot={adSlot || undefined}
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </section>
  );
}
