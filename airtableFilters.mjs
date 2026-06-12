const DUPLICATE_VALUES = ['duplicado', 'duplicate', 'true', 'sim'];
const INOPERABLE_VALUES = ['inoperacional', 'não operacional', 'nao operacional'];

function escapeFormulaString(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function blankOrNotIn(field, values) {
  const normalized = `LOWER({${field}}&'')`;
  return `NOT(OR(${values.map((value) => `${normalized}='${value}'`).join(',')}))`;
}

export function buildAirtableStatusFormula(status) {
  const mode = String(status || 'published').trim().toLowerCase();
  if (mode === 'all') return '';

  const eligibleFormula = `AND(${blankOrNotIn('Duplicated', DUPLICATE_VALUES)},${blankOrNotIn('Site Status', INOPERABLE_VALUES)},${blankOrNotIn('Operational Status', INOPERABLE_VALUES)})`;
  if (mode === 'eligible') return eligibleFormula;

  return `AND({Published}=TRUE(),${eligibleFormula})`;
}

export function normalizeAirtableStatus(value) {
  const mode = String(value || 'published').trim().toLowerCase();
  return ['published', 'eligible', 'all'].includes(mode) ? mode : 'published';
}

export function buildAirtableDirectoryFormula({ status = 'published', q = '', number = '', area = '', price = '' } = {}) {
  const parts = [];
  const statusFormula = buildAirtableStatusFormula(status);
  if (statusFormula) parts.push(statusFormula);

  const query = String(q || '').trim().toLowerCase();
  if (query) {
    const safeQuery = escapeFormulaString(query);
    parts.push(
      `OR(SEARCH('${safeQuery}',LOWER({Nome}&'')),SEARCH('${safeQuery}',LOWER({Site}&'')),SEARCH('${safeQuery}',LOWER({Descrição}&'')),SEARCH('${safeQuery}',LOWER({Funções}&'')))`,
    );
  }

  const normalizedNumber = String(number || '').trim();
  if (normalizedNumber) {
    parts.push(`{Número}&''='${escapeFormulaString(normalizedNumber)}'`);
  }

  const normalizedArea = String(area || '').trim().toLowerCase();
  if (normalizedArea) {
    parts.push(`SEARCH('${escapeFormulaString(normalizedArea)}',LOWER(ARRAYJOIN({Área/Categoria},',')))`);
  }

  const normalizedPrice = String(price || '').trim().toLowerCase();
  if (normalizedPrice) {
    parts.push(`LOWER({Preço}&'')='${escapeFormulaString(normalizedPrice)}'`);
  }

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `AND(${parts.join(',')})`;
}
