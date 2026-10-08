import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth.jsx';
import { useLanguage } from '../i18n.jsx';

const ASSET = '/assets/app/';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function ProviderButton({ icon, label, variant = 'default', onClick }) {
  return (
    <button className={'aquaLoginOption aquaLoginOption--' + variant} type="button" onClick={onClick}>
      <span className="aquaLoginOption__icon" aria-hidden="true">
        <img src={ASSET + icon} alt="" />
      </span>
      <span className="aquaLoginOption__label">{label}</span>
      {variant === 'apple' ? null : (
        <img className="aquaLoginOption__arrow" src={ASSET + 'auth-arrow.svg'} alt="" aria-hidden="true" />
      )}
    </button>
  );
}

export default function SignInPage() {
  const navigate = useNavigate();
  const { path, isEn } = useLanguage();
  const { signIn } = useAuth();
  const emailInput = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formOpen) emailInput.current?.focus();
  }, [formOpen]);

  function showUnavailable(provider) {
    setMessage({
      type: 'notice',
      text: isEn
        ? provider + ' sign-in is not available yet. Use email and password for now.'
        : 'O acesso com ' + provider + ' ainda não está disponível. Por agora, usa e-mail e palavra-passe.',
    });
  }

  function openPasswordForm() {
    setMessage({ type: '', text: '' });
    setFormOpen(true);
  }

  async function onSubmit(event) {
    event.preventDefault();
    const emailTrim = email.trim().toLowerCase();
    setMessage({ type: '', text: '' });

    if (!isValidEmail(emailTrim)) {
      setMessage({ type: 'error', text: isEn ? 'Enter a valid email.' : 'Indica um e-mail válido.' });
      return;
    }
    if (!password) {
      setMessage({ type: 'error', text: isEn ? 'Enter your password.' : 'Indica a tua palavra-passe.' });
      return;
    }

    setLoading(true);
    try {
      await signIn({ email: emailTrim, password });
      navigate(path('/conta'), { replace: true });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || (isEn ? 'Could not sign in.' : 'Não foi possível iniciar sessão.'),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="aquaLoginPage">
      <div className="aquaLoginPage__ambient" aria-hidden="true" />

      <section className="aquaLoginPanel" aria-labelledby="aqua-login-title">
        <header className="aquaLoginHeader">
          <span className="aquaLoginHeader__icon" aria-hidden="true">
            <img src={ASSET + 'auth-lock.svg'} alt="" />
          </span>
          <div>
            <p className="aquaLoginHeader__eyebrow">{isEn ? 'AQUA OS ACCESS' : 'ACESSO AQUA OS'}</p>
            <h1 id="aqua-login-title">{isEn ? 'Sign in' : 'Iniciar sessão'}</h1>
          </div>
        </header>

        <p className="aquaLoginPanel__intro">
          {isEn
            ? 'Choose how you want to enter AQUA OS. Permissions continue to be validated by your organization.'
            : 'Escolhe como queres entrar no AQUA OS. As permissões continuam a ser validadas por organização.'}
        </p>

        <div className="aquaLoginOptions" aria-label={isEn ? 'Sign-in methods' : 'Métodos de entrada'}>
          <ProviderButton
            icon="auth-apple.svg"
            label={isEn ? 'Continue with Apple' : 'Continuar com a Apple'}
            variant="apple"
            onClick={() => showUnavailable('Apple')}
          />
          <ProviderButton
            icon="auth-google.svg"
            label={isEn ? 'Continue with Google' : 'Continuar com Google'}
            onClick={() => showUnavailable('Google')}
          />
          <ProviderButton
            icon="auth-microsoft.svg"
            label={isEn ? 'Continue with Microsoft' : 'Continuar com Microsoft'}
            onClick={() => showUnavailable('Microsoft')}
          />

          <div className="aquaLoginDivider" aria-hidden="true"><span /><b>{isEn ? 'OR' : 'OU'}</b><span /></div>

          <ProviderButton
            icon="auth-mail.svg"
            label={isEn ? 'Continue with email' : 'Continuar com e-mail'}
            onClick={openPasswordForm}
          />
          <ProviderButton
            icon="auth-phone.svg"
            label={isEn ? 'Continue with mobile' : 'Continuar com telemóvel'}
            onClick={() => showUnavailable(isEn ? 'mobile' : 'telemóvel')}
          />
          <ProviderButton
            icon="auth-key.svg"
            label={isEn ? 'Enter with password' : 'Entrar com palavra-passe'}
            onClick={openPasswordForm}
          />
        </div>

        {message.text && (!formOpen || message.type === 'notice') ? (
          <p className={'aquaLoginMessage aquaLoginMessage--' + message.type} role={message.type === 'error' ? 'alert' : 'status'}>
            {message.text}
          </p>
        ) : null}

        <div className={'aquaLoginFormWrap' + (formOpen ? ' is-open' : '')}>
          <form className="aquaLoginForm" onSubmit={onSubmit} aria-hidden={!formOpen}>
            <label htmlFor="signin-email">E-mail</label>
            <input
              ref={emailInput}
              id="signin-email"
              type="email"
              autoComplete="email"
              required
              placeholder="nome@exemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              tabIndex={formOpen ? 0 : -1}
            />
            <label htmlFor="signin-password">{isEn ? 'Password' : 'Palavra-passe'}</label>
            <input
              id="signin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              tabIndex={formOpen ? 0 : -1}
            />
            {message.type === 'error' ? (
              <p className="aquaLoginMessage aquaLoginMessage--error" role="alert">{message.text}</p>
            ) : null}
            <button className="aquaLoginSubmit" type="submit" disabled={loading} tabIndex={formOpen ? 0 : -1}>
              {loading ? (isEn ? 'Signing in…' : 'A iniciar…') : (isEn ? 'Sign in' : 'Iniciar sessão')}
            </button>
            <p className="aquaLoginForm__account">
              {isEn ? 'No account yet?' : 'Ainda não tens conta?'}{' '}
              <Link to={path('/signup')}>{isEn ? 'Create account' : 'Criar conta'}</Link>
            </p>
          </form>
        </div>

        <p className="aquaLoginPanel__privacy">
          <span aria-hidden="true" />
          {isEn
            ? 'AQUA OS does not receive passwords from Apple, Google or Microsoft.'
            : 'O AQUA OS não recebe palavras-passe da Apple, Google ou Microsoft.'}
        </p>
      </section>

      <footer className="aquaLoginFooter">
        <p>AQUA OS Platform · Console 0.3 · production</p>
        <nav aria-label={isEn ? 'Legal and support' : 'Informação legal e suporte'}>
          <Link to={path('/privacidade')}>{isEn ? 'Privacy' : 'Privacidade'}</Link>
          <Link to={path('/termos')}>{isEn ? 'Terms' : 'Termos'}</Link>
          <Link to={path('/contacto')}>{isEn ? 'Support' : 'Suporte'}</Link>
        </nav>
      </footer>
    </div>
  );
}
