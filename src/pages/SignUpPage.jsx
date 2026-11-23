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
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');

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
    if (password.length < 8) {
      setError(isEn ? 'Use a password with at least 8 characters.' : 'Usa uma palavra-passe com pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp({ name: nameTrim, email: emailTrim, password });
      if (result.authenticated) {
        navigate(path('/conta'), { replace: true });
      } else {
        setNotice(
          isEn
            ? 'Account created. Check your email to confirm the account before signing in.'
            : 'Conta criada. Confirma a conta através do email antes de iniciar sessão.',
        );
      }
    } catch (err) {
      setError(err.message || (isEn ? 'Could not create the account.' : 'Não foi possível criar a conta.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Hero
        title={isEn ? 'Create account' : 'Criar conta'}
        subtitle={isEn ? 'A free account starts on Starter. Pro requires a separate AI Tools subscription.' : 'A conta gratuita começa no Starter. O Pro exige uma subscrição AI Tools separada.'}
        badge="Supabase Auth"
      />

      <Section title={isEn ? 'Sign up' : 'Criar conta'} subtitle={isEn ? 'Create an account to manage your AI Tools profile. Starter is free; Pro requires an AI Tools subscription.' : 'Cria uma conta para gerir o teu perfil AI Tools. O Starter é gratuito; o Pro exige uma subscrição AI Tools.'}>
        <div className="authWrap">
          <aside className="authAside">
            <div className="authCard">
              <div className="authCard__title">{isEn ? 'Account and plan' : 'Conta e plano'}</div>
              <ul className="authCard__list">
                <li>{isEn ? 'Free account for your profile' : 'Conta gratuita para o teu perfil'}</li>
                <li>{isEn ? 'Starter plan without a subscription' : 'Plano Starter sem subscrição'}</li>
                <li>{isEn ? 'Favorites and history require Pro' : 'Favoritas e histórico exigem Pro'}</li>
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
                      autoComplete="name"
                      required
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
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="paulo@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="field field--span2">
                    <label className="field__label" htmlFor="signup-password">
                      {isEn ? 'Password *' : 'Palavra-passe *'}
                    </label>
                    <input
                      id="signup-password"
                      className="input"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error ? <p className="error">{error}</p> : null}
                {notice ? <p className="success">{notice}</p> : null}

                <div className="form__actions">
                  <button className="btn btn--primary" type="submit" disabled={loading}>
                    {loading ? (isEn ? 'Creating…' : 'A criar…') : (isEn ? 'Create account →' : 'Criar conta →')}
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
