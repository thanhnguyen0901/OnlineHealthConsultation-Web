import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || process.env.VITE_APP_URL || 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e/specs',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer:
    process.env.PLAYWRIGHT_SKIP_WEB_SERVER === 'true'
      ? undefined
      : {
          command: 'npm run dev -- --host 127.0.0.1',
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
});
