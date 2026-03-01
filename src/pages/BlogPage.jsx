import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { posts } from '../blog/posts.js';

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long' }).format(d);
  } catch {
    return iso;
  }
}

export default function BlogPage() {
  return (
    <>
      <Hero
        title="Blog"
        subtitle="Guias, comparações e ideias práticas para usar IA com impacto."
        badge={`${posts.length} artigos`}
        right={
          <div className="hero__search">
            <Link className="btn btn--primary" to="/sugestoes">
              Sugerir tema →
            </Link>
            <Link className="btn btn--ghost" to="/ferramentas">
              Ver ferramentas
            </Link>
          </div>
        }
      />

      <Section title="Artigos" subtitle="Publicações curtas, objetivas e úteis.">
        <div className="grid-container">
          {posts.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="blogCard">
              <div className="blogCard__meta">
                <span className="badge badge--muted">{formatDate(p.date)}</span>
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

