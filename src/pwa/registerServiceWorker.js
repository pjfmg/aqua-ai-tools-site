export function registerAquaServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((registration) => {
      const refreshRegistration = () => registration.update().catch(() => {});
      window.addEventListener('online', refreshRegistration);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') refreshRegistration();
      });
    }).catch(() => {
      // A falha do service worker não deve impedir o acesso normal ao catálogo.
    });
  }, { once: true });
}
