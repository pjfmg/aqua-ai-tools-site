import React from 'react';

export default function Hero({ title, subtitle, badge, right, children }) {
  return (
    <section className="hero">
      <div className="hero__content">
        <span className="hero__spark">✦</span>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
        {badge ? <span className="hero__badge">{badge}</span> : null}
      </div>
      {right ? <div className="hero__actions">{right}</div> : null}
      {children ? <div className="hero__body">{children}</div> : null}
    </section>
  );
}
