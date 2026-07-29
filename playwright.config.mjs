import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 20_000,
  expect: {
    timeout: 7_000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
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
    command: 'npm run dev:vite -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
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
