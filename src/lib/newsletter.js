import { postJson } from './http.js';

export const NEWSLETTER_TOPICS = Object.freeze([
  { id: 'productivity', pt: 'Produtividade', en: 'Productivity' },
  { id: 'content-design', pt: 'Conteúdo e design', en: 'Content & design' },
  { id: 'code-automation', pt: 'Código e automação', en: 'Code & automation' },
  { id: 'business-research', pt: 'Negócio e pesquisa', en: 'Business & research' },
  { id: 'education', pt: 'Educação', en: 'Education' },
]);

export function subscribeToNewsletter({ email, topics, locale }) {
  return postJson('/v1/newsletter-subscriptions', {
    email: String(email || '').trim().toLowerCase(),
    topics: Array.isArray(topics) ? topics : [],
    locale: locale === 'en' ? 'en' : 'pt',
    cadence: 'weekly',
    source: 'aqua-ai-tools-site',
  });
}
