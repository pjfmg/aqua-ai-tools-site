import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pickNextRandomIndex } from '../src/lib/surprise.js';

assert.equal(pickNextRandomIndex(0, -1, () => 0.5), -1);
assert.equal(pickNextRandomIndex(1, 0, () => 0.5), 0);
assert.equal(pickNextRandomIndex(3, 0, () => 0), 1);
assert.equal(pickNextRandomIndex(3, 1, () => 0), 0);
assert.equal(pickNextRandomIndex(3, 1, () => 0.999), 2);
assert.equal(pickNextRandomIndex(3, -1, () => 0.999), 2);

for (let previous = 0; previous < 8; previous += 1) {
  const next = pickNextRandomIndex(8, previous, () => previous / 8);
  assert.notEqual(next, previous, 'another discovery must not immediately repeat when alternatives exist');
}

const page = fs.readFileSync('src/pages/SurpreendeMePage.jsx', 'utf8');
assert.match(page, /Não foi possível escolher uma ferramenta agora/);
assert.match(page, /We could not choose a tool right now/);
assert.match(page, /onClick=\{refresh\}/);
assert.match(page, /Explorar ferramentas/);
assert.match(page, /Mostrar outra ferramenta/);
assert.ok(!page.includes('{error}</p>'), 'internal catalogue error codes must not be rendered');
assert.ok(!page.includes('Sem dados.'), 'empty states must explain the available recovery');

console.log('Surprise resilience smoke tests passed');
