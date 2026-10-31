import assert from 'node:assert/strict';
import fs from 'node:fs';

const nav = fs.readFileSync('src/components/TopNav.jsx', 'utf8');
const styles = fs.readFileSync('src/brand-system.css', 'utf8');

for (const contract of [
  'PRIMARY_NAV_ITEMS',
  'SECONDARY_NAV_ITEMS',
  'aria-expanded={moreMenuOpen}',
  'aria-controls={moreMenuId}',
  'moreMenuButtonRef.current?.focus()',
  "document.addEventListener('pointerdown'",
  "event.key === 'Escape'",
  "isEn ? 'More' : 'Mais'",
]) {
  assert.ok(nav.includes(contract), `missing navigation contract: ${contract}`);
}

for (const destination of ['/visitadas', '/favoritas', '/reviews', '/submeter', '/sugestoes', '/definicoes']) {
  assert.ok(nav.includes(destination), `secondary destination missing: ${destination}`);
}

for (const rule of [
  '.topnav__moreMenu',
  '.topnav__more.is-open .topnav__moreMenu',
  '.topnav__moreButton',
  'display: contents',
]) {
  assert.ok(styles.includes(rule), `missing navigation style: ${rule}`);
}

console.log('Navigation hierarchy smoke tests passed');
