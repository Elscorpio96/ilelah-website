import { test, expect } from '@playwright/test';
import { sitemapPaths } from './helpers';

const widths = [320, 360, 375, 414, 768, 1024, 1280, 1920];
const paths = sitemapPaths();

test.describe('responsive layout', () => {
  for (const width of widths) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const overflowing: string[] = [];
      for (const path of paths) {
        await page.goto(path);
        const result = await page.evaluate(() => {
          const doc = document.documentElement;
          const offenders = [...document.querySelectorAll('body *')]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return r.width > 0 && r.right > doc.clientWidth + 1 && getComputedStyle(el).position !== 'fixed';
            })
            .slice(0, 3)
            .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
          return { scroll: doc.scrollWidth > doc.clientWidth + 1, offenders };
        });
        if (result.scroll || result.offenders.length) overflowing.push(`${path}: ${result.offenders.join(', ')}`);
      }
      expect(overflowing).toEqual([]);
    });
  }

  test('body text stays readable on the smallest phones', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/');
    const size = await page.locator('main p').first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(size).toBeGreaterThanOrEqual(16);
    const h1 = await page.locator('h1').evaluate((el) => el.getBoundingClientRect().width);
    expect(h1).toBeLessThanOrEqual(320);
  });
});
