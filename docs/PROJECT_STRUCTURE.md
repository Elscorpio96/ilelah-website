# Project structure

```
ilelah-website/
├── functions/                  Cloudflare Pages Functions (server code)
│   ├── api/enquiry.ts          POST /api/enquiry: checks and emails form submissions
│   └── tsconfig.json           Type settings for the Cloudflare runtime
├── public/                     Copied to the site as-is
│   ├── brand/                  Logo files cut from the official logo, see BRAND_GUIDE.md
│   ├── favicon.ico, favicon-64.png, apple-touch-icon.png, icon-192.png, icon-512.png
│   ├── og-default.png          Image shown when a page is shared on social media
│   ├── site.webmanifest
│   └── _routes.json            Tells Cloudflare only /api/* runs server code
├── scripts/
│   ├── brand/build_brand.py    Cuts the official logo into web and icon files (npm run brand)
│   ├── brand/source/           The official logo and company seal, as supplied
│   └── postbuild.mjs           Writes dist/_headers (security headers, CSP hashes) and checks for leaked secrets
├── src/
│   ├── config/
│   │   ├── site.ts             Business details, contact, prices, feature switches
│   │   ├── navigation.ts       Header and footer menus
│   │   └── divisions.ts        The eight service divisions
│   ├── content/                Editable content (see CONTENT_GUIDE.md)
│   │   ├── services/*.md
│   │   ├── courses/*.md
│   │   ├── portfolio/*.md
│   │   ├── insights/*.md
│   │   ├── faqs.yaml
│   │   └── business-suite-features.yaml
│   ├── content.config.ts       Required fields for each kind of content
│   ├── components/             Reusable building blocks
│   │   ├── Header.astro        Logo, menu, mobile menu, dropdowns
│   │   ├── Footer.astro
│   │   ├── EnquiryForm.astro   Contact and quote form (browser side)
│   │   ├── HeroSchematic.astro Homepage diagram
│   │   ├── DivisionList.astro, CtaBand.astro, PageHeader.astro, Icon.astro
│   │   ├── Seo.astro           Title, description, canonical, social and robots tags
│   │   └── ReviewNote.astro    Owner notes shown only in development
│   ├── layouts/
│   │   ├── BaseLayout.astro    The HTML shell used by every page
│   │   └── PageLayout.astro    Inner pages: header, breadcrumbs, closing call to action
│   ├── lib/
│   │   ├── enquiry.ts          Form rules, shared by browser and server
│   │   ├── schema.ts           Structured data (JSON-LD) builders
│   │   ├── track.ts            Privacy-safe conversion event hooks (inactive by default)
│   │   ├── portfolio.ts, icons.ts
│   ├── pages/                  One file per page; the file path is the web address
│   │   ├── index.astro         /
│   │   ├── about.astro, contact.astro, quote.astro, faq.astro, edutech.astro
│   │   ├── privacy.astro, terms.astro, 404.astro, robots.txt.ts
│   │   ├── services/index.astro, services/[slug].astro
│   │   ├── products/index.astro, products/business-suite.astro
│   │   ├── academy/index.astro, academy/[slug].astro
│   │   ├── portfolio/index.astro, portfolio/[slug].astro
│   │   └── insights/index.astro, insights/[slug].astro
│   └── styles/
│       ├── tokens.css          Colours, type sizes, spacing (the design system)
│       └── global.css          Base styles, buttons, forms, layout helpers
├── tests/
│   ├── unit/                   Vitest: form rules and the email Function
│   └── e2e/                    Playwright: pages, navigation, forms, accessibility, layout
├── docs/                       This documentation, plus brand-templates/
├── astro.config.mjs            Site URL, static output, sitemap
├── playwright.config.ts, vitest.config.ts, tsconfig.json
├── .env.example                Public build settings template
├── .dev.vars.example           Server secrets template (local testing)
├── .nvmrc                      Node.js version (24) for Cloudflare and nvm
└── package.json                Scripts and exact dependency versions
```

## How a page is built

1. `src/pages/…` decides the address and which layout to use.
2. The layout adds the header, footer, SEO tags and styles.
3. Pages read content from `src/content/` and settings from `src/config/`.
4. `npm run build` turns everything into plain HTML, CSS and a small amount of JavaScript in `dist/`.

## JavaScript on the site

Most pages ship almost no JavaScript:

- **Header** (about 1 KB, inline): mobile menu and dropdowns
- **Tracking hooks** (under 1 KB): inactive unless you connect a tool
- **Enquiry form** (about 4 KB): only on Contact and Quote
- **Turnstile and Cloudflare Analytics**: loaded only when configured

Without JavaScript, all content and links still work, and the menu falls back to an always-visible list. The form explains how to email or call instead.

## Dependencies

Exact versions are pinned in `package.json` and `package-lock.json`.

| Package | Purpose |
| --- | --- |
| `astro` | Site framework (static output) |
| `@astrojs/sitemap` | Generates `sitemap-index.xml` |
| `@fontsource-variable/schibsted-grotesk` | Self-hosted brand typeface, no Google Fonts request |
| `typescript`, `@astrojs/check` | Type checking (development only) |
| `vitest` | Unit tests (development only) |
| `@playwright/test`, `@axe-core/playwright` | Browser and accessibility tests (development only) |
| `wrangler`, `@cloudflare/workers-types` | Local Cloudflare runtime and types (development only) |
