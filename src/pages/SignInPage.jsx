import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useAuth } from '../auth/auth.jsx';
import { useLanguage } from '../i18n.jsx';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignInPage() {
  const navigate = useNavigate();
  const { path, isEn } = useLanguage();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function onSubmit(e) {
    e.preventDefault();
    setError('');
    const emailTrim = email.trim().toLowerCase();
    if (!isValidEmail(emailTrim)) {
      setError(isEn ? 'Enter a valid email.' : 'Indica um email válido.');
      return;
    }
    signIn({ name: name.trim(), email: emailTrim });
    navigate(path('/conta'), { replace: true });
  }

  return (
    <>
      <Hero
        title={isEn ? 'Sign in' : 'Entrar'}
        subtitle={isEn ? 'Access your profile.' : 'Acede ao teu perfil.'}
        badge={isEn ? 'Beta (local)' : 'Beta (local)'}
      />

      <Section title={isEn ? 'Sign in' : 'SignIn'} subtitle={isEn ? 'For now this is a local login without password.' : 'Por agora é um login local (sem password).'}>
        <div className="authWrap">
          <aside className="authAside">
            <div className="authCard">
              <div className="authCard__title">{isEn ? 'New here?' : 'Novo por aqui?'}</div>
              <p className="authCard__p">{isEn ? 'Create an account in seconds.' : 'Cria uma conta em segundos.'}</p>
              <Link className="btn btn--primary btn--block" to={path('/signup')}>
                {isEn ? 'Create account' : 'Criar conta'}
              </Link>
            </div>
          </aside>

          <div className="authMain">
            <div className="panel">
              <form className="form" onSubmit={onSubmit}>
                <div className="form__grid">
                  <div className="field field--span2">
                    <label className="field__label" htmlFor="signin-email">
                      Email *
                    </label>
                    <input
                      id="signin-email"
                      className="input"
                      placeholder="paulo@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="field field--span2">
                    <label className="field__label" htmlFor="signin-name">
                      {isEn ? 'Name (optional)' : 'Nome (opcional)'}
                    </label>
                    <input
                      id="signin-name"
                      className="input"
                      placeholder="Paulo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                {error ? <p className="error">{error}</p> : null}

                <div className="form__actions">
                  <button className="btn btn--primary" type="submit">
                    {isEn ? 'Sign in →' : 'Entrar →'}
                  </button>
                  <Link className="btn btn--ghost" to={path('/signup')}>
                    {isEn ? 'Create account' : 'Criar conta'}
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
