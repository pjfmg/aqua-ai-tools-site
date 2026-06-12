import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const LanguageContext = createContext({ lang: 'pt', prefix: '', path: (to) => to });

const EN_ROUTES = new Map([
  ['/', '/en'],
  ['/ferramentas', '/en/tools'],
  ['/destaques', '/en/featured'],
  ['/surpreende-me', '/en/surprise-me'],
  ['/visitadas', '/en/visited'],
  ['/favoritas', '/en/favorites'],
  ['/reviews', '/en/reviews'],
  ['/submeter', '/en/submit'],
  ['/sugestoes', '/en/suggestions'],
  ['/blog', '/en/blog'],
  ['/pro', '/en/pro'],
  ['/sobre', '/en/about'],
  ['/contacto', '/en/contact'],
  ['/consultoria', '/en/consulting'],
  ['/privacidade', '/en/privacy'],
  ['/termos', '/en/terms'],
  ['/conta', '/en/account'],
  ['/signin', '/en/signin'],
  ['/signup', '/en/signup'],
]);

const PT_ROUTES = new Map(Array.from(EN_ROUTES.entries()).map(([pt, en]) => [en, pt]));

export function isEnglishPath(pathname) {
  return pathname === '/en' || pathname.startsWith('/en/');
}

export function localizePath(to, lang = 'pt') {
  if (!to || typeof to !== 'string') return to;
  if (/^(https?:)?\/\//i.test(to) || to.startsWith('#')) return to;

  const [pathOnly, ...suffixParts] = to.split(/(?=[?#])/);
  const suffix = suffixParts.join('');
  if (lang === 'en') return `${EN_ROUTES.get(pathOnly) || (pathOnly === '/' ? '/en' : `/en${pathOnly}`)}${suffix}`;
  return `${PT_ROUTES.get(pathOnly) || pathOnly.replace(/^\/en(?=\/|$)/, '') || '/'}${suffix}`;
}

export function getLanguageSwitchPath(pathname, targetLang) {
  if (targetLang === 'en') return localizePath(pathname, 'en');
  return localizePath(pathname, 'pt');
}

export function LanguageProvider({ children }) {
  const location = useLocation();
  const lang = isEnglishPath(location.pathname) ? 'en' : 'pt';
  const value = useMemo(
    () => ({
      lang,
      prefix: lang === 'en' ? '/en' : '',
      path: (to) => localizePath(to, lang),
      isEn: lang === 'en',
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
