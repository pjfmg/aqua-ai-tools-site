function hashStringToUint32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickEmojiForCategory(name) {
  const n = String(name || '').toLowerCase();

  const rules = [
    [/texto|writing|copy|conte[uú]do/, '📝'],
    [/chat|chatbot|conversa|assistente/, '💬'],
    [/imagem|image|foto|photo|v[ií]deo|video|visual/, '📷'],
    [/design|arte|art|ui|ux/, '🎨'],
    [/audio|som|music|m[uú]sica|voz|voice/, '🎵'],
    [/dev|code|c[oó]digo|program|api|sdk/, '💻'],
    [/dados|data|analytics|m[eé]trica|bi|insight/, '📊'],
    [/marketing|seo|ads|an[uú]ncio|social/, '📣'],
    [/produtividade|productivity|workflow|autom|gest[aã]o/, '⚡'],
    [/web|site|sites|landing|browser/, '🌐'],
    [/form[aã]o|training|curso|learn|educa/, '🎓'],
    [/finance|finan|crypto|pagamento|payment/, '💰'],
    [/seguran|security|privacidade|privacy/, '🛡️'],
  ];

  for (const [re, emoji] of rules) {
    if (re.test(n)) return emoji;
  }

  const fallback = ['✨', '🔎', '🧠', '🧩', '⚙️', '📌', '⭐', '🚀'];
  return fallback[hashStringToUint32(n) % fallback.length];
}

function pickGradient(name) {
  const gradients = [
    ['#7c3aed', '#db2777', '#2563eb'],
    ['#06b6d4', '#6366f1', '#ec4899'],
    ['#22c55e', '#16a34a', '#0ea5e9'],
    ['#f97316', '#db2777', '#8b5cf6'],
  ];
  return gradients[hashStringToUint32(String(name || '')) % gradients.length];
}

export function getCategoryIconDataUrl(categoryName) {
  const emoji = pickEmojiForCategory(categoryName);
  const [a, b, c] = pickGradient(categoryName);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}" stop-opacity="0.22"/>
      <stop offset="0.55" stop-color="${b}" stop-opacity="0.20"/>
      <stop offset="1" stop-color="${c}" stop-opacity="0.18"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="46" height="46" rx="14" fill="url(#g)" stroke="rgba(15,23,42,0.10)"/>
  <text x="24" y="28" text-anchor="middle" font-size="20" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, system-ui">${emoji}</text>
</svg>`;

  const encoded = encodeURIComponent(svg)
    .replace(/%0A/g, '')
    .replace(/%20/g, ' ')
    .replace(/%3D/g, '=')
    .replace(/%3A/g, ':')
    .replace(/%2F/g, '/');

  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

