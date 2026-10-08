import assert from 'node:assert/strict';
import { evaluateAuditReport } from './security-audit.mjs';

const policy = {
  schemaVersion: 1,
  threshold: 'moderate',
  exceptions: [{
    advisorySource: 1124282,
    packages: ['react-router', 'react-router-dom'],
    maximumSeverity: 'high',
    expiresAt: '2026-08-31T23:59:59Z',
    conditions: {
      applicationMode: 'browser-spa',
      forbiddenSourcePatterns: ['react-router/rsc'],
    },
  }],
};
const report = {
  vulnerabilities: {
    'react-router': {
      severity: 'high',
      via: [{ source: 1124282, severity: 'high' }],
    },
    'react-router-dom': {
      severity: 'high',
      via: ['react-router'],
    },
  },
};

const accepted = evaluateAuditReport(report, policy, {
  now: new Date('2026-07-29T00:00:00Z'),
  sources: [{ content: "import { BrowserRouter } from 'react-router-dom';" }],
});
assert.equal(accepted.ok, true);
assert.deepEqual(accepted.accepted, ['react-router', 'react-router-dom']);

const unknown = structuredClone(report);
unknown.vulnerabilities.vite = {
  severity: 'high',
  via: [{ source: 9999999, severity: 'high' }],
};
assert.equal(evaluateAuditReport(unknown, policy, {
  now: new Date('2026-07-29T00:00:00Z'),
}).ok, false);

assert.equal(evaluateAuditReport(report, policy, {
  now: new Date('2026-09-01T00:00:00Z'),
}).ok, false);

assert.equal(evaluateAuditReport(report, policy, {
  now: new Date('2026-07-29T00:00:00Z'),
  sources: [{ content: "import 'react-router/rsc';" }],
}).ok, false);

console.log('Security audit smoke tests passed');
