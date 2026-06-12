import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useAuth } from '../auth/auth.jsx';
import { useLanguage } from '../i18n.jsx';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const { path, isEn } = useLanguage();
  const { signIn } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function onSubmit(e) {
    e.preventDefault();
    setError('');

    const nameTrim = name.trim();
    const emailTrim = email.trim().toLowerCase();
    if (!nameTrim) {
      setError(isEn ? 'Enter your name.' : 'Indica o teu nome.');
      return;
    }
    if (!isValidEmail(emailTrim)) {
      setError(isEn ? 'Enter a valid email.' : 'Indica um email válido.');
      return;
    }

    signIn({ name: nameTrim, email: emailTrim });
    navigate(path('/conta'), { replace: true });
  }

  return (
    <>
      <Hero
        title={isEn ? 'Create account' : 'Criar conta'}
        subtitle={isEn ? 'Save preferences and speed up tool discovery.' : 'Guarda as tuas preferências e acelera a descoberta de ferramentas.'}
        badge="Beta (local)"
      />

      <Section title={isEn ? 'Sign up' : 'SignUp'} subtitle={isEn ? 'For now this is a local profile without password.' : 'Por agora é um perfil local (sem password).'}>
        <div className="authWrap">
          <aside className="authAside">
            <div className="authCard">
              <div className="authCard__title">{isEn ? 'What you get' : 'O que ganhas'}</div>
              <ul className="authCard__list">
                <li>{isEn ? 'Personalized experience' : 'Experiência personalizada'}</li>
                <li>{isEn ? 'Fast access to favorites' : 'Acesso rápido a favoritas'}</li>
                <li>{isEn ? 'Submissions with identity' : 'Submissões com identidade'}</li>
              </ul>
              <div className="authCard__hint">
                {isEn ? 'Already have an account?' : 'Já tens conta?'} <Link to={path('/signin')}>{isEn ? 'Sign in' : 'Entrar'}</Link>
              </div>
            </div>
          </aside>

          <div className="authMain">
            <div className="panel">
              <form className="form" onSubmit={onSubmit}>
                <div className="form__grid">
                  <div className="field field--span2">
                    <label className="field__label" htmlFor="signup-name">
                      {isEn ? 'Name *' : 'Nome *'}
                    </label>
                    <input
                      id="signup-name"
                      className="input"
                      placeholder="Paulo Gonçalves"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="field field--span2">
                    <label className="field__label" htmlFor="signup-email">
                      Email *
                    </label>
                    <input
                      id="signup-email"
                      className="input"
                      placeholder="paulo@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {error ? <p className="error">{error}</p> : null}

                <div className="form__actions">
                  <button className="btn btn--primary" type="submit">
                    {isEn ? 'Create account →' : 'Criar conta →'}
                  </button>
                  <Link className="btn btn--ghost" to={path('/signin')}>
                    {isEn ? 'I already have an account' : 'Já tenho conta'}
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
