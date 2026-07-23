import React from 'react';

export default function Hero({ title, subtitle, badge, right, children, showMark = true }) {
  const isMinimal = !showMark && !title;

  return (
    <section className="hero">
      <div className={`hero__content${isMinimal ? ' hero__content--minimal' : ''}`}>
        {showMark ? <span className="hero__spark" aria-hidden="true">AQUA / AI TOOLS</span> : null}
        {title ? <h1>{title}</h1> : null}
        {subtitle ? <p>{subtitle}</p> : null}
        {badge ? <span className="hero__badge">{badge}</span> : null}
      </div>
      {right ? <div className="hero__actions">{right}</div> : null}
      {children ? <div className="hero__body">{children}</div> : null}
    </section>
  );
}
