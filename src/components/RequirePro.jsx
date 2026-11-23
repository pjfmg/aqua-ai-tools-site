import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/auth.jsx';
import Hero from './Hero.jsx';
import Section from './Section.jsx';
import { useLanguage } from '../i18n.jsx';

function GuestProPreview({ title, isEn, path }) {
  const [favorite, setFavorite] = useState(false);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const kind = /visitadas|visited/i.test(title) ? 'visited' : /favoritas|favorites/i.test(title) ? 'favorites' : 'reviews';
  return (
    <>
      <Hero title={title} subtitle={isEn ? 'Try this Pro area with an example during this visit.' : 'Experimenta esta área Pro com um exemplo nesta visita.'} badge={isEn ? 'Temporary preview' : 'Pré-visualização temporária'} />
      <Section title={isEn ? 'Example workspace' : 'Espaço de exemplo'} subtitle={isEn ? 'No account data is loaded or saved.' : 'Nenhum dado da conta é carregado ou guardado.'}>
        <div className="panel" data-testid="guest-pro-preview">
          <strong>{isEn ? 'Example AI writing tool' : 'Ferramenta de escrita IA (exemplo)'}</strong>
          {kind === 'visited' ? <p>{isEn ? 'Visited today · example only. Your real history becomes available with Pro.' : 'Visitada hoje · apenas exemplo. O teu histórico real fica disponível com Pro.'}</p> : null}
          {kind === 'favorites' ? (
            <p><button className="btn btn--ghost" type="button" onClick={() => setFavorite((value) => !value)}>{favorite ? (isEn ? '♥ Remove from preview' : '♥ Remover do exemplo') : (isEn ? '♡ Add to preview' : '♡ Adicionar ao exemplo')}</button></p>
          ) : null}
          {kind === 'reviews' ? (
            <div className="field">
              <label className="field__label" htmlFor="guest-review-rating">{isEn ? 'Your example rating' : 'A tua avaliação de exemplo'}</label>
              <select id="guest-review-rating" className="select" value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                <option value="0">—</option>{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} / 5</option>)}
              </select>
              <label className="field__label" htmlFor="guest-review-note">{isEn ? 'Example note' : 'Nota de exemplo'}</label>
              <textarea id="guest-review-note" className="textarea" value={note} onChange={(event) => setNote(event.target.value)} />
            </div>
          ) : null}
          <p className="note">{isEn ? 'This example stays on this screen and is never submitted.' : 'Este exemplo fica neste ecrã e nunca é enviado.'}</p>
          <Link className="btn btn--primary" to={path('/signin')}>{isEn ? 'Sign in for your data' : 'Entrar para aceder aos teus dados'}</Link>
        </div>
      </Section>
    </>
  );
}

export default function RequirePro({ children, title = 'Área Pro' }) {
  const { path, isEn } = useLanguage();
  const { isAuthed, billingLoaded, hasProAccess } = useAuth();

  if (!isAuthed) return <GuestProPreview title={title} isEn={isEn} path={path} />;

  if (!billingLoaded) {
    return (
      <>
        <Hero title={title} subtitle={isEn ? 'Validating your subscription.' : 'A validar a tua subscrição.'} badge={isEn ? 'Loading' : 'A carregar'} />
        <Section title={isEn ? 'Please wait' : 'Aguarda'} subtitle={isEn ? 'We are confirming your Pro access.' : 'Estamos a confirmar o teu acesso Pro no AQUA OS Commerce.'}>
          <div className="panel">
            <p className="note" style={{ margin: 0 }}>
              {isEn ? 'This only takes a few moments.' : 'Isto demora apenas alguns instantes.'}
            </p>
          </div>
        </Section>
      </>
    );
  }

  if (!hasProAccess) {
    return (
      <>
        <Hero title={title} subtitle={isEn ? 'This feature is part of the Pro subscription.' : 'Esta funcionalidade faz parte da subscrição Pro.'} badge={isEn ? 'Upgrade required' : 'Upgrade necessário'} />
        <Section title={isEn ? 'Unlock' : 'Desbloquear'} subtitle={isEn ? 'Activate Pro to access favorites, history and reviews.' : 'Ativa o plano Pro para aceder a favoritos, histórico e reviews.'}>
          <div className="panel">
            <div className="form__actions" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--primary" to={path('/pro')}>
                {isEn ? 'View Pro' : 'Ver Pro'}
              </Link>
              <Link className="btn btn--ghost" to={path('/conta')}>
                {isEn ? 'Go to account' : 'Ir para conta'}
              </Link>
            </div>
          </div>
        </Section>
      </>
    );
  }

  return children;
}
