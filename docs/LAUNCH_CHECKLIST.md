# Launch checklist

Work through this list before the site goes public. Items are in priority order. Nothing here is done until you have checked it yourself.

## 1. Decisions only you can make

These need your approval or information. The site handles each one safely until you decide.

| # | Decision | Current state on the site | Where to change it |
| --- | --- | --- | --- |
| 1 | **Business Suite features.** Each listed feature must be confirmed against the current app source. | All 28 features are `unverified` and **hidden** on the live site. The page says the list is being confirmed. | `src/content/business-suite-features.yaml`: set each to `available` or `planned` |
| 2 | **Business Suite screenshots.** Real screenshots from the current release. | None shown. No mock interfaces are used. | Add images, see CONTENT_GUIDE.md |
| 3 | **Business Suite prices** of ₦50,000 (offline) and ₦60,000 (online), and what each includes (devices covered, updates, support, any yearly fee). | Shown as indicative "confirmed in your written quote". | `src/config/site.ts` → `businessSuitePricing` |
| 4 | **"Not available as a public download"** and "supplied directly by Ilelah Technologies". Is this accurate? | Stated on the product page. | `src/pages/products/business-suite.astro` |
| 5 | **Legal entity name** (exact CAC-registered name) and whether to publish an RC/BN number. | Legal pages say "Ilelah Technologies". | `src/config/site.ts` → `legalEntity`, `registrationNumber` |
| 6 | **Privacy policy and terms**: legal review against the NDPA 2023, governing law and the 24-month enquiry retention period. | Draft. Review notes are visible in `npm run dev` only. | `src/pages/privacy.astro`, `src/pages/terms.astro`, docs/PRIVACY_REVIEW.md |
| 7 | **On-site service area**: "in and around Bauchi; further afield by arrangement, quoted separately". | Stated on ICT, EduTech and FAQ pages. | `src/content/services/ict-support.md`, `faqs.yaml`, `src/pages/edutech.astro` |
| 8 | **CBT portfolio entry**: approve wording and status; the school stays unnamed unless it gives written permission. | Draft, **hidden** on the live site. | `src/content/portfolio/school-cbt-system.md` → `approved: true` |
| 9 | **Ilelah Designs and I.T Solutions** mention on the Design page ("builds on the founder's design work under the … name"). Is this wording accurate? | Published. | `src/content/services/graphic-design.md` |
| 10 | **Courses**: which, if any, can open for enrolment, with duration, format and fee. | All 8 say "Register interest". | `src/content/courses/*.md` |
| 11 | **Social media accounts**: exact URLs of accounts that exist. | None shown. | `src/config/site.ts` → `social` |
| 12 | **Founder profile** wording on the About page. | Written only from facts you supplied. | `src/pages/about.astro` |

## 2. Accounts and configuration

- [ ] Domain `ilelahtech.com` **registered in your name** (check renewal date and turn on auto-renew)
- [ ] Mailbox `walid@ilelahtech.com` **exists and receives mail** (the site publishes this address). Send it a test from another account. See EMAIL_SETUP.md.
- [ ] GitHub repository created (private) and code pushed. See DEPLOYMENT.md.
- [ ] Cloudflare Pages project connected to the repository
- [ ] Resend account created, `ilelahtech.com` verified in Resend, API key created
- [ ] Cloudflare Turnstile widget created for `ilelahtech.com` and `www.ilelahtech.com`
- [ ] Production variables set in Cloudflare: `NODE_VERSION`, `PUBLIC_SITE_URL`, `PUBLIC_TURNSTILE_SITE_KEY`, and **secrets** `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL`, `TURNSTILE_SECRET_KEY`
- [ ] (Recommended) Cloudflare rate limiting rule for `/api/enquiry`, or a KV namespace bound as `RATE_LIMIT_KV`
- [ ] (Optional) Cloudflare Web Analytics token set as `PUBLIC_CF_ANALYTICS_TOKEN`; privacy policy re-checked

## 3. Verify on the preview deployment (before the domain points to it)

- [ ] Every page loads; no "Draft" or "Review before launch" text appears
- [ ] Send a real **quote request** and a real **contact message**. Both arrive in the inbox, reply-to is the sender, and the reference number on screen matches the email subject.
- [ ] Turn off the Resend key temporarily (or use a wrong one) and confirm the form shows the "not sent" message with alternative contacts, not a success message
- [ ] Phone link dials, WhatsApp link opens a chat with **+234 706 679 3518**, email link opens a new message to `walid@ilelahtech.com`
- [ ] Check on a real Android phone over mobile data: menu, forms, text size and speed

## 4. Go live

- [ ] Custom domain added in Cloudflare Pages; `https://www.ilelahtech.com` loads with a valid padlock
- [ ] `ilelahtech.com` (no www) redirects to `https://www.ilelahtech.com`
- [ ] Set `PUBLIC_ALLOW_INDEXING=true` for **Production only**, then redeploy
- [ ] `https://www.ilelahtech.com/robots.txt` now shows `Allow: /` and the sitemap line
- [ ] View the page source of the homepage: `<meta name="robots" content="index, follow…">`
- [ ] `https://ilelah-website.pages.dev` (or your project's pages.dev address) returns the `X-Robots-Tag: noindex` header

## 5. After launch

- [ ] Add the site to **Google Search Console** (Domain property, DNS verification through Cloudflare) and submit `https://www.ilelahtech.com/sitemap-index.xml`
- [ ] Add the site to **Bing Webmaster Tools** (it can import from Search Console)
- [ ] Create or update a **Google Business Profile** with the same name, phone and "Bauchi" service area (no street address unless you choose to publish one)
- [ ] Two weeks after launch: check Search Console "Pages" for indexing problems
- [ ] Monthly: check the inbox spam folder for misfiled enquiries; check Search Console coverage
- [ ] Quarterly: run `npm outdated` and `npm audit`, update dependencies on a branch, run all tests, redeploy
- [ ] Every 24 months: delete enquiries that did not lead to work (the privacy policy says so)

## Search optimisation checklist

- [x] Unique title and description on every page (enforced by tests)
- [x] Canonical URL on every page from one setting (`PUBLIC_SITE_URL`)
- [x] XML sitemap; robots.txt points to it when indexing is on
- [x] Organization, WebSite, BreadcrumbList, FAQPage, Article and SoftwareApplication structured data, only where it matches visible content
- [x] Open Graph and social sharing image
- [x] Fast pages (Lighthouse mobile performance 99–100 in testing)
- [ ] Google Search Console and Bing verified (after launch)
- [ ] Google Business Profile matches the website details exactly
- [ ] Add real portfolio case studies and screenshots as they are approved; these are the strongest content you can add
- [ ] Publish a new useful article when you have something worth saying. Quality matters more than frequency.
