# Testing

## Commands

```powershell
npm run build                     # type-check (Astro + Function) and build; fails on errors or leaked secrets
npm test                          # unit tests (Vitest)
npx playwright install chromium   # first time only
npm run test:e2e                  # browser tests against the built site in the local Cloudflare runtime
npm run test:all                  # all of the above in order
```

The end-to-end tests start `wrangler pages dev` automatically on port 8788. This serves `dist/` with the real `_headers` and runs the real `functions/api/enquiry.ts`. Run `npm run build` first.

A browsable report is written to `playwright-report/`. Open it with `npx playwright show-report`.

## What is covered

### Unit tests (`tests/unit/`): 40 tests

**Form rules** (`enquiry.test.ts`)
- Valid input accepted and normalised (email lower-cased, whitespace tidied, line breaks kept in messages)
- Missing fields, bad email formats, unknown services, short and long messages rejected with helpful messages
- Phone required when phone or WhatsApp contact is chosen; Nigerian and international formats accepted; junk rejected
- Budget and timeline restricted to listed values; consent required; non-string input handled safely
- Honeypot and minimum fill-time detection
- Reference numbers have a readable format with no ambiguous characters
- Notification email escapes HTML; subject lines cannot contain line breaks

**Email Function** (`enquiry-function.test.ts`), with Resend and Turnstile mocked
- Valid enquiry → sent to Resend with the correct recipient, Reply-To and reference → 200
- Email not configured → **503**, nothing sent
- Resend rejects or is unreachable → **502**, never a success response
- Invalid input → 422 with field errors, nothing sent
- Honeypot or too-fast submissions silently dropped without sending
- Turnstile verified when configured; a failed check is rejected
- Posts from other websites refused (403); `ALLOWED_ORIGINS` respected
- Rate limit returns 429 with `Retry-After`
- Oversized, malformed and non-object bodies rejected; URL-encoded posts accepted
- Non-POST methods get 405; internal error details never leak

### End-to-end tests (`tests/e2e/`), run on mobile (Pixel 7), tablet (820 px) and desktop (1366 px)

**Every page in the sitemap** (31 pages)
- Returns 200, has exactly one `<h1>` and one `<main>`
- Title present; description between 50 and 170 characters; canonical URL correct; Open Graph image set
- `noindex` while indexing is disabled; structured data is valid JSON
- No `href="#"` or empty links; no draft or unverified content; no broken images; every image has `alt`
- **No console errors**, which also catches Content Security Policy violations
- Page titles unique across the site; every internal link resolves (crawled from all pages)
- Custom 404 returns status 404 with `noindex`; `robots.txt` blocks crawling by default
- Security headers present; CSP does not allow inline scripts generally
- Business Suite page hides unverified features and shows the approved prices

**Navigation**
- Mobile menu opens and closes; Escape closes it and returns focus; submenu expands; links navigate
- Desktop dropdowns work by mouse and keyboard (Enter, Tab, Escape, click outside)
- Skip link works; the current page is marked with `aria-current`
- Main calls to action ("Request a quote", "Explore our solutions", "Request a demo") reach the right pages

**Forms**
- Invalid submission shows a focused error summary and field errors, and **sends nothing**
- Error summary links move focus to fields; errors clear when fixed
- WhatsApp contact requires a phone number
- Success panel with the reference number appears **only** after the server confirms delivery; the payload is correct
- Delivery failure and network failure keep the visitor's input and show email, phone and WhatsApp alternatives
- Server-side field errors are displayed
- **Real Function, no mocks:** with no email provider configured, the visitor is told honestly that the form is not accepting messages
- Training course and demo intent prefill from links; course pages link to a prefilled form
- Contact form sends and confirms

**Accessibility** (axe-core: WCAG 2.0/2.1/2.2 A and AA plus best practices)
- Every page and the 404 page: **zero violations**
- Form error state and open mobile menu: zero violations
- Mobile navigation touch targets at least 44 px tall

**Responsive layout** (all pages at 320, 360, 375, 414, 768, 1024, 1280 and 1920 px)
- No horizontal scrolling or content overflowing the screen
- Body text at least 16 px on the smallest phones

## Latest results (21 October 2026)

| Check | Result |
| --- | --- |
| `npm audit` | 0 vulnerabilities |
| Type check (`astro check` + Function `tsc`) | 0 errors, 0 warnings, 0 hints |
| Production build | 31 pages; `_headers` written; secret scan clean |
| Unit tests | **40 passed** |
| End-to-end tests | **262 passed**, 8 skipped (layout-specific tests that do not apply to that device size) |
| Real Function in local Cloudflare runtime | 503 when unconfigured, 422 on invalid input, 405 on GET (also checked manually with curl) |

### Lighthouse (mobile emulation, simulated slow 4G, local production build)

| Page | Performance | Accessibility | Best practices | First paint | Largest paint | Blocking time | Layout shift | Page weight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 99 | 100 | 100 | 1.5 s | 1.8 s | 0 ms | 0 | 98 KB |
| `/products/business-suite/` | 100 | 100 | 100 | 1.2 s | 1.6 s | 0 ms | 0 | 95 KB |
| `/quote/` | 100 | 100 | 100 | 1.3 s | 1.5 s | 0 ms | 0 | 100 KB |
| `/edutech/` | 100 | 100 | 100 | 1.1 s | 1.5 s | 0 ms | 0 | 73 KB |
| `/academy/python-programming/` | 100 | 100 | 100 | 1.1 s | 1.4 s | 0 ms | 0 | 71 KB |

The SEO category scores 69 while indexing is intentionally disabled, because of the `noindex` tag. In a test build with `PUBLIC_ALLOW_INDEXING=true`, the homepage scored **SEO 100** with no failed audits.

These figures come from a local server. Re-measure on the live domain with PageSpeed Insights (<https://pagespeed.web.dev>) after launch; real-world numbers depend on Cloudflare's network and visitors' connections.

## Not yet verified (needs live accounts)

- **Real email delivery through Resend.** The integration is built and unit-tested with a mocked Resend API, but no real email has been sent because no API key exists yet. Verify with LAUNCH_CHECKLIST.md section 3.
- **Real Turnstile check.** Server verification is unit-tested with a mocked Cloudflare response; the widget itself has not run against real keys.
- **Custom domain, HTTPS and redirects:** the domain is not connected yet.
- **Browsers other than Chromium:** automated tests ran in Chromium only. Check Safari on an iPhone and Firefox manually before launch.
- **A real Android device on mobile data:** emulation is not a substitute; check by hand.
- Automated accessibility checks do not catch everything. A manual screen-reader pass (TalkBack on Android) is recommended.

## Known limitations

- The rate limit is per Cloudflare location unless a KV namespace or WAF rule is added (DEPLOYMENT.md).
- Test files are excluded from the type check in `npm run build` (their runners strip types without checking them). Site and Function code is fully type-checked.
