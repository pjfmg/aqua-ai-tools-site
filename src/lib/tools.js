import { fetchWithTimeout } from './http.js';

const PAGE_SIZE = 100;

export function isHttpUrl(value) {
  if (!value || typeof value !== 'string') return false;
  return /^https?:\/\//i.test(value);
}

function normalizeImageUrl(value) {
  if (!value || typeof value !== 'string') return '';
  const raw = value.trim();
  if (!raw) return '';
  // Protocol-relative URLs.
  const protocolReady = raw.startsWith('//') ? `https:${raw}` : raw;
  try {
    const u = new URL(protocolReady);
    // iOS (especially in WebViews/PWAs) can block plain http (ATS / mixed content policies).
    if (u.protocol === 'http:') u.protocol = 'https:';
    if (u.protocol !== 'https:') return '';
    return u.href;
  } catch {
    return '';
  }
}

export function proxyImageUrl(value) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';
  if (raw.startsWith('/')) return raw;
  try {
    const u = new URL(raw);
    if (typeof window !== 'undefined' && u.origin === window.location.origin) return u.href;
  } catch {
    // ignore
  }
  return `/img?u=${encodeURIComponent(raw)}`;
}

function expandImageUrlVariants(urls) {
  const out = [];
  for (const u of Array.isArray(urls) ? urls : []) {
    if (!u) continue;
    out.push(u);
    const proxied = proxyImageUrl(u);
    if (proxied && proxied !== u) out.push(proxied);
  }
  return out.filter(Boolean).filter((v, idx, arr) => arr.indexOf(v) === idx);
}

async function readUpstreamError(res) {
  try {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      const preferred =
        json?.error?.message ??
        json?.error?.type ??
        json?.message ??
        json?.error ??
        (typeof json === 'string' ? json : json);
      const msg = typeof preferred === 'string' ? preferred : JSON.stringify(preferred);
      return String(msg || '').slice(0, 400);
    } catch {
      return String(text || '').slice(0, 400);
    }
  } catch {
    return '';
  }
}

async function fetchAirtablePage({ offset = null, pageSize = PAGE_SIZE } = {}) {
  const url = new URL('/airtable', window.location.origin);
  url.searchParams.set('pageSize', String(pageSize));
  if (offset) url.searchParams.set('offset', offset);
  // Extra cache-buster for the first page to avoid any stale cached `offset` cursor (not forwarded to Airtable).
  if (!offset) url.searchParams.set('_ts', String(Date.now()));

  // iOS Safari/WebViews can be aggressive with caching; a cached Airtable page may include an expired `offset`
  // cursor and cause 422 LIST_RECORDS_ITERATOR_NOT_AVAILABLE on the next page request.
  const res = await fetchWithTimeout(url.toString(), { cache: 'no-store' }, 8000);
  if (!res.ok) {
    const details = await readUpstreamError(res);
    throw new Error(`Proxy /airtable falhou (${res.status})${details ? `: ${details}` : ''}`);
  }
  const json = await res.json();
  if (!json?.records) throw new Error('Resposta inválida do proxy');
  return { records: json.records, offset: json.offset || null };
}

export function normalizeWebsiteUrl(value) {
  if (!value || typeof value !== 'string') return '';
  const raw = value.trim();
  if (!raw) return '';
  try {
    const u = new URL(raw);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : '';
  } catch {
    try {
      const u = new URL(`https://${raw}`);
      return u.href;
    } catch {
      return '';
    }
  }
}

export function getHostnameFromWebsiteUrl(value) {
  const url = normalizeWebsiteUrl(value);
  if (!url) return '';
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export function normalizeFuncoes(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value?.value === 'string') return value.value;
  if (value?.value === null) return '';
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

export function normalizeDescricao(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value?.value === 'string') return value.value;
  if (value?.value === null) return '';
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

export function normalizeArea(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return [String(value)];
}

export function getAirtableAttachmentUrl(value) {
  if (!value) return '';

  // Airtable attachments are typically arrays; be defensive if a single object is passed.
  const first = Array.isArray(value) ? value[0] : value;
  if (!first) return '';

  const thumb =
    first?.thumbnails?.large?.url ||
    first?.thumbnails?.full?.url ||
    first?.thumbnails?.small?.url ||
    '';
  const normalizedThumb = normalizeImageUrl(thumb);
  if (normalizedThumb) return normalizedThumb;

  const normalized = normalizeImageUrl(first?.url || '');
  if (normalized) return normalized;

  return '';
}

export function pickLogoUrls(tool) {
  const candidates = [];

  const fromLogoField =
    (typeof tool?.Logo === 'string' && normalizeImageUrl(tool.Logo)) ||
    getAirtableAttachmentUrl(tool?.Logo);
  if (fromLogoField) candidates.push(fromLogoField);

  if (typeof tool?.ClearbitLogo === 'string') {
    const u = normalizeImageUrl(tool.ClearbitLogo);
    if (u) candidates.push(u);
  }
  if (typeof tool?.FaviconLogo === 'string') {
    const u = normalizeImageUrl(tool.FaviconLogo);
    if (u) candidates.push(u);
  }

  const hostname = getHostnameFromWebsiteUrl(tool?.Site);
  if (hostname) {
    candidates.push(`https://logo.clearbit.com/${hostname}`);
    candidates.push(`https://www.google.com/s2/favicons?sz=128&domain=${hostname}`);
  }

  const unique = candidates.filter(Boolean).filter((v, idx) => candidates.indexOf(v) === idx);
  // Prefer direct URLs first (works even on static hosting without /img),
  // but include proxied variants as fallbacks when available.
  const variants = expandImageUrlVariants(unique);
  const primary = variants[0] || '/assets/img/placeholder-ai-tools.png';
  const fallbacks = variants.slice(1, 10);
  const secondary = fallbacks[0] || '';
  return { primary, secondary, fallbacks };
}

export function mapMockToTool(mock) {
  return {
    id: mock?.id ?? (mock?.numero ? `mock:${String(mock.numero)}` : ''),
    Nome: mock?.nome ?? '',
    Número: mock?.numero ?? '',
    Logo: mock?.logo ?? '',
    Site: mock?.site ?? '',
    Preço: mock?.preco ?? '',
    Visitado: mock?.visitado ?? '',
    Favorito: mock?.favorito ?? '',
    'Descrição': mock?.descricao ?? mock?.descrição ?? '',
    'Área/Categoria': mock?.area ? [String(mock.area)] : [],
    Funções: mock?.funcoes ? { value: String(mock.funcoes) } : { value: '' },
  };
}

export function extractToolFromRecord(record) {
  const fields = record?.fields || {};
  const categoryRaw =
    fields['Área/Categoria'] ??
    fields['Categoria'] ??
    fields['Área'] ??
    fields['Area/Categoria'] ??
    fields['Area'] ??
    null;
  const category = normalizeArea(categoryRaw);
  return {
    id: record?.id || fields?.id || fields?.ID || fields?.Id || '',
    ...fields,
    // Normalize category so UI can always read tool['Área/Categoria'].
    'Área/Categoria': category,
    // Also expose as Categoria for components/features that expect this name.
    Categoria: fields['Categoria'] ?? (category.length ? category : []),
    Funções:
      fields['Funções'] && typeof fields['Funções'] === 'object'
        ? fields['Funções']
        : { value: fields['Funções'] || '' },
  };
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashStringToUint32(str) {
  // simple non-crypto hash (FNV-1a 32-bit-ish)
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(items, seed) {
  const arr = [...items];
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickDailyFeaturedTools(tools, count = 20, dateKey = getLocalDateKey()) {
  const stable = [...tools].sort((a, b) => {
    const ak = String(a?.ID_Unico || a?.id || a?.Nome || a?.['Nome'] || '');
    const bk = String(b?.ID_Unico || b?.id || b?.Nome || b?.['Nome'] || '');
    return ak.localeCompare(bk, 'pt');
  });

  const seed = hashStringToUint32(`aqua-featured:${dateKey}`);
  const shuffled = seededShuffle(stable, seed);
  return shuffled.slice(0, Math.max(0, count));
}

export async function loadToolsPhased({ onChunk, initialPageSize = 40 } = {}) {
  try {
    const out = [];
    let offset = null;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const isFirstPage = !offset && out.length === 0;
      const pageSize = isFirstPage
        ? Math.max(10, Math.min(PAGE_SIZE, Number(initialPageSize) || PAGE_SIZE))
        : PAGE_SIZE;
      const page = await fetchAirtablePage({ offset, pageSize });
      const chunk = page.records.map(extractToolFromRecord);
      out.push(...chunk);

      if (typeof onChunk === 'function') {
        onChunk(chunk, { done: !page.offset, total: out.length });
      }

      if (!page.offset) break;
      offset = page.offset;
    }

    return { tools: out, warning: '' };
  } catch (err) {
    const res = await fetchWithTimeout('/data/tools.json', { cache: 'no-store' }, 4000);
    const json = await res.json();
    const mapped = (Array.isArray(json) ? json : []).map(mapMockToTool);

    if (typeof onChunk === 'function') {
      onChunk(mapped, { done: true, total: mapped.length, source: 'mock' });
    }

    return {
      tools: mapped,
      warning: `Aviso: a fonte principal falhou (${err.message}). A mostrar mock local.`,
    };
  }
}

export async function loadTools() {
  return await loadToolsPhased();
}
