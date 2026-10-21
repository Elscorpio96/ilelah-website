import { test, expect } from '@playwright/test';

test.describe('header navigation', () => {
  test('mobile menu opens, navigates and closes', async ({ page }, info) => {
    test.skip(info.project.name === 'desktop', 'mobile and tablet layouts only');
    await page.goto('/');
    const toggle = page.locator('[data-nav-toggle]');
    const nav = page.locator('#site-nav');
    await expect(toggle).toBeVisible();
    await expect(nav).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toBeVisible();

    // Escape closes and returns focus to the toggle
    await page.keyboard.press('Escape');
    await expect(nav).toBeHidden();
    await expect(toggle).toBeFocused();

    // Submenu expands inside the mobile menu, and links work
    await toggle.click();
    const services = nav.getByRole('button', { name: 'Services' });
    await services.click();
    await expect(services).toHaveAttribute('aria-expanded', 'true');
    await nav.getByRole('link', { name: /ICT support and consultancy/ }).click();
    await expect(page).toHaveURL(/\/services\/ict-support\/$/);
    await expect(page.locator('#site-nav')).toBeHidden();
  });

  test('desktop dropdowns work with mouse and keyboard', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'desktop layout only');
    await page.goto('/');
    await expect(page.locator('[data-nav-toggle]')).toBeHidden();
    const products = page.getByRole('button', { name: 'Products' });
    await products.click();
    await expect(products).toHaveAttribute('aria-expanded', 'true');
    const link = page.getByRole('link', { name: /Ilelah Business Suite\s*Sales, stock/ });
    await expect(link).toBeVisible();

    // Escape closes the dropdown and returns focus to its button
    await page.keyboard.press('Escape');
    await expect(products).toHaveAttribute('aria-expanded', 'false');
    await expect(products).toBeFocused();

    // Keyboard: open with Enter, then Tab into the submenu
    await page.keyboard.press('Enter');
    await expect(products).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'All products' })).toBeFocused();

    // Clicking elsewhere closes it
    await page.locator('h1').click();
    await expect(products).toHaveAttribute('aria-expanded', 'false');
  });

  test('skip link moves focus to the main content', async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', 'keyboard test');
    await page.goto('/about/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('current page is marked in the navigation', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'desktop layout only');
    await page.goto('/about/');
    await expect(page.locator('#site-nav a[href="/about/"]')).toHaveAttribute('aria-current', 'page');
  });

  test('main calls to action lead to working pages', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('main').getByRole('link', { name: 'Request a quote' }).first().click();
    await expect(page).toHaveURL(/\/quote\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Request a quote');

    await page.goto('/');
    await page.getByRole('link', { name: 'Explore our solutions' }).click();
    await expect(page).toHaveURL(/\/services\/$/);

    await page.goto('/products/business-suite/');
    await page.getByRole('main').getByRole('link', { name: 'Request a demo' }).first().click();
    await expect(page).toHaveURL(/\/quote\/\?service=business-suite&intent=demo$/);
  });
});
