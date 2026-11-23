# Ilelah Technologies website

The corporate website for **Ilelah Technologies**: a fast, static site built with [Astro](https://astro.build), plus one small Cloudflare Pages Function that delivers enquiry forms to your inbox.

- 31 pages: Home, About, Services (5 service pages), Products, Ilelah Business Suite, EduTech and CBT, Digital Academy (8 course pages), Portfolio, Insights (2 articles), Request a quote, Contact, FAQs, Privacy, Terms and a custom 404
- Working enquiry forms with server-side validation, honeypot, minimum fill time, Cloudflare Turnstile and rate limiting, delivered by email through Resend
- No database, no admin dashboard and no tracking cookies
- Search indexing switched **off** until you turn it on for the verified production site

> This project is separate from the Ilelah Business Suite app and the CBT system. It does not read, change or depend on either of them.

## What you need

| Tool | Version | Why |
| --- | --- | --- |
| Node.js | **22.23.4 or newer** (24 LTS recommended) | Astro 7 requires it |
| npm | comes with Node.js | installs packages |
| Git | any recent version | version control and deployment |
| Python 3 + Pillow (optional) | 3.10+ | only to regenerate logo files |

Check what you have (PowerShell or Command Prompt):

```powershell
node -v
npm -v
git --version
```

If `node -v` shows a version lower than 22.23.4, install the current **LTS** version from <https://nodejs.org>.

## Run the site on your computer

```powershell
cd C:\Users\HP\Documents\ilelah-website   # wherever you unzipped the project
npm install
npm run dev
```

Open <http://localhost:4321>. Pages reload as you edit. In this development mode, **draft content is visible** and outlined in red (unverified Business Suite features, the unapproved CBT portfolio entry and "review before launch" notes). None of it appears in the production build.

The forms need the Cloudflare runtime. To test them locally, see [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md).

## Build for production

```powershell
npm run build
```

This type-checks the project, builds the static site into `dist/` and writes `dist/_headers`, which holds the security headers and a script fingerprint for the Content Security Policy. The build stops if a server secret appears in the output.

To preview the production build together with the form Function:

```powershell
npm run pages:dev
```

Then open <http://localhost:8788>.

## Tests

```powershell
npm test                          # unit tests: form rules and the email Function
npx playwright install chromium   # first time only
npm run test:e2e                  # browser tests on the built site (run npm run build first)
```

Results from the last full run are recorded in [docs/TESTING.md](docs/TESTING.md).

## Deploy

The site deploys to **Cloudflare Pages** from GitHub.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | set the `NODE_VERSION` variable to `24` |

Step-by-step instructions, including the custom domain, are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Common tasks

| I want to… | Do this |
| --- | --- |
| Change phone, email, WhatsApp or social links | Edit `src/config/site.ts` |
| Mark a Business Suite feature as confirmed | Edit `src/content/business-suite-features.yaml` |
| Add a course, project, article or FAQ | See [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) |
| Hide prices | Set `showPricing: false` in `src/config/site.ts` |
| Turn on search indexing | Set `PUBLIC_ALLOW_INDEXING=true` in Cloudflare (production only) |
| Regenerate logo files after a logo change | Replace `scripts/brand/source/ilelah-logo-source.png`, then `npm run brand` |

## Documentation

| File | Contents |
| --- | --- |
| [LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md) | **Start here.** Decisions and checks before going live |
| [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | What each folder and file is for |
| [CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) | Editing text; adding services, courses, projects, articles, FAQs |
| [BRAND_GUIDE.md](docs/BRAND_GUIDE.md) | Logo, colours, typography and usage rules |
| [ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) | Every setting and secret, and where to get it |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | GitHub, Cloudflare Pages, domain, DNS, HTTPS, rollback |
| [EMAIL_SETUP.md](docs/EMAIL_SETUP.md) | Mailboxes, MX, SPF, DKIM, DMARC and form email delivery |
| [SECURITY.md](docs/SECURITY.md) | Security design and how to report a problem |
| [PRIVACY_REVIEW.md](docs/PRIVACY_REVIEW.md) | Data collected, processors and legal review items |
| [TESTING.md](docs/TESTING.md) | Test commands, coverage and latest results |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common problems and fixes |
| [BACKUP_AND_RECOVERY.md](docs/BACKUP_AND_RECOVERY.md) | What to back up and how to roll back |
