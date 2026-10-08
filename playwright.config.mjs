import { defineConfig, devices } from '@playwright/test';

const testPort = Number(process.env.AQUA_E2E_PORT || 43917);
const testBaseUrl = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 7_000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: testBaseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run dev:vite -- --host 127.0.0.1 --port ${testPort} --strictPort`,
    url: testBaseUrl,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      ...process.env,
      VITE_ADSENSE_TCF_READY: 'true',
      VITE_CMP_BOOTSTRAP_ENABLED: 'false',
      VITE_CMP_CERTIFIED: 'true',
      VITE_TCF_VERSION: '2.3',
      VITE_ADSENSE_SITE_APPROVED: 'true',
      VITE_ADS_TXT_AUTHORIZED: 'true',
      VITE_ADVERTISING_EMERGENCY_STOP: 'false',
      VITE_ADVERTISING_REGION: 'unknown',
    },
  },
});
