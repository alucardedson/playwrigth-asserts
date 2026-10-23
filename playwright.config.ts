import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://the-internet.herokuapp.com',
    // Evidências automáticas de TODA execução (passou ou falhou)
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    acceptDownloads: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
