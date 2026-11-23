(() => {
  const lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'pt';
  document.documentElement.lang = lang;
  document.title = lang === 'en' ? 'Local demo | AQUA AI Tools' : 'Demo local | AQUA AI Tools';
  document.querySelectorAll('[data-pt][data-en]').forEach((node) => {
    node.textContent = node.dataset[lang];
  });
  document.getElementById('signup').href = lang === 'en' ? '/en/signup' : '/signup';
  document.getElementById('home').href = lang === 'en' ? '/en' : '/';
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach((item) => {
        item.setAttribute('aria-pressed', String(item === button));
      });
      document.querySelectorAll('[data-category]').forEach((card) => {
        card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      });
    });
  });
})();
