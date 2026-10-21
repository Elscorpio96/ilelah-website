# Security

## Design summary

The site is deliberately small in attack surface:

- **Static pages.** No database, no logins, no admin dashboard, no file uploads, no payments.
- **One server endpoint:** `POST /api/enquiry`. `public/_routes.json` ensures only `/api/*` runs server code.
- **No secrets in the browser.** Only values prefixed `PUBLIC_` reach the HTML, and those are public by design. The build fails if a known secret value appears in `dist/`.

## Enquiry endpoint protections

Implemented in `functions/api/enquiry.ts` and `src/lib/enquiry.ts`, and covered by unit tests:

| Protection | Detail |
| --- | --- |
| Method check | Only POST; everything else gets 405 |
| Origin check | Browser posts from other websites are refused (403). This blocks cross-site form abuse. |
| Size limit | Bodies over 20 KB are refused |
| Rate limit | 5 submissions per IP per 10 minutes by default. Use a KV binding or WAF rule for site-wide enforcement (DEPLOYMENT.md). |
| Honeypot | A hidden field that bots fill in; such posts are silently dropped |
| Minimum fill time | Posts within 3 seconds of page load are silently dropped |
| Turnstile | Cloudflare's privacy-friendly bot check, verified server-side when `TURNSTILE_SECRET_KEY` is set |
| Validation | Every field checked on the server: type, length, allowed values, email and phone format; control characters stripped |
| Output escaping | Visitor input is HTML-escaped in the notification email; subject lines cannot contain line breaks |
| No relay | The Function emails **only** your configured inbox. It never sends confirmation emails to visitor-supplied addresses, so it cannot be abused to send spam to third parties. |
| Error handling | Visitors see plain messages; no stack traces or provider responses are returned or logged. Logs contain the status code and reference only, never the visitor's data. |
| No fake success | Success is shown only after Resend accepts the email |

## HTTP security headers

Generated into `dist/_headers` by `scripts/postbuild.mjs` on every build:

- **Content-Security-Policy:** scripts only from this site, Cloudflare Turnstile and Cloudflare Analytics. The single inline script (the menu) is allowed by its SHA-256 hash, which is recomputed automatically. `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` disabling camera, microphone, location, payment and USB
- `Strict-Transport-Security: max-age=31536000`. HSTS preload is not enabled; only add it once you are sure every subdomain will always use HTTPS.
- `Cross-Origin-Opener-Policy: same-origin`
- `X-Robots-Tag: noindex` on `*.pages.dev` addresses

`style-src` allows inline styles, which Astro uses for component styles. This is a common, low-risk trade-off, because styles cannot run code.

## Secret management

- Secrets live only in Cloudflare Pages → Settings → Environment variables, as **encrypted secrets**, and locally in `.dev.vars` (ignored by Git).
- `.env`, `.env.*` and `.dev.vars*` are in `.gitignore`. Only the `*.example` templates, which contain no real values, are committed.
- Give the Resend API key **Sending access** only, limited to your domain.
- Rotate keys if a laptop is lost, a collaborator leaves or a key is ever pasted somewhere public.

### If a secret is exposed

1. **Revoke it immediately** at the provider (Resend → API Keys → delete; Turnstile → rotate secret).
2. Create a new key and update it in Cloudflare. Redeploy.
3. If it was committed to Git, removing it in a later commit is **not enough**, because it stays in history. Treat it as compromised (step 1 already handles this), then clean the history with a tool such as `git filter-repo`, or recreate the repository.
4. Check the provider's logs for misuse.

## Dependencies

- Versions are pinned exactly in `package.json`, with `package-lock.json` committed.
- At handover, `npm audit` reported **0 vulnerabilities**.
- **Astro 7.4.2** is used because earlier versions, including all of Astro 6, have published security advisories (XSS and an image-optimisation RCE). Do not downgrade.
- Quarterly: run `npm outdated` and `npm audit`, update on a branch, run `npm run build`, `npm test` and `npm run test:e2e`, then deploy.

## Accounts

Turn on two-factor authentication for GitHub, Cloudflare, Resend, the domain registrar and the mailbox provider. Keep the GitHub repository **private**.

## Reporting a security problem

If you find a security issue with the website, email **walid@ilelahtech.com** with the subject "Security". Include what you found and how to reproduce it. Please do not test against the live form in ways that send large numbers of messages. We aim to acknowledge reports promptly.

Consider publishing a `/.well-known/security.txt` file once the mailbox is live (<https://securitytxt.org>).
