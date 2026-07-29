import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateTrustPlatformReadiness } from './trust-platform-readiness.mjs';

function zeroProviders(value) {
  return ['analytics', 'advertising', 'cmp'].every((key) => value?.[key] === 0);
}

function falseCategories(value) {
  return value?.analytics === false && value?.advertising === false;
}

export function evaluateDefaultDenyBrowserEvidence(evidence) {
  const errors = [];
  const browser = evidence?.browserEvidence;
  const scenarios = evidence?.scenarios;
  if (!evidence?.handling?.thirdPartyRequestsIntercepted) {
    errors.push('third-party requests were not safely intercepted');
  }
  if (evidence?.handling?.rawTcfStringStored !== false) {
    errors.push('raw TCF data handling is not minimized');
  }
  if (evidence?.handling?.personalDataStored !== false) {
    errors.push('browser evidence may contain personal data');
  }
  if (browser?.adScriptsBeforeChoice !== 0) {
    errors.push('advertising loaded before a choice');
  }
  if (browser?.analyticsScriptsBeforeChoice !== 0) {
    errors.push('analytics loaded before a choice');
  }
  if (!scenarios?.firstVisit?.bannerVisible) errors.push('first-visit consent banner was not observed');
  if (!zeroProviders(scenarios?.firstVisit?.providerRequests)) {
    errors.push('an optional provider was requested before a choice');
  }
  if (!zeroProviders(scenarios?.firstVisit?.providerScripts)) {
    errors.push('an optional provider script existed before a choice');
  }
  if (scenarios?.firstVisit?.advertisingDecision !== 'deny') {
    errors.push('first-visit advertising decision was not deny');
  }
  if (!falseCategories(scenarios?.rejectOptional?.categories)) {
    errors.push('reject optional did not persist a fully denied choice');
  }
  if (!zeroProviders(scenarios?.rejectOptional?.providerScripts)) {
    errors.push('an optional provider remained after rejection');
  }
  if (scenarios?.acceptAllSafePreview?.categories?.advertising !== false) {
    errors.push('safe Preview accepted advertising');
  }
  if (scenarios?.acceptAllSafePreview?.providerScripts?.advertising !== 0) {
    errors.push('advertising script loaded in safe Preview');
  }
  if (scenarios?.withdrawal?.revokedAtStatus !== 'present') {
    errors.push('withdrawal evidence is missing revokedAt');
  }
  if (!zeroProviders(scenarios?.withdrawal?.providerScripts)) {
    errors.push('an optional provider remained after withdrawal');
  }
  for (const [name, scenario] of [
    ['expired choice', scenarios?.expiredChoice],
    ['policy change', scenarios?.policyChange],
  ]) {
    if (!scenario?.renewalPromptVisible) errors.push(`${name} did not require renewal`);
    if (!zeroProviders(scenario?.providerScripts)) {
      errors.push(`an optional provider loaded during ${name}`);
    }
  }
  for (const [name, scenario] of [
    ['GPC', scenarios?.gpc],
    ['DNT', scenarios?.dnt],
  ]) {
    if (scenario?.categories?.advertising !== false) {
      errors.push(`${name} did not persist advertising denied`);
    }
    if (scenario?.providerScripts?.advertising !== 0) {
      errors.push(`${name} allowed an advertising script`);
    }
    if (scenario?.advertisingDecision !== 'deny' || !scenario?.privacySignalReasonObserved) {
      errors.push(`${name} denial evidence is incomplete`);
    }
  }
  return errors;
}

export async function evaluateDefaultDenyCanary({
  baseUrl,
  browserEvidence,
  fetchImpl = fetch,
} = {}) {
  const platform = await evaluateTrustPlatformReadiness({
    baseUrl,
    browserEvidence: browserEvidence?.browserEvidence,
    fetchImpl,
  });
  const checks = platform.checks
    .filter((check) => check.name !== 'cmp-and-tcf-browser-evidence');
  const browserErrors = evaluateDefaultDenyBrowserEvidence(browserEvidence);
  checks.push({
    name: 'default-deny-browser-scenarios',
    ok: browserErrors.length === 0,
    errors: browserErrors,
  });
  return {
    schemaVersion: 1,
    mode: 'default-deny',
    target: platform.target,
    checkedAt: new Date().toISOString(),
    ok: checks.length === 5 && checks.every((check) => check.ok),
    checks,
  };
}

function parseArguments(argv) {
  const options = { baseUrl: '', browserEvidencePath: '', evidencePath: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === '--base-url' && value) options.baseUrl = value;
    else if (argument === '--browser-evidence' && value) options.browserEvidencePath = value;
    else if (argument === '--evidence' && value) options.evidencePath = value;
    else throw new Error(`Unknown or incomplete argument: ${argument}`);
    index += 1;
  }
  if (!options.baseUrl || !options.browserEvidencePath || !options.evidencePath) {
    throw new Error('--base-url, --browser-evidence and --evidence are required.');
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const browserEvidence = JSON.parse(
    await fs.readFile(path.resolve(options.browserEvidencePath), 'utf8'),
  );
  const evidence = await evaluateDefaultDenyCanary({
    baseUrl: options.baseUrl,
    browserEvidence,
  });
  const target = path.resolve(options.evidencePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(evidence, null, 2));
  if (!evidence.ok) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error?.message || String(error));
    process.exitCode = 2;
  });
}
