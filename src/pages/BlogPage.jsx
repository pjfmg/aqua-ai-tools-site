import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { localizePost, posts } from '../blog/posts.js';
import { useLanguage } from '../i18n.jsx';

function formatDate(iso, locale) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(d);
  } catch {
    return iso;
  }
}

export default function BlogPage() {
  const { path, isEn } = useLanguage();
  const visiblePosts = posts.map((post) => localizePost(post, isEn ? 'en' : 'pt'));

  return (
    <>
      <Hero
        title="Blog"
        subtitle={isEn ? 'Guides, comparisons and practical ideas for using AI with impact.' : 'Guias, comparações e ideias práticas para usar IA com impacto.'}
        badge={`${visiblePosts.length} ${isEn ? 'articles' : 'artigos'}`}
        right={
          <div className="hero__search">
            <Link className="btn btn--primary" to={path('/sugestoes')}>
              {isEn ? 'Suggest topic' : 'Sugerir tema'} →
            </Link>
            <Link className="btn btn--ghost" to={path('/ferramentas')}>
              {isEn ? 'View tools' : 'Ver ferramentas'}
            </Link>
          </div>
        }
      />

      <Section title={isEn ? 'Articles' : 'Artigos'} subtitle={isEn ? 'Short, practical and useful posts.' : 'Publicações curtas, objetivas e úteis.'}>
        <div className="grid-container">
          {visiblePosts.map((p) => (
            <Link key={p.slug} to={path(`/blog/${p.slug}`)} className="blogCard">
              <div className="blogCard__meta">
                <span className="badge badge--muted">{formatDate(p.date, isEn ? 'en-US' : 'pt-PT')}</span>
                <span className="badge badge--muted">{p.readingTime}</span>
              </div>
              <div className="blogCard__title">{p.title}</div>
              <div className="blogCard__excerpt">{p.excerpt}</div>
              <div className="blogCard__tags">
                {p.tags?.slice(0, 3).map((t) => (
                  <span key={t} className="badge">
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
