import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PRO_FEATURES, STARTER_FEATURES, SUBSCRIPTION_PLAN } from '../src/lib/subscription.js';

const page = fs.readFileSync('src/pages/ProPage.jsx', 'utf8');

assert.equal(SUBSCRIPTION_PLAN.id, 'pro');
assert.equal(SUBSCRIPTION_PLAN.priceLabel, '€19/mês');
assert.equal(STARTER_FEATURES.length, 4);
assert.equal(PRO_FEATURES.length, 4);

for (const promise of [
  'Criar uma shortlist pessoal com favoritas',
  'Retomar ferramentas através do histórico',
  'Registar uma avaliação pessoal por estrelas',
  'Rever decisões num único lugar',
]) {
  assert.ok(PRO_FEATURES.includes(promise), `missing truthful Pro benefit: ${promise}`);
}

assert.match(page, /Transforma descoberta em decisões/);
assert.match(page, /Cobrança transparente/);
assert.match(page, /Creator e Business são serviços/);
assert.ok(!page.includes('O que fica bloqueado'), 'comparison must use positive decision framing');
assert.ok(!page.includes('Cancela quando quiseres'), 'do not promise self-service cancellation while the portal is suspended');

console.log('Pro value smoke tests passed');
