export function registerAquaServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  const register = () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((registration) => {
      const refresh = () => registration.update().catch(() => {});
      window.addEventListener('online', refresh);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') refresh();
      });
    }).catch(() => {
      // Offline support is optional; the online directory must still load.
    });
  };

  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
