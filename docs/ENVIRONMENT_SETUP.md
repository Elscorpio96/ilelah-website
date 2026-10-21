# Environment setup

The site has two kinds of settings.

| Kind | Prefix | Where it ends up | Examples |
| --- | --- | --- | --- |
| **Public build settings** | `PUBLIC_` | Inside the public HTML. Anyone can see them. | site URL, Turnstile **site** key |
| **Server secrets** | none | Only inside the Cloudflare Function. Never sent to browsers. | Resend API key, Turnstile **secret** key |

**Rule:** never put a secret in a variable whose name starts with `PUBLIC_`, and never type a secret into a file that is committed to Git. The build stops if a known secret value appears in the output.

## Variables

| Variable | Kind | Required | Purpose | Where to get it |
| --- | --- | --- | --- | --- |
| `NODE_VERSION` | build | yes (Cloudflare) | Node.js version for the build | Set to `24` |
| `PUBLIC_SITE_URL` | public | yes | The one canonical address, used for canonical links, sitemap and social previews | `https://www.ilelahtech.com` |
| `PUBLIC_ALLOW_INDEXING` | public | yes | `true` lets search engines index the site. Anything else blocks them. | `false` until launch, then `true` on Production only |
| `PUBLIC_TURNSTILE_SITE_KEY` | public | recommended | Shows the Turnstile check on forms | Cloudflare → Turnstile |
| `PUBLIC_CF_ANALYTICS_TOKEN` | public | optional | Turns on Cloudflare Web Analytics (cookieless page views) | Cloudflare → Web Analytics |
| `RESEND_API_KEY` | secret | **yes, for forms** | Sends enquiry emails | Resend → API Keys |
| `ENQUIRY_TO_EMAIL` | secret | **yes, for forms** | Inbox(es) that receive enquiries, comma-separated | Your mailbox |
| `ENQUIRY_FROM_EMAIL` | secret | **yes, for forms** | Sender name and address on enquiry emails; must be on a domain verified in Resend | e.g. `Ilelah Website <website@ilelahtech.com>` |
| `TURNSTILE_SECRET_KEY` | secret | recommended | Lets the Function verify the Turnstile check | Cloudflare → Turnstile |
| `ALLOWED_ORIGINS` | secret | optional | Extra addresses allowed to post the form (preview URLs) | Your preview address |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW` | secret | optional | Submissions per IP per window (defaults 5 and 600 seconds) | Leave unset |
| `RATE_LIMIT_KV` | binding | optional | KV namespace for site-wide rate limiting | See DEPLOYMENT.md |

If `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL` or `ENQUIRY_FROM_EMAIL` is missing, the form **does not pretend to work**. Visitors see "Our online form is not accepting messages at the moment", plus your phone, email and WhatsApp details.

If `TURNSTILE_SECRET_KEY` is missing, the Function skips the Turnstile check, but the honeypot, timing check, validation and rate limit still apply. Set both Turnstile keys before launch.

## Getting each value

### Resend (form email delivery)

1. Sign up at <https://resend.com>. The free tier covers 3,000 emails a month and 100 a day, which is far more than an enquiry form needs.
2. **Domains** → **Add domain** → `ilelahtech.com`. Resend shows DNS records (DKIM, plus SPF and MX for a sending subdomain). Add them in Cloudflare DNS exactly as shown, then click **Verify**. Details are in EMAIL_SETUP.md.
3. **API Keys** → **Create API key** → permission **Sending access**, domain `ilelahtech.com`. Copy the key (it starts with `re_`). You will only see it once.
4. Add it in Cloudflare Pages as the secret `RESEND_API_KEY`.

Until your domain is verified in Resend, you cannot send from `@ilelahtech.com`. Resend's testing sender only delivers to your own Resend account email, which is enough for a first test.

### Cloudflare Turnstile (spam protection)

1. Cloudflare dashboard → **Turnstile** → **Add widget**.
2. Name: `Ilelah website forms`. Hostnames: `ilelahtech.com`, `www.ilelahtech.com`, and your `*.pages.dev` address for previews.
3. Widget mode: **Managed**.
4. Copy the **Site key** → `PUBLIC_TURNSTILE_SITE_KEY`. Copy the **Secret key** → secret `TURNSTILE_SECRET_KEY`.

### Cloudflare Web Analytics (optional)

1. Cloudflare dashboard → **Analytics & Logs** → **Web Analytics** → **Add a site** → `www.ilelahtech.com`.
2. Copy the token from the JavaScript snippet (`"token": "…"`) → `PUBLIC_CF_ANALYTICS_TOKEN`.
3. Redeploy. The privacy policy updates automatically to mention it.

Cloudflare Web Analytics counts page views without cookies. It does **not** record custom events such as "form submitted". The site raises these events (see `src/lib/track.ts`) without sending them anywhere. If you later want event tracking, choose a privacy-respecting tool, connect it in `window.ilelahTrack`, and update the privacy policy.

## Testing the forms on your computer

1. Build the site: `npm run build`
2. Copy `.dev.vars.example` to `.dev.vars` and fill in at least `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL` and `ENQUIRY_FROM_EMAIL`:

   ```powershell
   Copy-Item .dev.vars.example .dev.vars
   notepad .dev.vars
   ```

3. Start the local Cloudflare runtime: `npm run pages:dev`
4. Open <http://localhost:8788/contact/>, wait a few seconds, and send a message.

`.dev.vars` is ignored by Git. Delete it when you are done if the computer is shared.

For local build settings (rarely needed), copy `.env.example` to `.env`.
