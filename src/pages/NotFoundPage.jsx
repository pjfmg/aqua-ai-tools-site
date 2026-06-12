import React from 'react';
import { Link } from 'react-router-dom';
import SimplePage from './SimplePage.jsx';
import { useLanguage } from '../i18n.jsx';

export default function NotFoundPage() {
  const { path, isEn } = useLanguage();
  return (
    <SimplePage title={isEn ? 'Page not found' : 'Página não encontrada'}>
      <p>
        {isEn ? 'Back to ' : 'Voltar para '}<Link to={path('/')}>Home</Link>.
      </p>
    </SimplePage>
  );
}
