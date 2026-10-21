import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';

/** Every page path in the production sitemap, plus pages excluded from it. */
export function sitemapPaths(): string[] {
  const xml = readFileSync(new URL('../../dist/sitemap-0.xml', import.meta.url), 'utf8');
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  return [...new Set(paths)].sort();
}

/** Collect console errors and CSP violations on a page. */
export function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}
