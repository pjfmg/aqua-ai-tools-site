import React from 'react';

export default function SimplePage({ title, children }) {
  return (
    <div className="page">
      <header className="page__header">
        <h1>{title}</h1>
      </header>
      <div className="page__body">{children}</div>
    </div>
  );
}

