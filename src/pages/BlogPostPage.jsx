import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { getPostBySlug, localizePost } from '../blog/posts.js';
import { useLanguage } from '../i18n.jsx';

function formatDate(iso, locale) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(d);
  } catch {
    return iso;
  }
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const { path, isEn } = useLanguage();
  const post = localizePost(getPostBySlug(slug), isEn ? 'en' : 'pt');

  if (!post) {
    return (
      <>
        <Hero title="Blog" subtitle={isEn ? 'Article not found.' : 'Artigo não encontrado.'} badge="404" />
        <Section title={isEn ? 'Go back' : 'Voltar'} subtitle={isEn ? 'Choose an article from the list.' : 'Escolhe um artigo da lista.'}>
          <div className="panel">
            <div className="form__actions" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--primary" to={path('/blog')}>
                {isEn ? 'View blog' : 'Ver blog'} →
              </Link>
              <Link className="btn btn--ghost" to={path('/')}>
                Home
              </Link>
            </div>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <Hero
        title={post.title}
        subtitle={post.excerpt}
        badge={`${formatDate(post.date, isEn ? 'en-US' : 'pt-PT')} • ${post.readingTime}`}
        right={
          <div className="hero__search">
            <Link className="btn btn--ghost" to={path('/blog')}>
              ← {isEn ? 'Back to blog' : 'Voltar ao blog'}
            </Link>
          </div>
        }
      />

      <Section>
        <div className="page">
          <div className="page__body">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              {post.tags?.map((t) => (
                <span key={t} className="badge">
                  {t}
                </span>
              ))}
            </div>
            {post.content?.map((p, idx) => (
              <p key={idx} style={{ marginTop: 0, lineHeight: 1.6 }}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
