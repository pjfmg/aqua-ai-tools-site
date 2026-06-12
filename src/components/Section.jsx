import React from 'react';

export default function Section({ title, subtitle, children, align = 'center' }) {
  return (
    <section className={`section section--${align}`}>
      {title || subtitle ? (
        <header className="section__header">
          {title ? <h2>{title}</h2> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
