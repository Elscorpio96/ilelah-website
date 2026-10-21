# Deployment

The site is hosted on **Cloudflare Pages**. Static pages are served from Cloudflare's network. The enquiry form runs as a **Pages Function** (`functions/api/enquiry.ts`) on the same deployment, so no separate server or Workers project is needed.

> Never change DNS, delete a deployment or switch production traffic without being ready to verify the result straight away. Each step below says how to check it worked.

## 1. Put the code on GitHub

Create a **new, private** repository for the website (for example `ilelah-website`). Do not reuse the Ilelah Business Suite repository.

```powershell
cd C:\Users\HP\Documents\ilelah-website
git init -b main
git add .
git commit -m "Ilelah Technologies website"
git remote add origin https://github.com/YOUR-USERNAME/ilelah-website.git
git push -u origin main
```

Before pushing, run `git status` and confirm that **no** `.env`, `.dev.vars` or `node_modules` files are listed. `.gitignore` excludes them, but check anyway.

## 2. Create the Cloudflare Pages project

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Choose the `ilelah-website` repository.
3. Build settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | Astro (or None) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | *(leave empty)* |

4. **Environment variables** (Production). Add these before the first build:

   | Name | Type | Value |
   | --- | --- | --- |
   | `NODE_VERSION` | Text | `24` |
   | `PUBLIC_SITE_URL` | Text | `https://www.ilelahtech.com` |
   | `PUBLIC_ALLOW_INDEXING` | Text | `false` *(change to `true` only at launch)* |
   | `PUBLIC_TURNSTILE_SITE_KEY` | Text | from Turnstile |
   | `RESEND_API_KEY` | **Secret** | from Resend |
   | `ENQUIRY_TO_EMAIL` | **Secret** | inbox that receives enquiries |
   | `ENQUIRY_FROM_EMAIL` | **Secret** | e.g. `Ilelah Website <website@ilelahtech.com>` |
   | `TURNSTILE_SECRET_KEY` | **Secret** | from Turnstile |

   Add the same variables for **Preview**, but keep `PUBLIC_ALLOW_INDEXING=false` there permanently. See ENVIRONMENT_SETUP.md for where each value comes from.

   Cloudflare's build image defaults to an older Node.js. The project's `.nvmrc` file asks for Node 24, and `NODE_VERSION=24` makes the choice explicit.

5. **Save and Deploy.** When the build finishes you get an address like `https://ilelah-website.pages.dev`.

**Check:** open the `.pages.dev` address. Every page should load. Run the checks in LAUNCH_CHECKLIST.md section 3.

Changing a variable does not change a live deployment. After editing variables, open **Deployments** → latest → **Retry deployment**, or push a new commit.

## 3. Preview deployments

Every branch you push other than `main` gets its own preview address. Use a branch for any significant change:

```powershell
git checkout -b update-courses
# edit files, then:
npm run build
git add .
git commit -m "Update course details"
git push -u origin update-courses
```

Open the preview address shown in Cloudflare, check it, then merge the branch into `main` on GitHub to publish.

Preview and `.pages.dev` addresses send an `X-Robots-Tag: noindex` header (from `dist/_headers`), so they stay out of search results.

The form works on preview addresses because it always accepts posts from the address it is served on. For the Turnstile check to load there, the preview hostname must be listed in the Turnstile widget's hostnames (ENVIRONMENT_SETUP.md).

## 4. Connect the custom domain

The domain `ilelahtech.com` must be registered first. Easiest: register it with **Cloudflare Registrar**, or move its nameservers to Cloudflare, so DNS and hosting are managed in one place.

### Check availability and register

1. Search the domain at your chosen registrar (Cloudflare Registrar, Namecheap, or a Nigerian registrar for `.ng`).
2. Register it in **your own name and email address**, not a developer's.
3. Turn on auto-renew and two-factor authentication on the registrar account.

### Point the domain at the site

1. Cloudflare Pages project → **Custom domains** → **Set up a custom domain** → enter `www.ilelahtech.com` → follow the prompts. If the domain's DNS is on Cloudflare, the CNAME record is created for you.
2. Repeat for `ilelahtech.com` (the apex, without www).
3. Wait for both to show **Active**. HTTPS certificates are issued automatically, usually within minutes. It can take up to 24 hours.

### Redirect the apex to www

So that there is one canonical address:

1. Cloudflare dashboard → the `ilelahtech.com` zone → **Rules** → **Redirect Rules** → **Create rule**.
2. Use the template "Redirect from root to www", or:
   - When: Hostname equals `ilelahtech.com`
   - Then: Dynamic redirect, expression `concat("https://www.ilelahtech.com", http.request.uri.path)`, status **301**, preserve query string.

### Check HTTPS and redirects

```powershell
curl.exe -I https://www.ilelahtech.com/
curl.exe -I http://ilelahtech.com/
```

The first should return `HTTP/2 200` with a `content-security-policy` header. The second should redirect (301) to `https://www.ilelahtech.com/`. Also open the site in a browser and click the padlock to confirm the certificate is valid.

In Cloudflare → SSL/TLS, set the encryption mode to **Full (strict)** and turn on **Always Use HTTPS**.

## 5. Launch (turn on search indexing)

Only after LAUNCH_CHECKLIST.md sections 1–4 are complete:

1. Pages project → Settings → Environment variables → **Production** → set `PUBLIC_ALLOW_INDEXING` to `true`.
2. Retry the latest production deployment.
3. Check `https://www.ilelahtech.com/robots.txt`: it should say `Allow: /` and list the sitemap.

## 6. Rollback

If a deployment breaks something:

1. Pages project → **Deployments**.
2. Find the last good deployment → **⋯** → **Rollback to this deployment**.

This switches production back instantly. Then fix the problem in code, test with `npm run build` and the tests, and push again.

## 7. Post-deployment verification

After every production deployment:

- [ ] Homepage, Business Suite, Quote and Contact pages load
- [ ] Mobile menu opens and closes on a phone
- [ ] One test enquiry arrives in the inbox (send it with your own details and mention "test")
- [ ] `robots.txt` matches the intended indexing state
- [ ] No unexpected "Draft" content is visible

## Rate limiting (recommended)

The form Function limits each IP address to 5 submissions per 10 minutes. Without extra setup, the counter is kept per Cloudflare location, which deters casual abuse. For stronger protection, do one of these:

- **WAF rate limiting rule (simplest):** zone → Security → WAF → Rate limiting rules → create a rule for URI path equals `/api/enquiry`, method POST, e.g. 10 requests per minute per IP → Block. Check that your Cloudflare plan includes it.
- **KV namespace:** Workers & Pages → KV → create a namespace `ilelah-rate-limit`, then Pages project → Settings → Bindings → add **KV namespace**, variable name `RATE_LIMIT_KV`. Redeploy.
