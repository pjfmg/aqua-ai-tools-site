import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  getToolOperationalStatus,
  getToolSlug,
  parseToolSlug,
} from '../src/lib/tools.js';
import { getRouteSeo } from '../src/lib/seo.js';

const tool = {
  id: 'tool-42',
  Nome: 'ÁQUA Research / Pro',
  Número: '42',
  'Operational Status': 'operational',
};
const slug = getToolSlug(tool);
assert.equal(slug, '42--aqua-research-pro');
assert.deepEqual(parseToolSlug(slug), {
  slug,
  identifier: '42',
  number: '42',
  nameQuery: 'aqua research pro',
});
assert.equal(getToolOperationalStatus(tool), 'operational');
assert.equal(getToolOperationalStatus({ 'Operational Status': 'unknown' }), '');

const ptSeo = getRouteSeo(`/ferramentas/${slug}`);
assert.match(ptSeo.title, /Detalhes da ferramenta de IA/);
assert.equal(ptSeo.robots, 'noindex, follow');
const enSeo = getRouteSeo(`/en/tools/${slug}`);
assert.match(enSeo.title, /AI tool details/);
assert.equal(enSeo.lang, 'en');
assert.equal(enSeo.robots, 'noindex, follow');

const app = fs.readFileSync('src/App.jsx', 'utf8');
assert.ok(app.includes('path="/ferramentas/:toolSlug"'));
assert.ok(app.includes('path="/en/tools/:toolSlug"'));

const i18n = fs.readFileSync('src/i18n.jsx', 'utf8');
assert.ok(i18n.includes("pathOnly.startsWith('/ferramentas/')"));
assert.ok(i18n.includes("pathOnly.startsWith('/en/tools/')"));

const card = fs.readFileSync('src/components/ToolCard.jsx', 'utf8');
assert.ok(card.includes("path(`/ferramentas/${getToolSlug(tool)}`)"));
assert.ok(card.includes("{isEn ? 'Details' : 'Detalhes'}"));

const homepage = fs.readFileSync('src/pages/HomePage.jsx', 'utf8');
assert.ok(homepage.includes('getToolSlug(tool)'));
assert.ok(homepage.includes('areaKey='));

const directory = fs.readFileSync('src/pages/ToolsPage.jsx', 'utf8');
assert.ok(directory.includes("params.get('areaKey')"));
assert.ok(directory.includes('filterAreaKey || filterArea'));

const detail = fs.readFileSync('src/pages/ToolDetailPage.jsx', 'utf8');
for (const token of [
  'Informação disponível',
  'Descrição editorial em revisão.',
  'Não verificado',
  'não publica prós, contras, preços ou datas de verificação inventados',
  'Alternativas relacionadas',
  "'SoftwareApplication'",
]) {
  assert.ok(detail.includes(token), `tool detail page missing: ${token}`);
}
assert.ok(detail.includes("setAttribute('content', 'noindex, follow')"));

const adStrip = fs.readFileSync('src/components/AdStrip.jsx', 'utf8');
assert.ok(adStrip.includes("if (!isMonetizableRoute) return null"));

console.log(JSON.stringify({
  event: 'tool.detail.smoke.completed',
  slug,
  routesChecked: 2,
  truthfulFallbacksChecked: 4,
}));
