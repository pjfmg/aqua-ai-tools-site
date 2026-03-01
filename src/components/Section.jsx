import React from 'react';

export default function Section({ title, subtitle, children, align = 'center' }) {
  return (
    <section className="section">
      {title ? (
        <header className={`section__header section__header--${align}`}>
          <h2 className="section__title">{title}</h2>
          {subtitle ? <p className="section__subtitle">{subtitle}</p> : null}
        </header>
      ) : null}
      <div className="section__body">{children}</div>
    </section>
  );
}

