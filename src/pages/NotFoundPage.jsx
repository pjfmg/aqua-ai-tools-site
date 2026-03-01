import React from 'react';
import { Link } from 'react-router-dom';
import SimplePage from './SimplePage.jsx';

export default function NotFoundPage() {
  return (
    <SimplePage title="Página não encontrada">
      <p>
        Voltar para <Link to="/">Home</Link>.
      </p>
    </SimplePage>
  );
}

