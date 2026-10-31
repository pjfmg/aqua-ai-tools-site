import assert from 'node:assert/strict';
import { auditCatalogRecords } from './catalog-quality.mjs';
import {
  dedupeTools,
  getToolCanonicalWebsiteKey,
  getToolDescription,
  localizeCategory,
} from '../src/lib/tools.js';

const healthy = auditCatalogRecords([
  {
    id: 'tool-1',
    fields: {
      Número: '1',
      Nome: 'AQUA',
      Site: 'https://example.com/tool',
      'Descrição PT': 'Uma descrição editorial suficientemente detalhada para explicar claramente o valor da ferramenta.',
      'Description EN': 'A sufficiently detailed editorial description explaining the value of the tool.',
      Funções: 'Pesquisa e comparação',
      Preço: 'Gratuito',
      'Área/Categoria': ['Produtividade'],
      Logo: 'https://example.com/logo.png',
      'Operational Status': 'operational',
    },
  },
]);
assert.equal(healthy.ready, true);
assert.equal(healthy.coverage.descriptionPt, 100);
assert.equal(healthy.counts.invalidUrl, 0);

const poor = auditCatalogRecords([
  {
    id: 'tool-1',
    fields: {
      Número: '1',
      Nome: 'Duplicada',
      Site: 'not-a-url',
      'Descrição PT': '',
      'Description EN': '',
      'Área/Categoria': ['Unknown taxonomy'],
      'Operational Status': 'unknown',
    },
  },
  {
    id: 'tool-2',
    fields: {
      Número: '2',
      Nome: 'Duplicada',
      Site: 'https://example.com/path/',
      'Descrição PT': 'Ferramenta digital para apoiar tarefas, produtividade e fluxos de trabalho.',
      'Description EN': '',
      'Área/Categoria': [],
      'Operational Status': 'unknown',
    },
  },
]);
assert.equal(poor.ready, false);
assert.equal(poor.counts.invalidUrl, 1);
assert.equal(poor.counts.duplicateNameGroups, 1);
assert.equal(poor.counts.genericDescriptionPt, 1);
assert.deepEqual(poor.unknownCategories, [{ category: 'Unknown taxonomy', count: 1 }]);
assert.equal(localizeCategory('Chatbot Integration', 'pt'), 'Chatbots');
assert.equal(localizeCategory("LLM's", 'pt'), 'Modelos de linguagem');
assert.equal(localizeCategory('Produtividade', 'en'), 'Productivity');
assert.equal(getToolDescription({ 'Description EN': 'A useful AI assistant for teams.' }, 'pt'), '');
assert.equal(getToolDescription({ 'Descrição PT': 'Ajuda equipas a organizar projetos com clareza.' }, 'pt'), 'Ajuda equipas a organizar projetos com clareza.');
assert.equal(getToolCanonicalWebsiteKey({ Site: 'https://www.example.com/path/?campaign=1' }), 'example.com/path');
assert.deepEqual(
  dedupeTools([
    { id: 'first', Site: 'https://www.example.com/path/' },
    { id: 'second', Site: 'https://example.com/path?ref=aqua' },
    { id: 'third', Site: 'https://example.com/other' },
  ]).map((tool) => tool.id),
  ['first', 'third'],
);

console.log('Catalog quality smoke tests passed');
