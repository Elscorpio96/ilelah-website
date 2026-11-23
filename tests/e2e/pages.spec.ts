import { test, expect } from '@playwright/test';
import { sitemapPaths, watchConsole } from './helpers';

const paths = sitemapPaths();

test('sitemap lists every public page and no drafts', () => {
  expect(paths).toContain('/');
  expect(paths).toContain('/products/business-suite/');
  expect(paths).toContain('/quote/');
  expect(paths.length).toBeGreaterThanOrEqual(30);
  // Unapproved portfolio entries must not be published
  expect(paths).not.toContain('/portfolio/school-cbt-system/');
});

for (const path of paths) {
  test(`page ${path} renders cleanly with complete metadata`, async ({ page }) => {
    const errors = watchConsole(page);
    const res = await page.goto(path, { waitUntil: 'networkidle' });
    expect(res?.status()).toBe(200);

    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main#main')).toHaveCount(1);
    expect((await page.title()).length).toBeGreaterThan(10);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description && description.length).toBeGreaterThan(50);
    expect(description!.length).toBeLessThanOrEqual(170);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe(`https://www.ilelahtech.com${path}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og-default\.png$/);

    // Indexing is off until PUBLIC_ALLOW_INDEXING=true
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

    // Structured data must be valid JSON
    for (const block of await page.locator('script[type="application/ld+json"]').allTextContents()) {
      expect(() => JSON.parse(block)).not.toThrow();
    }

    // No placeholder links, no unverified or draft content on the live build
    await expect(page.locator('a[href="#"], a[href=""], a:not([href])')).toHaveCount(0);
    await expect(page.getByText(/Unverified: hidden on live site|Draft: hidden on live site|Review before launch/)).toHaveCount(0);

    // Images have alt attributes and load
    const brokenImages = await page.evaluate(() =>
      [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
    );
    expect(brokenImages).toEqual([]);
    const missingAlt = await page.locator('img:not([alt])').count();
    expect(missingAlt).toBe(0);

    expect(errors, `console errors on ${path}`).toEqual([]);
  });
}

test('page titles are unique', async ({ request }) => {
  const titles = new Map<string, string>();
  for (const path of paths) {
    const html = await (await request.get(path)).text();
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? '';
    expect(titles.has(title), `duplicate title "${title}" on ${path} and ${titles.get(title)}`).toBe(false);
    titles.set(title, path);
  }
});

test('every internal link resolves', async ({ request }) => {
  const seen = new Set<string>();
  const broken: string[] = [];
  for (const path of paths) {
    const html = await (await request.get(path)).text();
    for (const m of html.matchAll(/href="([^"]+)"/g)) {
      const href = m[1].replace(/&amp;/g, '&');
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      const target = href.split('#')[0].split('?')[0];
      if (!target || seen.has(target)) continue;
      seen.add(target);
      const res = await request.get(target);
      if (res.status() !== 200) broken.push(`${target} (from ${path}): ${res.status()}`);
    }
  }
  expect(broken).toEqual([]);
  expect(seen.size).toBeGreaterThan(30);
});

test('external contact links use the confirmed details', async ({ page }) => {
  await page.goto('/contact/');
  await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute('href', 'mailto:walid@ilelahtech.com');
  await expect(page.locator('a[href^="tel:"]').first()).toHaveAttribute('href', 'tel:+2347066793518');
  const wa = await page.locator('a[href^="https://wa.me/"]').first().getAttribute('href');
  expect(wa).toMatch(/^https:\/\/wa\.me\/2347066793518\?text=/);
});

test('unknown routes show the custom 404 page', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist/');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('We could not find that page');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('robots.txt blocks crawling until indexing is enabled', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text();
  expect(txt).toContain('Disallow: /');
});

test('security headers are served', async ({ request }) => {
  const res = await request.get('/');
  const h = res.headers();
  expect(h['content-security-policy']).toContain("default-src 'self'");
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['content-security-policy']).not.toContain("script-src 'self' 'unsafe-inline'");
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
});

test('Business Suite page shows verified features, licence terms and approved prices', async ({ page }) => {
  await page.goto('/products/business-suite/');
  await expect(page.getByText('The detailed feature list is being confirmed against the current release.')).toHaveCount(0);
  await expect(page.getByText('Printed receipts', { exact: true })).toBeVisible();
  await expect(page.getByText('Unverified: hidden on live site')).toHaveCount(0);
  await expect(page.getByText('One-time payment, lifetime licence').first()).toBeVisible();
  await expect(page.getByText('₦50,000').first()).toBeVisible();
  await expect(page.getByText('₦60,000').first()).toBeVisible();
  await expect(page.getByText('The website does not take payments.')).toBeVisible();
});

test('new company pages and the company profile are reachable', async ({ page, request }) => {
  for (const path of ['/industries/', '/careers/', '/partnerships/', '/islamic-academy/', '/services/hospital-systems/', '/services/ecommerce/', '/services/cctv-installation/', '/services/ai-automation/']) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
  }
  await expect(page.locator('h1')).toBeVisible();
  const pdf = await request.get('/downloads/ilelah-technologies-company-profile.pdf');
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toContain('pdf');
});

test('Islamic Academy page is clearly marked as coming soon and presets the interest form', async ({ page }) => {
  await page.goto('/islamic-academy/');
  await expect(page.locator('main .badge--planned', { hasText: 'Coming soon' })).toBeVisible();
  await page.locator('main').getByRole('link', { name: 'Register your interest' }).first().click();
  await expect(page).toHaveURL(/service=islamic-academy/);
  await expect(page.locator('select[name="service"]')).toHaveValue('islamic-academy');
});
