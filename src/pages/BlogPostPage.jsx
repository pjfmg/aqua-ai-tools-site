import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { getPostBySlug, localizePost, posts } from '../blog/posts.js';
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
  const relatedPosts = posts
    .filter((item) => item.slug !== slug)
    .slice(0, 2)
    .map((item) => localizePost(item, isEn ? 'en' : 'pt'));

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
        <article className="page editorialArticle">
          <div className="page__body editorialArticle__body">
            <div className="editorialArticle__meta">
              {post.tags?.map((t) => (
                <span key={t} className="badge">
                  {t}
                </span>
              ))}
            </div>
            <div className="editorialByline">
              <div>
                <strong>{post.author?.name}</strong>
                <span>{post.author?.role}</span>
              </div>
              <span>
                {isEn ? 'Reviewed ' : 'Revisto em '}
                <time dateTime={post.updated}>{formatDate(post.updated, isEn ? 'en-US' : 'pt-PT')}</time>
              </span>
            </div>

            <aside className="editorialSummary" aria-label={isEn ? 'Article summary' : 'Resumo do artigo'}>
              <strong>{isEn ? 'In brief' : 'Em resumo'}</strong>
              <ul>
                {post.summary?.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </aside>

            {post.sections?.map((section) => (
              <section className="editorialSection" key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.checklist?.length ? (
                  <ul className="editorialChecklist">
                    {section.checklist.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : null}
              </section>
            ))}

            <aside className="editorialTakeaway">
              <strong>{isEn ? 'Decision rule' : 'Regra de decisão'}</strong>
              <p>{post.takeaway}</p>
            </aside>
          </div>
        </article>
      </Section>

      <Section
        title={isEn ? 'Continue with a practical guide' : 'Continua com um guia prático'}
        subtitle={isEn ? 'Related methods from the AQUA editorial team.' : 'Métodos relacionados da equipa editorial AQUA.'}
      >
        <div className="grid-container editorialRelated">
          {relatedPosts.map((item) => (
            <Link key={item.slug} className="blogCard" to={path(`/blog/${item.slug}`)}>
              <div className="blogCard__meta"><span className="badge badge--muted">{item.readingTime}</span></div>
              <div className="blogCard__title">{item.title}</div>
              <div className="blogCard__excerpt">{item.excerpt}</div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
