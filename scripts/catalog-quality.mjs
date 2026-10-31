import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GENERIC_DESCRIPTION_PATTERNS = [
  /^ferramenta digital na categoria .+ pensada para apoiar tarefas e fluxos de trabalho\.?$/i,
  /^ferramenta digital para apoiar tarefas, produtividade e fluxos de trabalho\.?$/i,
  /^no description\.?$/i,
  /^sem descrição\.?$/i,
];

export const KNOWN_CATEGORY_ALIASES = new Set([
  'ai influencers', 'ai applications', 'aplicacoes de ia', 'assistente de escrita',
  'apoio ao cliente', 'automation', 'automacao', 'avaliacao', 'business',
  'chatbot integration', 'chatbots', 'comparacao', 'content detection', 'copywriting tools',
  'customer support', 'design', 'detecao de conteudo', 'directory', 'diretorio', 'education',
  'educacao', 'evaluation', 'finance', 'financas', 'guides', 'guias', 'image', 'imagem',
  'llm', 'llms', "llm's", 'machine learning', 'marketing', 'modelos de linguagem',
  'negocios', 'productivity', 'produtividade', 'prompts', 'redes sociais', 'research',
  'pesquisa', 'security', 'seguranca', 'seo', 'social media', 'social media management',
  'text', 'texto', 'textos chatgpt', 'video', 'writing assistant',
]);

function text(value) {
  return String(value ?? '').trim();
}

function normalizedText(value) {
  return text(value)
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function validWebsite(value) {
  try {
    const url = new URL(text(value));
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function canonicalWebsite(value) {
  try {
    const url = new URL(text(value));
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    return `${hostname}${pathname}`.toLowerCase();
  } catch {
    return '';
  }
}

function categories(fields) {
  const value = fields?.['Área/Categoria'];
  if (Array.isArray(value)) return value.map(text).filter(Boolean);
  return text(value) ? [text(value)] : [];
}

function descriptionIsGeneric(value) {
  const valueText = text(value);
  return GENERIC_DESCRIPTION_PATTERNS.some((pattern) => pattern.test(valueText));
}

function percentage(part, total) {
  return total ? Number(((part / total) * 100).toFixed(1)) : 0;
}

function samples(records, predicate, limit = 10) {
  return records.filter(predicate).slice(0, limit).map(({ id, fields }) => ({
    id: text(id),
    number: text(fields?.['Número']),
    name: text(fields?.Nome),
  }));
}

function duplicates(records, valueFor) {
  const byValue = new Map();
  for (const record of records) {
    const value = valueFor(record);
    if (!value) continue;
    const list = byValue.get(value) || [];
    list.push({ id: text(record.id), number: text(record.fields?.['Número']), name: text(record.fields?.Nome) });
    byValue.set(value, list);
  }
  return [...byValue.entries()]
    .filter(([, entries]) => entries.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20)
    .map(([value, entries]) => ({ value, count: entries.length, records: entries.slice(0, 10) }));
}

export function auditCatalogRecords(records = []) {
  const list = Array.isArray(records) ? records : [];
  const missingName = list.filter(({ fields }) => !text(fields?.Nome));
  const invalidUrl = list.filter(({ fields }) => !validWebsite(fields?.Site));
  const missingDescriptionPt = list.filter(({ fields }) => !text(fields?.['Descrição PT']));
  const missingDescriptionEn = list.filter(({ fields }) => !text(fields?.['Description EN']));
  const thinDescriptionPt = list.filter(({ fields }) => {
    const value = text(fields?.['Descrição PT']);
    return value && value.length < 60;
  });
  const genericDescriptionPt = list.filter(({ fields }) => descriptionIsGeneric(fields?.['Descrição PT']));
  const genericDescriptionEn = list.filter(({ fields }) => descriptionIsGeneric(fields?.['Description EN']));
  const missingFunctions = list.filter(({ fields }) => !text(fields?.['Funções']));
  const missingPrice = list.filter(({ fields }) => !text(fields?.['Preço']));
  const missingCategories = list.filter(({ fields }) => categories(fields).length === 0);
  const missingLogo = list.filter(({ fields }) => !text(fields?.Logo));
  const operationalUnknown = list.filter(({ fields }) => text(fields?.['Operational Status']).toLowerCase() === 'unknown');
  const allCategories = list.flatMap(({ fields }) => categories(fields));
  const categoryFrequency = new Map();
  for (const category of allCategories) {
    categoryFrequency.set(category, (categoryFrequency.get(category) || 0) + 1);
  }
  const unknownCategories = [...categoryFrequency.entries()]
    .filter(([category]) => !KNOWN_CATEGORY_ALIASES.has(normalizedText(category)))
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));
  const duplicateNames = duplicates(list, ({ fields }) => normalizedText(fields?.Nome));
  const duplicateWebsites = duplicates(list, ({ fields }) => canonicalWebsite(fields?.Site));

  const criticalIssueCount = missingName.length + invalidUrl.length + duplicateWebsites.length;
  const editorialIssueCount =
    missingDescriptionPt.length +
    thinDescriptionPt.length +
    genericDescriptionPt.length +
    missingCategories.length +
    missingPrice.length +
    operationalUnknown.length;

  return {
    recordCount: list.length,
    ready: criticalIssueCount === 0 && percentage(list.length - missingDescriptionPt.length, list.length) >= 90,
    criticalIssueCount,
    editorialIssueCount,
    coverage: {
      validName: percentage(list.length - missingName.length, list.length),
      validWebsite: percentage(list.length - invalidUrl.length, list.length),
      descriptionPt: percentage(list.length - missingDescriptionPt.length, list.length),
      descriptionEn: percentage(list.length - missingDescriptionEn.length, list.length),
      functions: percentage(list.length - missingFunctions.length, list.length),
      pricing: percentage(list.length - missingPrice.length, list.length),
      categories: percentage(list.length - missingCategories.length, list.length),
      sourceLogo: percentage(list.length - missingLogo.length, list.length),
      verifiedOperationalStatus: percentage(list.length - operationalUnknown.length, list.length),
    },
    counts: {
      missingName: missingName.length,
      invalidUrl: invalidUrl.length,
      missingDescriptionPt: missingDescriptionPt.length,
      missingDescriptionEn: missingDescriptionEn.length,
      thinDescriptionPt: thinDescriptionPt.length,
      genericDescriptionPt: genericDescriptionPt.length,
      genericDescriptionEn: genericDescriptionEn.length,
      missingFunctions: missingFunctions.length,
      missingPrice: missingPrice.length,
      missingCategories: missingCategories.length,
      missingLogo: missingLogo.length,
      operationalUnknown: operationalUnknown.length,
      duplicateNameGroups: duplicateNames.length,
      duplicateWebsiteGroups: duplicateWebsites.length,
      unknownCategoryCount: unknownCategories.length,
    },
    unknownCategories,
    duplicateNames,
    duplicateWebsites,
    samples: {
      missingName: samples(list, ({ fields }) => !text(fields?.Nome)),
      invalidUrl: samples(list, ({ fields }) => !validWebsite(fields?.Site)),
      missingDescriptionPt: samples(list, ({ fields }) => !text(fields?.['Descrição PT'])),
      missingCategories: samples(list, ({ fields }) => categories(fields).length === 0),
      operationalUnknown: samples(list, ({ fields }) => text(fields?.['Operational Status']).toLowerCase() === 'unknown'),
    },
  };
}

async function fetchPage(baseUrl, offset, timeoutMs) {
  const url = new URL('/v1/tools', baseUrl);
  url.searchParams.set('pageSize', '100');
  url.searchParams.set('status', 'published');
  if (offset) url.searchParams.set('offset', offset);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error(`catalog request failed with HTTP ${response.status}`);
    const envelope = await response.json();
    if (!Array.isArray(envelope?.data?.records)) throw new Error('catalog response is missing data.records');
    return { records: envelope.data.records, offset: text(envelope.data.offset) };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchCatalog(baseUrl, maxPages, timeoutMs) {
  const records = [];
  let offset = '';
  for (let page = 0; page < maxPages; page += 1) {
    const result = await fetchPage(baseUrl, offset, timeoutMs);
    records.push(...result.records);
    if (!result.offset) return records;
    offset = result.offset;
  }
  throw new Error(`catalog exceeded the configured maximum of ${maxPages} pages`);
}

function parseArguments(argv) {
  const options = {
    baseUrl: String(process.env.AQUA_CATALOG_BASE_URL || '').trim(),
    evidencePath: '',
    maxPages: 100,
    timeoutMs: 10_000,
    enforce: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === '--base-url' && value) {
      options.baseUrl = value;
      index += 1;
    } else if (argument === '--evidence' && value) {
      options.evidencePath = value;
      index += 1;
    } else if (argument === '--max-pages' && value) {
      options.maxPages = Number(value);
      index += 1;
    } else if (argument === '--timeout-ms' && value) {
      options.timeoutMs = Number(value);
      index += 1;
    } else if (argument === '--enforce') {
      options.enforce = true;
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }
  return options;
}

async function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
    if (!options.baseUrl) throw new Error('A catalog base URL is required.');
    if (!Number.isInteger(options.maxPages) || options.maxPages < 1 || options.maxPages > 200) {
      throw new Error('maxPages must be an integer between 1 and 200.');
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
    return;
  }

  const target = new URL(options.baseUrl);
  if (target.protocol !== 'https:' && !['localhost', '127.0.0.1', '::1'].includes(target.hostname)) {
    console.error('Catalog targets must use HTTPS outside local development.');
    process.exitCode = 2;
    return;
  }

  try {
    const records = await fetchCatalog(target, options.maxPages, options.timeoutMs);
    const report = {
      schemaVersion: 1,
      target: target.origin,
      checkedAt: new Date().toISOString(),
      ...auditCatalogRecords(records),
    };
    if (options.evidencePath) {
      const resolved = path.resolve(options.evidencePath);
      await fs.mkdir(path.dirname(resolved), { recursive: true });
      await fs.writeFile(resolved, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    }
    console.log(JSON.stringify(report, null, 2));
    if (options.enforce && !report.ready) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ event: 'catalog.quality.failed', error: String(error.message || error) }));
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) await main();
