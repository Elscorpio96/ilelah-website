import { test, expect, type Page } from '@playwright/test';

/** The form rejects submissions made within 3s of loading (bot check). */
async function waitPastBotTimer(page: Page) {
  await page.waitForTimeout(3100);
}

async function fillQuote(page: Page) {
  await page.getByLabel('What do you need help with?').selectOption('website');
  await page.getByLabel('Describe what you need').fill('We need a website for our school with admissions and news pages.');
  await page.getByLabel('Full name').fill('Test Person');
  await page.getByLabel('Email address').fill('test@example.com');
  await page.getByLabel(/I agree that Ilelah Technologies/).check();
}

test.describe('quote form', () => {
  test('shows field errors and an error summary, and sends nothing when invalid', async ({ page }) => {
    let posted = false;
    await page.route('**/api/enquiry', (route) => {
      posted = true;
      return route.abort();
    });
    await page.goto('/quote/');
    await page.getByRole('button', { name: 'Send quote request' }).click();

    const summary = page.locator('[data-error-summary]');
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(page.locator('[data-error-for="email"]').first()).toHaveText(/email address/i);
    await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true');
    expect(posted).toBe(false);

    // Clicking an item in the summary moves focus to the field
    await summary.getByRole('link', { name: /Full name/ }).click();
    await expect(page.getByLabel('Full name')).toBeFocused();

    // Fixing a field clears its error when focus leaves it
    await page.getByLabel('Full name').fill('Test Person');
    await page.getByLabel('Email address').focus();
    await expect(page.locator('[data-error-for="name"]').first()).toHaveText('');
  });

  test('requires a phone number when WhatsApp is the chosen contact method', async ({ page }) => {
    await page.goto('/quote/');
    await fillQuote(page);
    await page.locator('label.choice', { hasText: 'WhatsApp' }).click();
    await page.getByRole('button', { name: 'Send quote request' }).click();
    await expect(page.locator('[data-error-for="phone"]').first()).toHaveText(/phone number/i);
  });

  test('shows the reference number only after the server confirms delivery', async ({ page }) => {
    let payload: Record<string, unknown> = {};
    await page.route('**/api/enquiry', async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, reference: 'ILT-261021-TEST' }) });
    });
    await page.goto('/quote/');
    await fillQuote(page);
    await waitPastBotTimer(page);
    await page.getByRole('button', { name: 'Send quote request' }).click();

    const success = page.locator('[data-success]');
    await expect(success).toBeVisible();
    await expect(success).toBeFocused();
    await expect(success.getByRole('heading')).toHaveText('Quote request sent');
    await expect(success).toContainText('ILT-261021-TEST');
    await expect(page.locator('[data-form]')).toBeHidden();

    expect(payload.service).toBe('website');
    expect(payload.consent).toBe(true);
    expect(payload.website).toBe('');
    expect(Number(payload.startedAt)).toBeGreaterThan(0);
  });

  test('keeps the visitor’s details and offers other channels when delivery fails', async ({ page }) => {
    await page.route('**/api/enquiry', (route) =>
      route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, code: 'delivery_failed', message: 'Your message could not be delivered just now.' }),
      }),
    );
    await page.goto('/quote/');
    await fillQuote(page);
    await waitPastBotTimer(page);
    await page.getByRole('button', { name: 'Send quote request' }).click();

    const failure = page.locator('[data-failure]');
    await expect(failure).toBeVisible();
    await expect(failure).toContainText('could not be delivered');
    await expect(failure.locator('a[href^="mailto:"]')).toBeVisible();
    await expect(failure.locator('a[href^="https://wa.me/"]')).toBeVisible();
    await expect(page.locator('[data-success]')).toBeHidden();
    await expect(page.getByLabel('Full name')).toHaveValue('Test Person');
    await expect(page.getByRole('button', { name: 'Send quote request' })).toBeEnabled();
  });

  test('handles the network being unavailable', async ({ page }) => {
    await page.route('**/api/enquiry', (route) => route.abort('internetdisconnected'));
    await page.goto('/quote/');
    await fillQuote(page);
    await waitPastBotTimer(page);
    await page.getByRole('button', { name: 'Send quote request' }).click();
    await expect(page.locator('[data-failure]')).toContainText('could not reach our server');
  });

  test('shows server-side field errors returned by the Function', async ({ page }) => {
    await page.route('**/api/enquiry', (route) =>
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, code: 'invalid', errors: { email: 'Enter an email address in the format name@example.com.' } }),
      }),
    );
    await page.goto('/quote/');
    await fillQuote(page);
    await waitPastBotTimer(page);
    await page.getByRole('button', { name: 'Send quote request' }).click();
    await expect(page.locator('[data-error-for="email"]').first()).toHaveText(/name@example\.com/);
  });

  test('real Function: with no email provider configured, the visitor is told honestly', async ({ page }) => {
    // No route mock: this exercises functions/api/enquiry.ts in the local Cloudflare runtime,
    // which has no RESEND_API_KEY, so it must refuse rather than pretend to succeed.
    await page.goto('/quote/');
    await fillQuote(page);
    await waitPastBotTimer(page);
    await page.getByRole('button', { name: 'Send quote request' }).click();
    const failure = page.locator('[data-failure]');
    await expect(failure).toBeVisible();
    await expect(failure).toContainText('not accepting messages at the moment');
    await expect(page.locator('[data-success]')).toBeHidden();
  });

  test('prefills training course and demo intent from links', async ({ page }) => {
    await page.goto('/quote/?service=training&course=python-programming');
    await expect(page.getByLabel('What do you need help with?')).toHaveValue('training');
    await expect(page.getByLabel(/Which course/)).toBeVisible();
    await expect(page.getByLabel(/Which course/)).toHaveValue('Python Programming');
    await expect(page.locator('[data-form-type]')).toHaveValue('training');

    await page.goto('/quote/?service=business-suite&intent=demo');
    await expect(page.getByLabel('I would like a demonstration of Ilelah Business Suite')).toBeChecked();
    await expect(page.locator('[data-form-type]')).toHaveValue('demo');
    await expect(page.getByLabel(/Which course/)).toBeHidden();
  });

  test('course pages link to a prefilled interest form', async ({ page }) => {
    await page.goto('/academy/cybersecurity-fundamentals/');
    await page.getByRole('main').getByRole('link', { name: 'Register interest' }).first().click();
    await expect(page.getByLabel(/Which course/)).toHaveValue('Cybersecurity Fundamentals');
  });
});

test.describe('contact form', () => {
  test('sends a contact message and confirms it', async ({ page }) => {
    await page.route('**/api/enquiry', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, reference: 'ILT-261021-ABCD' }) }),
    );
    await page.goto('/contact/');
    await page.getByLabel('What is your message about?').selectOption('ict');
    await page.getByLabel('Your message', { exact: true }).fill('Our office network keeps dropping. Can you take a look this month?');
    await page.getByLabel('Full name').fill('Test Person');
    await page.getByLabel('Email address').fill('test@example.com');
    await page.getByLabel(/I agree that Ilelah Technologies/).check();
    await waitPastBotTimer(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.locator('[data-success]')).toContainText('ILT-261021-ABCD');
    await expect(page.locator('[data-success] h2')).toHaveText('Message sent');
  });
});
