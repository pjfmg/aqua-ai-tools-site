import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  buildAirtableDirectoryFormula,
  buildAirtableStatusFormula,
  normalizeAirtableStatus,
} from '../airtableFilters.mjs';

function assertContains(value, expected, label) {
  assert.ok(String(value).includes(expected), `${label} should include ${expected}`);
}

assert.equal(normalizeAirtableStatus('published'), 'published');
assert.equal(normalizeAirtableStatus('eligible'), 'eligible');
assert.equal(normalizeAirtableStatus('all'), 'all');
assert.equal(normalizeAirtableStatus('bad-value'), 'published');

const publishedFormula = buildAirtableStatusFormula('published');
assertContains(publishedFormula, '{Published}=TRUE()', 'published formula');
assertContains(publishedFormula, '{Duplicated}', 'published formula');
assertContains(publishedFormula, '{Site Status}', 'published formula');
assertContains(publishedFormula, '{Operational Status}', 'published formula');

const eligibleFormula = buildAirtableStatusFormula('eligible');
assert.ok(!eligibleFormula.includes('{Published}=TRUE()'), 'eligible formula should not require Published');
assertContains(eligibleFormula, '{Duplicated}', 'eligible formula');

assert.equal(buildAirtableStatusFormula('all'), '');

const filteredFormula = buildAirtableDirectoryFormula({
  status: 'published',
  q: "chat's",
  number: '42',
  area: 'Texto',
  price: 'Freemium',
});
assertContains(filteredFormula, '{Published}=TRUE()', 'filtered formula');
assertContains(filteredFormula, "SEARCH('chat\\'s'", 'filtered formula');
assertContains(filteredFormula, "{Número}&''='42'", 'filtered formula');
assertContains(filteredFormula, 'ARRAYJOIN({Área/Categoria}', 'filtered formula');
assertContains(filteredFormula, "LOWER({Preço}&'')='freemium'", 'filtered formula');

const indexHtml = fs.readFileSync('index.html', 'utf8');
assertContains(indexHtml, 'google-adsense-account', 'index.html');
assertContains(indexHtml, 'ca-pub-8295677733502537', 'index.html');

const adsTxt = fs.readFileSync('public/ads.txt', 'utf8');
assertContains(adsTxt, 'google.com, pub-8295677733502537, DIRECT', 'ads.txt');

console.log('Smoke tests passed');
