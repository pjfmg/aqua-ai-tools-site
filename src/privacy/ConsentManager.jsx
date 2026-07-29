import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n.jsx';
import { useConsent } from './ConsentContext.jsx';

export default function ConsentManager() {
  const { isEn, path } = useLanguage();
  const { consent, hasDecision, renewalReason, privacySignal, advertisingAvailable, preferencesOpen, openPreferences, closePreferences, save, rejectAll, acceptAll, withdrawConsent } = useConsent();
  const [analytics, setAnalytics] = useState(false); const [advertising, setAdvertising] = useState(false);
  const dialogRef = useRef(null); const previousFocus = useRef(null);

  useEffect(() => { if (preferencesOpen) { setAnalytics(Boolean(consent?.analytics)); setAdvertising(Boolean(consent?.advertising && advertisingAvailable && !privacySignal)); } }, [preferencesOpen, consent, advertisingAvailable, privacySignal]);
  useEffect(() => {
    if (!preferencesOpen) return undefined;
    previousFocus.current = document.activeElement; const dialog = dialogRef.current; dialog?.querySelector('button, input')?.focus();
    function onKeyDown(event) {
      if (event.key === 'Escape') closePreferences();
      if (event.key === 'Tab' && dialog) {
        const items = [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled])')]; if (!items.length) return;
        const first = items[0]; const last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKeyDown); return () => { document.removeEventListener('keydown', onKeyDown); previousFocus.current?.focus?.(); };
  }, [preferencesOpen, closePreferences]);

  const renewalMessage = renewalReason === 'expired'
    ? (isEn ? 'Your previous choice expired after 180 days. Please choose again.' : 'A tua escolha anterior expirou após 180 dias. Escolhe novamente.')
    : renewalReason === 'policy-updated'
      ? (isEn ? 'Our consent policy changed. Please review and renew your choice.' : 'A política de consentimento mudou. Revê e renova a tua escolha.')
      : renewalReason === 'revoked'
        ? (isEn ? 'You withdrew consent. Optional services remain off until you choose again.' : 'Retiraste o consentimento. Os serviços opcionais permanecem desligados até escolheres novamente.')
        : null;

  return (
    <>
      {!hasDecision ? (
        <section className="consentBanner" aria-labelledby="consent-title" aria-describedby="consent-description">
          <div><h2 id="consent-title">{isEn ? 'Your privacy choices' : 'As tuas escolhas de privacidade'}</h2><p id="consent-description"><span className="consentBanner__descriptionLong">{renewalMessage || (isEn ? 'Necessary storage keeps the service working. Analytics and advertising only start with your permission.' : 'O armazenamento necessário mantém o serviço a funcionar. Analytics e publicidade só começam com a tua autorização.')}</span><span className="consentBanner__descriptionShort">{renewalMessage || (isEn ? 'Essentials keep the service working; analytics and ads need your permission.' : 'O essencial mantém o serviço; analytics e publicidade precisam da tua autorização.')}</span></p>{privacySignal ? <p className="consentBanner__signal">{isEn ? 'Your browser privacy signal is active; advertising remains off.' : 'O sinal de privacidade do browser está ativo; a publicidade permanece desligada.'}</p> : null}</div>
          <div className="consentActions consentBanner__actions"><button className="btn btn--ghost" type="button" aria-label={isEn ? 'Reject optional cookies' : 'Recusar cookies opcionais'} onClick={rejectAll}><span className="consentAction__long">{isEn ? 'Reject optional' : 'Recusar opcionais'}</span><span className="consentAction__short">{isEn ? 'Reject' : 'Recusar'}</span></button><button className="btn btn--ghost" type="button" onClick={openPreferences}>{isEn ? 'Manage' : 'Gerir'}</button><button className="btn btn--primary" type="button" aria-label={isEn ? 'Accept all cookies' : 'Aceitar todos os cookies'} onClick={acceptAll}><span className="consentAction__long">{isEn ? 'Accept all' : 'Aceitar tudo'}</span><span className="consentAction__short">{isEn ? 'Accept' : 'Aceitar'}</span></button></div>
          <a className="consentBanner__link" href={path('/privacidade')}>{isEn ? 'Privacy policy' : 'Política de privacidade'}</a>
        </section>
      ) : null}
      {preferencesOpen ? (
        <div className="consentModal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closePreferences(); }}>
          <div ref={dialogRef} className="consentDialog" role="dialog" aria-modal="true" aria-labelledby="consent-dialog-title">
            <h2 id="consent-dialog-title">{isEn ? 'Privacy preferences' : 'Preferências de privacidade'}</h2>
            <label className="consentChoice"><input type="checkbox" checked disabled /><span><strong>{isEn ? 'Necessary' : 'Necessário'}</strong><small>{isEn ? 'Authentication, security and saved preferences.' : 'Autenticação, segurança e preferências guardadas.'}</small></span></label>
            <label className="consentChoice"><input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} /><span><strong>Analytics</strong><small>{isEn ? 'Google Analytics and Microsoft Clarity, with reduced data collection.' : 'Google Analytics e Microsoft Clarity, com recolha de dados reduzida.'}</small></span></label>
            <label className="consentChoice"><input type="checkbox" checked={advertising} disabled={privacySignal || !advertisingAvailable} onChange={(event) => setAdvertising(event.target.checked)} /><span><strong>{isEn ? 'Advertising' : 'Publicidade'}</strong><small>{privacySignal ? (isEn ? 'Disabled by your browser privacy signal.' : 'Desativada pelo sinal de privacidade do browser.') : !advertisingAvailable ? (isEn ? 'Unavailable until a Google-certified IAB TCF consent platform is configured.' : 'Indisponível até estar configurada uma plataforma de consentimento IAB TCF certificada pela Google.') : (isEn ? 'Google AdSense; personalization remains disabled by default.' : 'Google AdSense; a personalização continua desativada por defeito.')}</small></span></label>
            <div className="consentActions">{hasDecision ? <button className="btn btn--ghost" type="button" onClick={withdrawConsent}>{isEn ? 'Withdraw consent' : 'Retirar consentimento'}</button> : null}<button className="btn btn--ghost" type="button" onClick={closePreferences}>{isEn ? 'Cancel' : 'Cancelar'}</button><button className="btn btn--primary" type="button" onClick={() => save({ analytics, advertising })}>{isEn ? 'Save choices' : 'Guardar escolhas'}</button></div>
          </div>
        </div>
      ) : null}
    </>
  );
}
