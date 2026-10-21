import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { sitemapPaths } from './helpers';

const paths = [...sitemapPaths(), '/this-page-does-not-exist/'];

for (const path of paths) {
  test(`no automated accessibility violations on ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path, { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
    const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
    expect(summary).toEqual([]);
  });
}

test('form error state is accessible', async ({ page }) => {
  await page.goto('/quote/');
  await page.getByRole('button', { name: 'Send quote request' }).click();
  await expect(page.locator('[data-error-summary]')).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});

test('open mobile menu is accessible', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop', 'mobile and tablet layouts only');
  await page.goto('/');
  await page.locator('[data-nav-toggle]').click();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});

test('touch targets in the main navigation are at least 44px tall', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop', 'touch layouts only');
  await page.goto('/');
  await page.locator('[data-nav-toggle]').click();
  const heights = await page.locator('#site-nav .nav-link').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  for (const h of heights) expect(h).toBeGreaterThanOrEqual(44);
});
