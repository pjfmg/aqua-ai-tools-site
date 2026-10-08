import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLanguageSwitchPath } from '../i18n.jsx';
import { getRouteSeo, SITE_ORIGIN, SOCIAL_IMAGE_PATH } from '../lib/seo.js';

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
}

function setLink(rel, href, hreflang = '') {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    if (hreflang) element.setAttribute('hreflang', hreflang);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export default function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getRouteSeo(pathname);
    const ptPath = getLanguageSwitchPath(seo.canonicalPath, 'pt');
    const enPath = getLanguageSwitchPath(seo.canonicalPath, 'en');
    const absolute = (path) => `${SITE_ORIGIN}${path === '/' ? '/' : path}`;

    document.title = seo.title;
    document.documentElement.lang = seo.lang;
    setMeta('meta[name="description"]', { name: 'description', content: seo.description });
    setMeta('meta[name="robots"]', { name: 'robots', content: seo.robots });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: seo.title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: seo.description });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: seo.contentType });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: seo.canonicalUrl });
    setMeta('meta[property="og:image"]', { property: 'og:image', content: `${SITE_ORIGIN}${SOCIAL_IMAGE_PATH}` });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: seo.title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: seo.description });
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: `${SITE_ORIGIN}${SOCIAL_IMAGE_PATH}` });
    setLink('canonical', seo.canonicalUrl);
    setLink('alternate', absolute(ptPath), 'pt');
    setLink('alternate', absolute(enPath), 'en');
    setLink('alternate', absolute(ptPath), 'x-default');

    let structuredData = document.head.querySelector('#aqua-structured-data');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.id = 'aqua-structured-data';
      structuredData.type = 'application/ld+json';
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': seo.contentType === 'article'
        ? 'Article'
        : (seo.canonicalPath === '/' || seo.canonicalPath === '/en' ? 'WebSite' : 'WebPage'),
      name: seo.title,
      ...(seo.contentType === 'article' ? {
        headline: seo.title.replace(/ \| AQUA AI Tools$/, ''),
        datePublished: seo.published,
        dateModified: seo.modified,
        author: { '@type': 'Organization', name: seo.author || 'AQUA' },
      } : {}),
      description: seo.description,
      url: seo.canonicalUrl,
      inLanguage: seo.lang,
      isPartOf: {
        '@type': 'WebSite',
        name: 'AQUA AI Tools',
        url: `${SITE_ORIGIN}/`,
      },
    });
  }, [pathname]);

  return null;
}
