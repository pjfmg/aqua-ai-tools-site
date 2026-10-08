export const CATALOG_EVIDENCE = Object.freeze({
  publishedRecords: 4344,
  auditedOn: '2026-07-24',
  operationalStatus: 'in_review',
});

export function formatPublishedRecords(locale = 'pt-PT') {
  return new Intl.NumberFormat(locale).format(CATALOG_EVIDENCE.publishedRecords);
}
