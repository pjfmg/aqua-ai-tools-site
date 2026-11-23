// Shared, static-Web first-open presentation. Account and product access stay with the host app.
(() => {
  const script = document.currentScript;
  if (!script) return;
  const { localeKey, sessionKey, introKey, signature, institutionalLogo, appName } = script.dataset;
  const actions = JSON.parse(script.dataset.entryActions || '[]');
  const read = (storage, key) => {
    try { return storage.getItem(key); } catch { return null; }
  };
  const write = (storage, key, value) => {
    try { storage.setItem(key, value); } catch { /* Private browsing may deny storage. */ }
  };
  const requested = new URLSearchParams(location.search).get('lang');
  const explicitLocale = requested === 'en' ? 'en' : requested === 'pt' || requested === 'pt-PT' ? 'pt-PT' : null;
  const storedLocale = read(localStorage, localeKey);
  const hasLocale = Boolean(explicitLocale || storedLocale === 'en' || storedLocale === 'pt-PT');
  const needsSplash = read(sessionStorage, sessionKey) !== 'seen';
  const needsIntro = Boolean(introKey && read(localStorage, introKey) !== 'seen');
  if (!needsSplash && hasLocale && !needsIntro) return;

  document.documentElement.classList.add('aqua-entry-active');
  const show = () => {
    const overlay = document.createElement('div');
    overlay.id = 'aqua-entry-overlay';
    overlay.dataset.i18nIgnore = 'true';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', appName || 'AQUA');
    overlay.innerHTML = `<div class="aqua-entry-centre"><img class="aqua-entry-signature" alt="${appName || 'AQUA'}" src="${signature}"><section class="aqua-entry-language" hidden><h1 class="aqua-entry-title">Escolhe o idioma <span lang="en">/ Choose your language</span></h1><div class="aqua-entry-options" role="group" aria-label="Idioma / Language"><button type="button" data-entry-locale="pt-PT" aria-label="Português"><span aria-hidden="true">🇵🇹</span> PT</button><button type="button" data-entry-locale="en" aria-label="English"><span aria-hidden="true">🇬🇧</span> EN</button></div></section><section class="aqua-entry-intro" hidden><h1 class="aqua-entry-title"></h1><p class="aqua-entry-description"></p><div class="aqua-entry-actions"></div></section></div><img class="aqua-entry-institutional" src="${institutionalLogo}" alt="AQUATICUS">`;
    document.body.prepend(overlay);
    const finish = (launchApp = true) => {
      overlay.remove();
      document.documentElement.classList.remove('aqua-entry-active');
      if (launchApp) window.dispatchEvent(new CustomEvent('aqua-entry-finished', { detail: {} }));
    };
    const language = overlay.querySelector('.aqua-entry-language');
    const intro = overlay.querySelector('.aqua-entry-intro');
    const showIntro = (locale) => {
      const english = locale === 'en';
      language.hidden = true;
      intro.hidden = false;
      intro.querySelector('.aqua-entry-title').textContent = english ? 'Welcome to this app' : 'Bem-vindo a esta app';
      intro.querySelector('.aqua-entry-description').textContent = english
        ? 'Create a simple account, sign in or try a limited demonstration without an account.'
        : 'Cria uma conta simples, entra ou experimenta uma demonstração limitada sem conta.';
      const list = intro.querySelector('.aqua-entry-actions');
      list.replaceChildren();
      for (const action of actions) {
        const link = document.createElement('a');
        link.href = english && action.hrefEn ? action.hrefEn : action.href;
        link.dataset.entryDestination = action.id;
        link.textContent = english ? action.en : action.pt;
        list.append(link);
      }
      overlay.setAttribute('aria-label', english ? 'Entry options' : 'Opções de entrada');
      list.querySelector('a')?.focus();
    };
    const afterSplash = () => {
      write(sessionStorage, sessionKey, 'seen');
      if (hasLocale) {
        if (needsIntro) showIntro(explicitLocale || storedLocale);
        else finish();
        return;
      }
      language.hidden = false;
      overlay.setAttribute('aria-label', 'Idioma / Language');
      language.querySelector('button').focus();
    };
    overlay.addEventListener('click', (event) => {
      const destination = event.target.closest('[data-entry-destination]');
      if (destination) {
        write(localStorage, introKey, 'seen');
        finish(false);
        return;
      }
      const button = event.target.closest('[data-entry-locale]');
      if (!button) return;
      const selected = button.dataset.entryLocale;
      write(localStorage, localeKey, selected);
      window.dispatchEvent(new CustomEvent('aqua-entry-locale-selected', { detail: { locale: selected } }));
      if (needsIntro) showIntro(selected);
      else finish();
    });
    if (needsSplash) setTimeout(afterSplash, 4000);
    else afterSplash();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show, { once: true });
  else show();
})();
