(() => {
  try {
    if (
      location.pathname === '/' &&
      localStorage.getItem('aqua-ai-tools-intro-seen') === 'seen' &&
      localStorage.getItem('aqua-ai-tools-entry-locale') === 'en'
    ) location.replace('/en');
  } catch { /* Storage can be unavailable in private browsing. */ }
})();
