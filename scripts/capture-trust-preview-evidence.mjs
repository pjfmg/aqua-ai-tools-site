import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const STORAGE_KEY = 'aqua_consent_v1';
const RETENTION_MS = 180 * 24 * 60 * 60 * 1_000;
const PROVIDERS = {
  analytics: /googletagmanager\.com\/gtag|clarity\.ms\/tag/,
  advertising: /pagead2\.googlesyndication\.com\/pagead/,
  cmp: /fundingchoicesmessages\.google\.com/,
};

function parseArguments(argv) {
  const options = { baseUrl: '', output: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === '--base-url' && value) {
      options.baseUrl = new URL(value).toString().replace(/\/+$/, '');
      index += 1;
    } else if (argument === '--output' && value) {
      options.output = path.resolve(value);
      index += 1;
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }
  if (!options.baseUrl || !options.output) {
    throw new Error('Both --base-url and --output are required.');
  }
  if (new URL(options.baseUrl).protocol !== 'https:') {
    throw new Error('Preview evidence must be collected over HTTPS.');
  }
  return options;
}

function consentChoice({
  analytics = false,
  advertising = false,
  decidedAt = new Date().toISOString(),
  policyVersion = 1,
} = {}) {
  return {
    schemaVersion: 1,
    policyId: 'aqua-web-consent-v1',
    policyVersion,
    decidedAt,
    categories: { analytics, advertising },
    privacySignals: {
      globalPrivacyControl: false,
      doNotTrack: false,
    },
  };
}

function classifyProvider(url) {
  return Object.entries(PROVIDERS).find(([, pattern]) => pattern.test(url))?.[0] || null;
}

async function createScenario(browser, baseUrl, {
  choice,
  globalPrivacyControl = false,
  doNotTrack = false,
} = {}) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests = [];

  await page.route('**/*', async (route) => {
    const provider = classifyProvider(route.request().url());
    if (!provider) {
      await route.continue();
      return;
    }
    requests.push(provider);
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: '',
    });
  });

  await page.addInitScript((configuration) => {
    Object.defineProperty(navigator, 'globalPrivacyControl', {
      configurable: true,
      value: configuration.globalPrivacyControl,
    });
    Object.defineProperty(navigator, 'doNotTrack', {
      configurable: true,
      value: configuration.doNotTrack ? '1' : '0',
    });
    if (configuration.choice) {
      localStorage.setItem(configuration.storageKey, JSON.stringify(configuration.choice));
    }
  }, {
    choice,
    globalPrivacyControl,
    doNotTrack,
    storageKey: STORAGE_KEY,
  });

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  return { context, page, requests };
}

async function providerCounts(page) {
  return {
    analytics: await page.locator(
      'script[src*="googletagmanager.com/gtag"], script[src*="clarity.ms/tag"]',
    ).count(),
    advertising: await page.locator(
      'script[src*="pagead2.googlesyndication.com/pagead"]',
    ).count(),
    cmp: await page.locator(
      'script[src*="fundingchoicesmessages.google.com"]',
    ).count(),
  };
}

async function storedChoice(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), STORAGE_KEY);
}

async function diagnostics(page) {
  return page.evaluate(() => ({
    cmpStatus: window.__aquaCmpBootstrap?.status || 'not-observed',
    cmpReason: window.__aquaCmpBootstrap?.reason || 'not-observed',
    tcfApiType: typeof window.__tcfapi,
    advertisingDecision: window.__aquaTrustDiagnostics?.advertising?.decision || 'not-observed',
    advertisingReasons: window.__aquaTrustDiagnostics?.advertising?.reasons || [],
  }));
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const browser = await chromium.launch({ headless: true });
  const scenarios = {};

  try {
    const firstVisit = await createScenario(browser, options.baseUrl);
    await firstVisit.page.getByRole('region', { name: 'As tuas escolhas de privacidade' }).waitFor();
    const firstCounts = await providerCounts(firstVisit.page);
    const firstDiagnostics = await diagnostics(firstVisit.page);
    scenarios.firstVisit = {
      bannerVisible: true,
      providerRequests: {
        analytics: firstVisit.requests.filter((provider) => provider === 'analytics').length,
        advertising: firstVisit.requests.filter((provider) => provider === 'advertising').length,
        cmp: firstVisit.requests.filter((provider) => provider === 'cmp').length,
      },
      providerScripts: firstCounts,
      cmpStatus: firstDiagnostics.cmpStatus,
      cmpReason: firstDiagnostics.cmpReason,
      advertisingDecision: firstDiagnostics.advertisingDecision,
      advertisingReasons: firstDiagnostics.advertisingReasons,
    };
    const browserEvidence = {
      tcfApiType: firstDiagnostics.tcfApiType,
      cmpStatus: firstDiagnostics.cmpStatus,
      tcStringStatus: 'absent',
      eventStatus: 'not-observed',
      adScriptsBeforeChoice: firstCounts.advertising,
      analyticsScriptsBeforeChoice: firstCounts.analytics,
    };
    await firstVisit.context.close();

    const rejected = await createScenario(browser, options.baseUrl);
    await rejected.page.getByRole('button', { name: 'Recusar cookies opcionais' }).click();
    scenarios.rejectOptional = {
      categories: (await storedChoice(rejected.page))?.categories || null,
      providerScripts: await providerCounts(rejected.page),
    };
    await rejected.context.close();

    const accepted = await createScenario(browser, options.baseUrl);
    await accepted.page.getByRole('button', { name: 'Aceitar todos os cookies' }).click();
    await accepted.page.locator('script[src*="googletagmanager.com/gtag"]').waitFor({
      state: 'attached',
    });
    scenarios.acceptAllSafePreview = {
      categories: (await storedChoice(accepted.page))?.categories || null,
      providerScripts: await providerCounts(accepted.page),
      diagnostics: await diagnostics(accepted.page),
    };

    await accepted.page.goto(`${options.baseUrl}/privacidade`, { waitUntil: 'domcontentloaded' });
    await accepted.page.getByRole('button', { name: 'Abrir definições de privacidade' }).click();
    await accepted.page.getByRole('button', { name: 'Retirar consentimento' }).click();
    const revokedChoice = await storedChoice(accepted.page);
    scenarios.withdrawal = {
      revokedAtStatus: revokedChoice?.revokedAt ? 'present' : 'missing',
      providerScripts: await providerCounts(accepted.page),
    };
    await accepted.context.close();

    const expired = await createScenario(browser, options.baseUrl, {
      choice: consentChoice({
        analytics: true,
        decidedAt: new Date(Date.now() - RETENTION_MS - 60_000).toISOString(),
      }),
    });
    await expired.page.getByText(
      'A tua escolha anterior expirou após 180 dias. Escolhe novamente.',
    ).first().waitFor();
    scenarios.expiredChoice = {
      renewalPromptVisible: true,
      providerScripts: await providerCounts(expired.page),
    };
    await expired.context.close();

    const policyChanged = await createScenario(browser, options.baseUrl, {
      choice: consentChoice({ analytics: true, advertising: true, policyVersion: 2 }),
    });
    await policyChanged.page.getByText(
      'A política de consentimento mudou. Revê e renova a tua escolha.',
    ).first().waitFor();
    scenarios.policyChange = {
      renewalPromptVisible: true,
      providerScripts: await providerCounts(policyChanged.page),
    };
    await policyChanged.context.close();

    for (const [name, privacyConfiguration] of [
      ['gpc', { globalPrivacyControl: true }],
      ['dnt', { doNotTrack: true }],
    ]) {
      const privacySignal = await createScenario(browser, options.baseUrl, privacyConfiguration);
      await privacySignal.page.getByRole('button', { name: 'Aceitar todos os cookies' }).click();
      await privacySignal.page.locator('script[src*="googletagmanager.com/gtag"]').waitFor({
        state: 'attached',
      });
      const signalDiagnostics = await diagnostics(privacySignal.page);
      scenarios[name] = {
        categories: (await storedChoice(privacySignal.page))?.categories || null,
        providerScripts: await providerCounts(privacySignal.page),
        advertisingDecision: signalDiagnostics.advertisingDecision,
        privacySignalReasonObserved:
          signalDiagnostics.advertisingReasons.includes('privacy.signal-active'),
      };
      await privacySignal.context.close();
    }

    const evidence = {
      schemaVersion: 1,
      target: options.baseUrl,
      checkedAt: new Date().toISOString(),
      handling: {
        thirdPartyRequestsIntercepted: true,
        rawTcfStringStored: false,
        personalDataStored: false,
      },
      browserEvidence,
      scenarios,
    };
    await fs.mkdir(path.dirname(options.output), { recursive: true });
    await fs.writeFile(options.output, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(evidence, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});
