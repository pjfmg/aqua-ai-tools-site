import assert from 'node:assert/strict';
import fs from 'node:fs';

const home = fs.readFileSync('src/pages/HomePage.jsx', 'utf8');
const hero = fs.readFileSync('src/components/Hero.jsx', 'utf8');
const section = fs.readFileSync('src/components/Section.jsx', 'utf8');
const styles = fs.readFileSync('src/styles.css', 'utf8');

assert.match(home, /className="hero--home"/);
assert.match(home, /className="homeCategories"/);
assert.match(hero, /className = ''/);
assert.match(section, /className = ''/);

for (const rule of [
  '.hero--home .heroQuick__rail',
  'grid-auto-flow: column',
  'scroll-snap-type: inline mandatory',
  'grid-auto-columns: minmax(238px, 78vw)',
  '.hero--home > *',
  'min-width: 0',
  '.homeCategories .categoryGrid',
  'grid-template-columns: repeat(2, minmax(0, 1fr))',
]) {
  assert.ok(styles.includes(rule), `missing mobile homepage rule: ${rule}`);
}

assert.ok(!styles.includes('.hero--home .heroQuickCard:nth-child'), 'mobile compaction must not hide featured tools');

console.log('Mobile homepage smoke tests passed');
