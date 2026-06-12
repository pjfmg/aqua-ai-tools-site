import { fetchWithTimeout } from './http.js';

const PAGE_SIZE = 100;
const FIRST_PAGE_SIZE = 20;
const FETCH_TIMEOUT_MS = 20000;
let localSnapshotPromise = null;

export function normalizeRecordStatus(value) {
  const mode = String(value || 'eligible').trim().toLowerCase();
  return ['published', 'eligible', 'all'].includes(mode) ? mode : 'eligible';
}

export function normalizeToolFilters(filters = {}) {
  return {
    q: String(filters.q || '').trim(),
    number: String(filters.number || '').trim(),
    area: String(filters.area || '').trim(),
    price: String(filters.price || '').trim(),
  };
}

function hasToolFilters(filters) {
  const normalized = normalizeToolFilters(filters);
  return Boolean(normalized.q || normalized.number || normalized.area || normalized.price);
}

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

async function fetchAirtablePage({ offset = null, pageSize = PAGE_SIZE, recordStatus = 'eligible', filters = {} } = {}) {
  const url = new URL('/airtable', window.location.origin);
  const normalizedFilters = normalizeToolFilters(filters);
  url.searchParams.set('pageSize', String(pageSize));
  url.searchParams.set('status', normalizeRecordStatus(recordStatus));
  if (normalizedFilters.q) url.searchParams.set('q', normalizedFilters.q);
  if (normalizedFilters.number) url.searchParams.set('number', normalizedFilters.number);
  if (normalizedFilters.area) url.searchParams.set('area', normalizedFilters.area);
  if (normalizedFilters.price) url.searchParams.set('price', normalizedFilters.price);
  if (offset) url.searchParams.set('offset', offset);
  // Extra cache-buster for the first page to avoid any stale cached `offset` cursor (not forwarded to Airtable).
  if (!offset) url.searchParams.set('_ts', String(Date.now()));

  // iOS Safari/WebViews can be aggressive with caching; a cached Airtable page may include an expired `offset`
  // cursor and cause 422 LIST_RECORDS_ITERATOR_NOT_AVAILABLE on the next page request.
  const res = await fetchWithTimeout(url.toString(), { cache: 'no-store' }, FETCH_TIMEOUT_MS);
  if (!res.ok) {
    const details = await readUpstreamError(res);
    throw new Error(`Proxy /airtable falhou (${res.status})${details ? `: ${details}` : ''}`);
  }
  const json = await res.json();
  if (!json?.records) throw new Error('Resposta inválida do proxy');
  return { records: json.records, offset: json.offset || null };
}

function isAuthFailureMessage(message) {
  const text = String(message || '').toLowerCase();
  return (
    text.includes('invalid authentication token') ||
    text.includes('authentication token') ||
    text.includes('proxy /airtable falhou (401)') ||
    text.includes('proxy /airtable falhou (403)')
  );
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
  if (typeof value?.name === 'string') return value.name;
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
  if (typeof value?.name === 'string') return value.name;
  if (typeof value?.value === 'string') return value.value;
  if (value?.value === null) return '';
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

function normalizeTextValue(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  if (typeof value?.name === 'string') return value.name.trim();
  if (typeof value?.value === 'string') return value.value.trim();
  if (typeof value?.label === 'string') return value.label.trim();
  return '';
}

export function normalizeArea(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        if (typeof item?.name === 'string') return item.name;
        if (typeof item?.value === 'string') return item.value;
        return String(item);
      })
      .filter(Boolean);
  }
  if (typeof value?.name === 'string') return [value.name];
  if (typeof value?.value === 'string') return [value.value];
  return [String(value)];
}

export function getToolName(tool) {
  return String(tool?.['Nome'] ?? tool?.Nome ?? tool?.['Name'] ?? tool?.Name ?? '').trim();
}

export function getToolNumber(tool) {
  const value = tool?.['Número'] ?? tool?.Numero ?? tool?.['Number'] ?? tool?.Number ?? '';
  return String(value ?? '').trim();
}

export function getToolSite(tool) {
  return normalizeWebsiteUrl(tool?.['Site'] ?? tool?.Site ?? tool?.['Final URL'] ?? tool?.['URL'] ?? tool?.URL ?? '');
}

const CATEGORY_PT = new Map([
  ['automation', 'Automação'],
  ['business', 'Negócios'],
  ['chatbots', 'Chatbots'],
  ['comparison', 'Comparação'],
  ['design', 'Design'],
  ['directory', 'Diretório'],
  ['education', 'Educação'],
  ['evaluation', 'Avaliação'],
  ['finance', 'Finanças'],
  ['guides', 'Guias'],
  ['image', 'Imagem'],
  ['machine learning', 'Machine Learning'],
  ['marketing', 'Marketing'],
  ['productivity', 'Produtividade'],
  ['prompts', 'Prompts'],
  ['security', 'Segurança'],
  ['social media', 'Redes sociais'],
  ['text', 'Texto'],
  ['video', 'Vídeo'],
  ['writing assistant', 'Assistente de escrita'],
]);

const DESCRIPTION_PT_EXACT = new Map([
  ['use a temporary email for 10 minutes.', 'Usa um email temporário durante 10 minutos.'],
  [
    'free online form builder creates registration forms, order forms, application forms, surveys and more, all fully integrated with your digital tools.',
    'Criador de formulários online gratuito para criar registos, encomendas, candidaturas, inquéritos e muito mais, totalmente integrado com as tuas ferramentas digitais.',
  ],
  [
    'transforms text prompts into unique and customizable images for various applications.',
    'Transforma prompts de texto em imagens únicas e personalizáveis para várias aplicações.',
  ],
  [
    'ai-driven strategy crafting in minutes for entrepreneurs on the go.',
    'Criação de estratégias com IA em minutos para empreendedores em movimento.',
  ],
  [
    'complete the test be yourself and answer honestly to find out your personality type.',
    'Faz o teste, sê tu próprio e responde com honestidade para descobrir o teu tipo de personalidade.',
  ],
]);

const DESCRIPTION_PT_REPLACEMENTS = [
  [/\bAI-powered\b/gi, 'com IA'],
  [/\bAI-driven\b/gi, 'orientado por IA'],
  [/\bAI\b/g, 'IA'],
  [/\bFree online\b/gi, 'Online gratuito'],
  [/\bform builder\b/gi, 'criador de formulários'],
  [/\btemporary email\b/gi, 'email temporário'],
  [/\bfor entrepreneurs\b/gi, 'para empreendedores'],
  [/\bin minutes\b/gi, 'em minutos'],
  [/\bon the go\b/gi, 'em movimento'],
  [/\btext prompts\b/gi, 'prompts de texto'],
  [/\bunique and customizable images\b/gi, 'imagens únicas e personalizáveis'],
  [/\bvarious applications\b/gi, 'várias aplicações'],
  [/\bComplete The Test\b/g, 'Faz o teste'],
  [/\banswer honestly\b/gi, 'responde com honestidade'],
  [/\bpersonality type\b/gi, 'tipo de personalidade'],
  [/\bNo description\b/gi, 'Sem descrição'],
];

function isLikelyEnglish(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  const lower = text.toLowerCase();
  return /\b(the|and|with|for|from|your|you|into|online|minutes|business|creates|complete|answer)\b/.test(lower);
}

function translateDescriptionToPt(value) {
  const text = String(value || '').trim();
  if (!text) return '';

  const exact = DESCRIPTION_PT_EXACT.get(text.toLowerCase());
  if (exact) return exact;

  if (!isLikelyEnglish(text)) return text;

  let translated = text;
  for (const [pattern, replacement] of DESCRIPTION_PT_REPLACEMENTS) {
    translated = translated.replace(pattern, replacement);
  }

  return isLikelyEnglish(translated) ? '' : translated;
}

export function localizeCategory(value, lang = 'pt') {
  const text = String(value || '').trim();
  if (!text || lang === 'en') return text;
  return CATEGORY_PT.get(text.toLowerCase()) || text;
}

export function getToolDescription(tool, lang = 'pt') {
  const pt = normalizeDescricao(
    tool?.['Descrição PT'] ??
      tool?.['Description PT'] ??
      tool?.['Descrição'] ??
      tool?.Descricao ??
      '',
  );
  const en = normalizeDescricao(
    tool?.['Description EN'] ??
      tool?.['Short Description'] ??
      tool?.['Description'] ??
      '',
  );
  const fallback = normalizeDescricao(tool?.['Descrição'] ?? tool?.Descricao ?? '');

  if (lang === 'en') return en || pt || fallback;

  if (pt && !isLikelyEnglish(pt)) return pt;

  const translated = translateDescriptionToPt(pt || en || fallback);
  if (translated) return translated;

  const category = getLocalizedToolAreas(tool, 'pt')[0];
  return category
    ? `Ferramenta digital na categoria ${category}, pensada para apoiar tarefas e fluxos de trabalho.`
    : 'Ferramenta digital para apoiar tarefas, produtividade e fluxos de trabalho.';
}

export function getToolPrice(tool) {
  return String(tool?.['Preço'] ?? tool?.Preco ?? tool?.['Pricing Model'] ?? '').trim();
}

export function getToolAreas(tool) {
  const values = [
    ...normalizeArea(tool?.['Área/Categoria'] ?? ''),
    ...normalizeArea(tool?.Categoria ?? ''),
    ...normalizeArea(tool?.['Category'] ?? ''),
    ...normalizeArea(tool?.['Subcategory'] ?? ''),
    ...normalizeArea(tool?.['Categoria sugerida (IA)'] ?? ''),
  ].filter((value, idx, arr) => value && arr.indexOf(value) === idx);

  return values;
}

export function getLocalizedToolAreas(tool, lang = 'pt') {
  return getToolAreas(tool).map((area) => localizeCategory(area, lang));
}

function normalizeCheckbox(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const text = normalizeTextValue(value).toLowerCase();
  return text === 'true' || text === '1' || text === 'yes' || text === 'sim' || text === 'checked';
}

function isPublishedRecord(fields) {
  return normalizeCheckbox(fields?.Published);
}

function isDuplicateRecord(fields) {
  const duplicated = normalizeTextValue(fields?.Duplicated).toLowerCase();
  return duplicated === 'duplicado' || duplicated === 'duplicate' || duplicated === 'true' || duplicated === 'sim';
}

function isInoperationalRecord(fields) {
  const siteStatus = normalizeTextValue(fields?.['Site Status']).toLowerCase();
  const operationalStatus = normalizeTextValue(fields?.['Operational Status']).toLowerCase();
  return (
    siteStatus === 'inoperacional' ||
    siteStatus === 'não operacional' ||
    siteStatus === 'nao operacional' ||
    operationalStatus === 'não operacional' ||
    operationalStatus === 'nao operacional'
  );
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

  const hostname = getHostnameFromWebsiteUrl(getToolSite(tool));
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

export async function loadLocalToolsSnapshot() {
  if (!localSnapshotPromise) {
    localSnapshotPromise = fetchWithTimeout('/data/tools.json', { cache: 'force-cache' }, 2500)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Snapshot local indisponivel (${res.status})`);
        const json = await res.json();
        return (Array.isArray(json) ? json : []).map(mapMockToTool);
      })
      .catch(() => []);
  }

  return await localSnapshotPromise;
}

export function extractToolFromRecord(record) {
  const fields = record?.fields || {};
  const category = [
    ...normalizeArea(
      fields['Área/Categoria'] ??
        fields['Categoria'] ??
        fields['Área'] ??
        fields['Area/Categoria'] ??
        fields['Area'] ??
        fields['Category'] ??
        fields['Categoria sugerida (IA)'] ??
        null,
    ),
    ...normalizeArea(fields['Subcategory'] ?? null),
  ].filter((value, idx, arr) => value && arr.indexOf(value) === idx);

  const site =
    fields['Final URL'] ??
    fields['URL'] ??
    fields['Site'] ??
    '';

  const descricao =
    fields['Description PT'] ??
    fields['Descrição'] ??
    fields['Description EN'] ??
    fields['Short Description'] ??
    '';

  return {
    id: record?.id || fields?.id || fields?.ID || fields?.Id || '',
    ...fields,
    Nome: fields['Nome'] ?? fields['Name'] ?? '',
    Número: fields['Número'] ?? fields['Number'] ?? '',
    Site: site,
    Logo: fields['Logo'] ?? fields['LogoFinal'] ?? '',
    Preço: fields['Preço'] ?? fields['Pricing Model'] ?? '',
    'Descrição': descricao,
    // Normalize category so UI can always read tool['Área/Categoria'].
    'Área/Categoria': category,
    // Also expose as Categoria for components/features that expect this name.
    Categoria: fields['Categoria'] ?? (category.length ? category : []),
    Funções:
      fields['Funções'] && typeof fields['Funções'] === 'object'
        ? fields['Funções']
        : { value: fields['Funções'] || '' },
    Published: isPublishedRecord(fields),
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

export async function loadToolsPhased({ onChunk, initialPageSize = 40, recordStatus = 'eligible', filters = {} } = {}) {
  try {
    const normalizedRecordStatus = normalizeRecordStatus(recordStatus);
    const normalizedFilters = normalizeToolFilters(filters);
    const out = [];
    const publishedOut = [];
    const allRecordsOut = [];
    let offset = null;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const isFirstPage = !offset && out.length === 0;
      const pageSize = isFirstPage
        ? Math.max(10, Math.min(FIRST_PAGE_SIZE, Number(initialPageSize) || FIRST_PAGE_SIZE))
        : PAGE_SIZE;
      const page = await fetchAirtablePage({
        offset,
        pageSize,
        recordStatus: normalizedRecordStatus,
        filters: normalizedFilters,
      });
      const sourceRecords =
        normalizedRecordStatus === 'all'
          ? page.records
          : page.records.filter((record) => !isDuplicateRecord(record?.fields) && !isInoperationalRecord(record?.fields));
      const chunkAll = sourceRecords.map(extractToolFromRecord);
      const chunkPublished = sourceRecords
        .filter((record) => isPublishedRecord(record?.fields))
        .map(extractToolFromRecord);
      out.push(...chunkAll);
      publishedOut.push(...chunkPublished);
      allRecordsOut.push(...page.records.map(extractToolFromRecord));

      if (typeof onChunk === 'function') {
        onChunk(chunkAll, { done: !page.offset, total: out.length });
      }

      if (!page.offset) break;
      offset = page.offset;
    }

    if (normalizedRecordStatus === 'all' && out.length > 0) {
      return { tools: out, warning: '', source: 'airtable' };
    }

    if (normalizedRecordStatus === 'eligible' && out.length > 0) {
      return { tools: out, warning: '', source: 'airtable' };
    }

    if (publishedOut.length > 0) {
      return { tools: publishedOut, warning: '', source: 'airtable' };
    }

    if (out.length > 0) {
      return {
        tools: out,
        warning: hasToolFilters(normalizedFilters)
          ? 'Aviso: nenhum registo publicado correspondeu aos filtros no servidor. A mostrar registos elegíveis recebidos.'
          : 'Aviso: nenhum registo com Published ativo foi detetado. A mostrar todos os registos elegíveis recebidos.',
        source: 'airtable',
      };
    }

    if (normalizedRecordStatus === 'published') {
      const fallback = await loadToolsPhased({
        onChunk,
        initialPageSize,
        recordStatus: 'eligible',
        filters: normalizedFilters,
      });

      return {
        ...fallback,
        warning: fallback.tools?.length
          ? 'Aviso: nenhum registo com Published ativo foi detetado no Airtable. A mostrar registos elegíveis.'
          : fallback.warning,
      };
    }

    return {
      tools: allRecordsOut,
      warning: 'Aviso: filtros automáticos removeram todos os registos. A mostrar todos os registos recebidos.',
      source: 'airtable',
    };
  } catch (err) {
    const mapped = await loadLocalToolsSnapshot();

    if (typeof onChunk === 'function') {
      onChunk(mapped, { done: true, total: mapped.length, source: 'mock' });
    }

    return {
      tools: mapped,
      warning: isAuthFailureMessage(err?.message)
        ? ''
        : `Aviso: a fonte principal falhou (${err.message}). A mostrar mock local.`,
      source: 'mock',
    };
  }
}

export async function loadTools() {
  return await loadToolsPhased();
}
