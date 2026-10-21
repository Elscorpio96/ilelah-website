# Email setup

Two separate things use email:

1. **Your mailboxes**, such as `walid@ilelahtech.com`, for reading and sending everyday email. These need a mailbox provider.
2. **The website's enquiry emails**, sent automatically by the form through **Resend** (see ENVIRONMENT_SETUP.md).

Both use DNS records on `ilelahtech.com`. They do not conflict if set up as below.

> None of the addresses below exist yet. The website publishes `walid@ilelahtech.com`, so that mailbox **must** be working before launch.

## 1. Choose a mailbox provider

| Option | Approximate cost | Good for | Notes |
| --- | --- | --- | --- |
| **Zoho Mail (Mail Lite)** | low per-user monthly fee | Lowest-cost proper mailbox | Web, mobile apps and IMAP. Zoho has offered a limited free plan in some regions; check current terms. |
| **Google Workspace (Business Starter)** | higher per-user monthly fee | Teams already living in Gmail, Docs and Drive | Strong spam filtering and familiar apps |
| **Microsoft 365 Business Basic** | similar to Google | Teams using Word, Excel and Outlook | Includes Teams and OneDrive |
| Cloudflare Email Routing | free | Forwarding only | Forwards `@ilelahtech.com` mail to another inbox, but **cannot send** as that address. Fine as a stop-gap, not as your main mailbox. |

Prices change and vary by country and billing currency, so check each provider's pricing page before buying.

**Recommendation for now:** one paid mailbox (`walid@ilelahtech.com`) on Zoho Mail Lite or Google Workspace. Make the other addresses **aliases** of it at no extra cost. Add separate mailboxes later when other people need their own.

| Address | Set up as | Delivered to |
| --- | --- | --- |
| `walid@ilelahtech.com` | Mailbox | Walid |
| `info@ilelahtech.com` | Alias | Walid |
| `sales@ilelahtech.com` | Alias | Walid |
| `support@ilelahtech.com` | Alias | Walid |
| `training@ilelahtech.com` | Alias | Walid |
| `admin@ilelahtech.com` | Alias | Walid. Use this for account sign-ups (registrar, Cloudflare, Resend) so they are not tied to one person. |

## 2. DNS records

Add these in Cloudflare → `ilelahtech.com` → **DNS** → **Records**. Your provider shows the exact values; the ones below show the shape. Leave mail records **DNS only** (grey cloud).

### MX: where incoming mail goes

From your mailbox provider, for example:

| Type | Name | Mail server | Priority |
| --- | --- | --- | --- |
| MX | `@` | *(provider value 1)* | 10 |
| MX | `@` | *(provider value 2)* | 20 |

Remove any old MX records, including Cloudflare Email Routing records if you used it before.

### SPF: who may send as @ilelahtech.com

Only **one** SPF record is allowed on the root domain. Use your mailbox provider's value, for example:

| Type | Name | Content |
| --- | --- | --- |
| TXT | `@` | `v=spf1 include:<provider-spf-domain> ~all` |

Resend sends from a **subdomain** (it shows records such as `send.ilelahtech.com`), so you do **not** add Resend to this root SPF record. Add Resend's own records separately (below).

### DKIM: signatures that prove mail is genuine

- **Mailbox provider:** generate DKIM in the provider's admin panel and add the TXT (or CNAME) record it shows, for example `zmail._domainkey` or `google._domainkey`.
- **Resend:** add the DKIM TXT record Resend shows (for example `resend._domainkey`) and its records for the sending subdomain. Click **Verify** in Resend.

### DMARC: what receivers should do with failures

Start in monitoring mode:

| Type | Name | Content |
| --- | --- | --- |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:admin@ilelahtech.com; adkim=r; aspf=r` |

After 2–4 weeks of correct delivery, tighten to `p=quarantine`, and later `p=reject`.

### Check your records

- <https://mxtoolbox.com/SuperTool.aspx>: check MX, SPF, DKIM and DMARC for `ilelahtech.com`
- Send an email from your new mailbox to a Gmail address, open it, choose **Show original**, and confirm SPF, DKIM and DMARC all say **PASS**

## 3. Configure the website form

In Cloudflare Pages secrets:

- `ENQUIRY_FROM_EMAIL` = `Ilelah Website <website@ilelahtech.com>` (any address on the Resend-verified domain; it does not need a mailbox)
- `ENQUIRY_TO_EMAIL` = `walid@ilelahtech.com`. Until the domain mailbox exists, you can temporarily use another inbox you control.

Each enquiry email has:

- **Subject:** type, service, name and reference, e.g. `Quote request: Website design and development from Amina Yusuf [ILT-261021-K7QX]`
- **Reply-To:** the visitor's address. Press Reply to answer them directly.

## 4. Security for the mailbox

- Turn on **two-factor authentication** for the mailbox admin account and every user
- Add a **recovery phone and recovery email** that are not on the same domain
- Use a password manager and a unique password
- Keep the registrar, Cloudflare and mailbox admin logins on `admin@ilelahtech.com` with two-factor authentication

## 5. Email signature

A ready-made signature is in `docs/brand-templates/email-signature.html`. Open it in a browser, select the signature, copy, and paste it into your mail program's signature settings. The logo loads from the live website, so it appears once the site is deployed.

## 6. Verify before claiming it works

- [ ] Mail from Gmail to `walid@`, `info@`, `sales@`, `support@`, `training@` and `admin@` all arrives
- [ ] Mail from `walid@ilelahtech.com` to Gmail arrives in the inbox (not spam) with SPF, DKIM and DMARC passing
- [ ] A website enquiry arrives, and Reply goes to the visitor
