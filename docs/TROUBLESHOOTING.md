# Troubleshooting

## Installing and building

**`npm install` fails, or the build says Node.js is not supported**
Astro 7 needs Node.js **22.23.4 or newer**. Run `node -v`. If it is older, install the current LTS from <https://nodejs.org>, close and reopen the terminal, then run `npm install` again.

**Cloudflare build fails with a Node.js version error**
Cloudflare's build image defaults to an older Node. Make sure `.nvmrc` (containing `24`) is committed, and set the variable `NODE_VERSION=24` in the Pages project for both Production and Preview. Retry the deployment.

**`npm run build` stops with "InvalidContentEntryDataError" or a content error**
A content file is missing a required field or has a typo. The message names the file and field. Common causes:

- a value containing `: ` that is not wrapped in double quotes
- tabs instead of spaces in YAML or front matter
- a `category`, `status` or `group` value that is not in the allowed list (`src/content.config.ts`)
- a description over 170 characters

**The build says a secret was found**
`scripts/postbuild.mjs` found a secret-looking value in the built site. Check you did not put a secret in a `PUBLIC_` variable or in a source file. Remove it, **rotate the key** (SECURITY.md) and rebuild.

**`npm run dev` shows red dashed outlines and "Review before launch" notes**
That is intentional. Development mode shows draft and unverified content so you can review it. The production build hides all of it.

## Forms

**The form says "Our online form is not accepting messages at the moment"**
`RESEND_API_KEY`, `ENQUIRY_TO_EMAIL` or `ENQUIRY_FROM_EMAIL` is missing in the environment you are testing. In Cloudflare, check Production **and** Preview variables, then retry the deployment, because variable changes apply only to new deployments. Locally, check `.dev.vars` and use `npm run pages:dev`, not `npm run dev`.

**"Your message could not be delivered just now"**
Resend refused the email. Check Resend → **Logs** for the reason. Usual causes:

- `ENQUIRY_FROM_EMAIL` uses a domain that is not verified in Resend
- the API key was deleted, or lacks access to that domain
- the daily free-tier limit (100) was reached

**"We could not confirm the security check"**
Turnstile failed. Check that the site key and secret key are a matching pair, and that the hostname you are on (including `*.pages.dev` previews) is listed in the Turnstile widget's hostnames.

**Enquiries are not arriving, but the form says sent**
Look in the inbox's spam folder and in Resend → Logs. If Resend shows "delivered", the issue is the receiving mailbox: add the sender to contacts, and check SPF, DKIM and DMARC (EMAIL_SETUP.md).

**Form submissions in development do nothing**
`npm run dev` does not run Cloudflare Functions, so `/api/enquiry` does not exist there. Use `npm run build` then `npm run pages:dev`.

**"Too many messages have been sent from your connection"**
The rate limit triggered: 5 per IP per 10 minutes. Wait 10 minutes. Many people sharing one network (for example a school) may hit it; raise `RATE_LIMIT_MAX` if needed.

## Domain and HTTPS

**The custom domain stays "Pending" or shows a certificate error**
Check that the DNS record Cloudflare created for the domain exists and is **proxied** (orange cloud). Certificate issue can take up to 24 hours. Make sure SSL/TLS mode is **Full (strict)**.

**`ilelahtech.com` does not redirect to `www`**
Add the redirect rule in DEPLOYMENT.md section 4.

**Old content still shows after deploying**
Hard-refresh the page (Ctrl + F5). If it persists, Cloudflare → Caching → **Purge Everything**.

## Search engines

**Google is not showing the site**
Check `https://www.ilelahtech.com/robots.txt` shows `Allow: /`. If it shows `Disallow: /`, set `PUBLIC_ALLOW_INDEXING=true` for Production and redeploy. Then submit the sitemap in Google Search Console. New sites can take days to weeks to appear.

**A preview (`pages.dev`) address appears in Google**
Previews send `X-Robots-Tag: noindex`, so they should drop out. To be thorough, add a redirect from the production `pages.dev` address to `www.ilelahtech.com` (Cloudflare Bulk Redirects).

## Tests

**`npx playwright test` cannot find a browser**
Run `npx playwright install chromium` once.

**End-to-end tests fail with "dist/sitemap-0.xml not found"**
Run `npm run build` first. The tests check the production build.

**A test fails after you edited content**
Read the message. The tests check things such as unique page titles, descriptions under 170 characters, working links and no draft content on the live build. Usually the content needs a small fix, not the test.
