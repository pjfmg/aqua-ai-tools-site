import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

function parseArguments(argv) {
  const options = { baseUrl: '', evidencePath: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === '--base-url' && value) {
      options.baseUrl = new URL(value).toString();
      index += 1;
    } else if (argument === '--evidence' && value) {
      options.evidencePath = path.resolve(value);
      index += 1;
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }
  if (!options.baseUrl || !options.evidencePath) {
    throw new Error('Both --base-url and --evidence are required.');
  }
  return options;
}

const options = parseArguments(process.argv.slice(2));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(options.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  const evidence = await page.evaluate(async () => {
    const advertising = document.querySelectorAll(
      'script[src*="pagead2.googlesyndication.com"], script[src*="googlesyndication.com/pagead"]',
    ).length;
    const analytics = document.querySelectorAll(
      'script[src*="googletagmanager.com/gtag"], script[src*="clarity.ms/tag"]',
    ).length;
    const tcfApiType = typeof window.__tcfapi;
    const googleFcType = typeof window.googlefc;
    let cmpStatus = 'not-observed';
    let tcStringStatus = 'not-observed';
    let eventStatus = 'not-observed';

    if (tcfApiType === 'function') {
      const state = await new Promise((resolve) => {
        const timeout = window.setTimeout(() => resolve(null), 5_000);
        window.__tcfapi('addEventListener', 2, (tcData, success) => {
          window.clearTimeout(timeout);
          resolve(success ? tcData : null);
        });
      });
      cmpStatus = state?.cmpStatus || (state ? 'loaded' : 'not-observed');
      tcStringStatus = typeof state?.tcString === 'string' && state.tcString.length > 0
        ? 'present'
        : 'missing';
      eventStatus = state?.eventStatus || 'not-observed';
    }

    return {
      schemaVersion: 1,
      target: window.location.href,
      checkedAt: new Date().toISOString(),
      bundlePath: document.querySelector('script[src*="/assets/index-"]')?.getAttribute('src') || '',
      tcfApiType,
      googleFcType,
      cmpStatus,
      tcStringStatus,
      eventStatus,
      adScriptsBeforeChoice: advertising,
      analyticsScriptsBeforeChoice: analytics,
    };
  });

  await fs.mkdir(path.dirname(options.evidencePath), { recursive: true });
  await fs.writeFile(options.evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  await browser.close();
}
