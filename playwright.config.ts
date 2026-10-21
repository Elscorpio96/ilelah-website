import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against the production build served by Wrangler,
 * Cloudflare's local Pages runtime, so the real /api/enquiry Function and
 * the generated security headers (_headers) are exercised.
 *
 * Run `npm run build` first, then `npm run test:e2e`.
 */
const PORT = 8788;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  workers: 4,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    // The responsive spec sets its own widths, so it runs in the desktop project only.
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testIgnore: /responsive\.spec/ },
    { name: 'tablet', use: { browserName: 'chromium', viewport: { width: 820, height: 1180 }, isMobile: false }, testIgnore: /responsive\.spec/ },
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1366, height: 900 } } },
  ],
  webServer: {
    command: `npx wrangler pages dev dist --port ${PORT} --compatibility-date=2026-10-01`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
