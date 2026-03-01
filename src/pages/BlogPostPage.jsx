import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { getPostBySlug } from '../blog/posts.js';

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long' }).format(d);
  } catch {
    return iso;
  }
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <>
        <Hero title="Blog" subtitle="Artigo não encontrado." badge="404" />
        <Section title="Voltar" subtitle="Escolhe um artigo da lista.">
          <div className="panel">
            <div className="form__actions" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--primary" to="/blog">
                Ver blog →
              </Link>
              <Link className="btn btn--ghost" to="/">
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
        badge={`${formatDate(post.date)} • ${post.readingTime}`}
        right={
          <div className="hero__search">
            <Link className="btn btn--ghost" to="/blog">
              ← Voltar ao blog
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

