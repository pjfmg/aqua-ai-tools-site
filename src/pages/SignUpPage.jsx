import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useAuth } from '../auth/auth.jsx';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignUpPage() {
  const navigate = useNavigate();
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
      setError('Indica o teu nome.');
      return;
    }
    if (!isValidEmail(emailTrim)) {
      setError('Indica um email válido.');
      return;
    }

    signIn({ name: nameTrim, email: emailTrim });
    navigate('/conta', { replace: true });
  }

  return (
    <>
      <Hero
        title="Criar conta"
        subtitle="Guarda as tuas preferências e acelera a descoberta de ferramentas."
        badge="Beta (local)"
      />

      <Section title="SignUp" subtitle="Por agora é um perfil local (sem password).">
        <div className="authWrap">
          <aside className="authAside">
            <div className="authCard">
              <div className="authCard__title">O que ganhas</div>
              <ul className="authCard__list">
                <li>Experiência personalizada</li>
                <li>Acesso rápido a favoritas</li>
                <li>Submissões com identidade</li>
              </ul>
              <div className="authCard__hint">
                Já tens conta? <Link to="/signin">Entrar</Link>
              </div>
            </div>
          </aside>

          <div className="authMain">
            <div className="panel">
              <form className="form" onSubmit={onSubmit}>
                <div className="form__grid">
                  <div className="field field--span2">
                    <label className="field__label" htmlFor="signup-name">
                      Nome *
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
                    Criar conta →
                  </button>
                  <Link className="btn btn--ghost" to="/signin">
                    Já tenho conta
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
