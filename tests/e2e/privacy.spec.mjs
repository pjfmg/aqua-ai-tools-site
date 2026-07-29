import { expect, test } from '@playwright/test';

const CONSENT_STORAGE_KEY = 'aqua_consent_v1';
const RETENTION_MS = 180 * 24 * 60 * 60 * 1_000;
const PROVIDER_URL = /googletagmanager\.com\/gtag|clarity\.ms\/tag|pagead2\.googlesyndication\.com\/pagead/;

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

async function preparePage(page, {
  cmp = 'ready',
  choice,
  globalPrivacyControl = false,
  doNotTrack = false,
} = {}) {
  const providerRequests = [];
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    const parsedUrl = new URL(url);
    if (
      parsedUrl.origin === 'http://127.0.0.1:4173'
      && parsedUrl.pathname === '/v1/tools'
    ) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { records: [], nextCursor: null },
          meta: { traceId: 'trace-privacy-e2e' },
          errors: [],
        }),
      });
      return;
    }
    if (PROVIDER_URL.test(url)) {
      providerRequests.push(url);
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: '',
      });
      return;
    }
    await route.continue();
  });

  await page.addInitScript((configuration) => {
    window.__aquaTrustDecisionEvents = [];
    window.addEventListener('aqua:trust-decision', (event) => {
      window.__aquaTrustDecisionEvents.push(event.detail);
    });

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

    if (configuration.cmp !== 'missing') {
      window.__tcfapi = (command, version, callback, listenerId) => {
        if (command === 'addEventListener') {
          const ready = configuration.cmp === 'ready';
          callback({
            listenerId: 1,
            eventStatus: ready ? 'tcloaded' : 'cmpuishown',
            tcString: ready ? 'e2e-redacted-proof' : '',
          }, true);
        } else if (command === 'removeEventListener') {
          callback(true, true, listenerId);
        }
      };
    }
  }, {
    choice,
    cmp,
    globalPrivacyControl,
    doNotTrack,
    storageKey: CONSENT_STORAGE_KEY,
  });

  return providerRequests;
}

async function storedChoice(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), CONSENT_STORAGE_KEY);
}

async function providerScriptCount(page, fragment) {
  return page.locator(`script[src*="${fragment}"]`).count();
}

test('first visit loads no optional provider before a choice', async ({ page }) => {
  const requests = await preparePage(page);
  await page.goto('/');

  await expect(page.getByRole('region', { name: 'As tuas escolhas de privacidade' })).toBeVisible();
  expect(requests).toEqual([]);
  expect(await providerScriptCount(page, 'googletagmanager.com/gtag')).toBe(0);
  expect(await providerScriptCount(page, 'clarity.ms/tag')).toBe(0);
  expect(await providerScriptCount(page, 'pagead2.googlesyndication.com/pagead')).toBe(0);
  expect(await providerScriptCount(page, 'fundingchoicesmessages.google.com')).toBe(0);
  await expect.poll(() => page.evaluate(() => window.__aquaCmpBootstrap?.reason)).toBe('cmp.bootstrap-disabled');
});

test('decision audit events are minimized and contain no consent or TCF payload', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');

  await expect.poll(() => page.evaluate(
    () => window.__aquaTrustDecisionEvents.length,
  )).toBeGreaterThanOrEqual(2);

  const auditEvents = await page.evaluate(() => window.__aquaTrustDecisionEvents);
  const expectedKeys = [
    'action',
    'event',
    'mode',
    'occurredAt',
    'policyId',
    'policyVersion',
    'productId',
    'reasonCodes',
    'result',
    'schemaVersion',
    'surfaceId',
  ];
  for (const event of auditEvents) {
    expect(Object.keys(event).sort()).toEqual(expectedKeys);
    expect(JSON.stringify(event)).not.toMatch(/email|ipAddress|content|tcString|decidedAt/i);
  }
  expect(new Set(auditEvents.map((event) => event.action))).toEqual(
    new Set(['bootstrap-consent', 'request-ad']),
  );
});

test('rejecting optional storage persists a denied choice without providers', async ({ page }) => {
  const requests = await preparePage(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Recusar cookies opcionais' }).click();

  await expect(page.getByRole('region', { name: 'As tuas escolhas de privacidade' })).toBeHidden();
  const choice = await storedChoice(page);
  expect(choice.categories).toEqual({ analytics: false, advertising: false });
  expect(requests).toEqual([]);
});

test('accepting enables providers only after a valid TCF decision', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Aceitar todos os cookies' }).click();

  await expect.poll(() => providerScriptCount(page, 'googletagmanager.com/gtag')).toBe(1);
  await expect.poll(() => providerScriptCount(page, 'clarity.ms/tag')).toBe(1);
  await expect.poll(() => providerScriptCount(page, 'pagead2.googlesyndication.com/pagead')).toBe(1);
  await expect.poll(() => page.evaluate(() => window.__aquaTrustDiagnostics?.advertising?.decision)).toBe('allow');
  const choice = await storedChoice(page);
  expect(choice.categories).toEqual({ analytics: true, advertising: true });
});

test('withdrawal persists revokedAt and immediately unloads optional providers', async ({ page }) => {
  await preparePage(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Aceitar todos os cookies' }).click();
  await expect.poll(() => providerScriptCount(page, 'pagead2.googlesyndication.com/pagead')).toBe(1);
  await page.evaluate(() => { document.cookie = '_ga_e2e=value; Path=/; SameSite=Lax'; });

  await page.goto('/privacidade');
  await page.getByRole('button', { name: 'Abrir definições de privacidade' }).click();
  const dialog = page.getByRole('dialog', { name: 'Preferências de privacidade' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Retirar consentimento' }).click();

  await expect(page.getByRole('region', { name: 'As tuas escolhas de privacidade' })).toContainText('Retiraste o consentimento. Os serviços opcionais permanecem desligados até escolheres novamente.');
  const revoked = await storedChoice(page);
  expect(revoked.revokedAt).toBeTruthy();
  expect(await providerScriptCount(page, 'googletagmanager.com/gtag')).toBe(0);
  expect(await providerScriptCount(page, 'clarity.ms/tag')).toBe(0);
  expect(await providerScriptCount(page, 'pagead2.googlesyndication.com/pagead')).toBe(0);
  expect(await page.evaluate(() => document.cookie.includes('_ga_e2e='))).toBe(false);
});

test('a choice expires during an open session and requires renewal', async ({ page }) => {
  const expiresSoon = consentChoice({
    analytics: true,
    decidedAt: new Date(Date.now() - RETENTION_MS + 4_000).toISOString(),
  });
  await preparePage(page, { choice: expiresSoon });
  await page.goto('/');

  await expect.poll(() => providerScriptCount(page, 'googletagmanager.com/gtag')).toBe(1);
  await expect(page.getByRole('region', { name: 'As tuas escolhas de privacidade' })).toContainText('A tua escolha anterior expirou após 180 dias. Escolhe novamente.', { timeout: 8_000 });
  expect(await providerScriptCount(page, 'googletagmanager.com/gtag')).toBe(0);
  await expect.poll(() => page.evaluate(() => window.__aquaTrustDiagnostics?.advertising?.decision)).toBe('deny');
});

test('a policy version change requires a new explicit choice', async ({ page }) => {
  await preparePage(page, {
    choice: consentChoice({ analytics: true, advertising: true, policyVersion: 2 }),
  });
  await page.goto('/');

  await expect(page.getByRole('region', { name: 'As tuas escolhas de privacidade' })).toContainText('A política de consentimento mudou. Revê e renova a tua escolha.');
  expect(await providerScriptCount(page, 'googletagmanager.com/gtag')).toBe(0);
  expect(await providerScriptCount(page, 'pagead2.googlesyndication.com/pagead')).toBe(0);
});

for (const signal of ['GPC', 'DNT']) {
  test(`${signal} keeps advertising denied while explicit analytics can run`, async ({ page }) => {
    await preparePage(page, {
      globalPrivacyControl: signal === 'GPC',
      doNotTrack: signal === 'DNT',
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Aceitar todos os cookies' }).click();

    const choice = await storedChoice(page);
    expect(choice.categories).toEqual({ analytics: true, advertising: false });
    await expect.poll(() => providerScriptCount(page, 'googletagmanager.com/gtag')).toBe(1);
    expect(await providerScriptCount(page, 'pagead2.googlesyndication.com/pagead')).toBe(0);
    await expect.poll(() => page.evaluate(() => window.__aquaTrustDiagnostics?.advertising?.reasons || [])).toContain('privacy.signal-active');
  });
}

test('unknown region applies strict TCF proof requirements', async ({ page }) => {
  await preparePage(page, {
    cmp: 'incomplete',
    choice: consentChoice({ advertising: true }),
  });
  await page.goto('/');

  await expect.poll(() => page.evaluate(() => window.__aquaTrustDiagnostics?.advertising?.reasons || [])).toContain('tcf.proof-missing');
  expect(await providerScriptCount(page, 'pagead2.googlesyndication.com/pagead')).toBe(0);
});

test('missing CMP fails closed even when the deployment interlock is enabled', async ({ page }) => {
  await preparePage(page, { cmp: 'missing' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Aceitar todos os cookies' }).click();

  const choice = await storedChoice(page);
  expect(choice.categories).toEqual({ analytics: true, advertising: false });
  expect(await providerScriptCount(page, 'pagead2.googlesyndication.com/pagead')).toBe(0);
  await expect.poll(() => page.evaluate(() => window.__aquaTrustDiagnostics?.advertising?.reasons || [])).toContain('cmp.not-configured');
});
