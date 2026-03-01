import React from 'react';
import AdStrip from './AdStrip.jsx';

export default function Hero({ title, subtitle, badge, right, children, showAds = true }) {
  return (
    <>
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__inner">
          <div className="hero__content">
            <div className="hero__kicker">✨</div>
            <h1 className="hero__title">{title}</h1>
            {subtitle ? <p className="hero__subtitle">{subtitle}</p> : null}
            {badge ? <div className="hero__badge">{badge}</div> : null}
          </div>
          {right ? <div className="hero__right">{right}</div> : null}
        </div>
        {children ? <div className="hero__below">{children}</div> : null}
      </section>

      {showAds ? <AdStrip /> : null}
    </>
  );
}
