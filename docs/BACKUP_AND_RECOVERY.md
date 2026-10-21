# Backup and recovery

The website has no database, so recovery is simple: **the GitHub repository is the website.** Anything that is not in the repository needs its own backup.

## What to back up

| Item | Where it lives | How to back it up |
| --- | --- | --- |
| Website code and content | GitHub repository | Already versioned. Also keep the project ZIP, and download a fresh ZIP from GitHub (Code → Download ZIP) every few months. |
| Logo source files | `public/brand/` and `scripts/brand/` in the repository | Included in the repository. Also keep a copy with your design files. |
| Environment variable **names** and settings | Cloudflare Pages settings | Documented in ENVIRONMENT_SETUP.md. Keep a private note of which values are set where, **not** the secrets themselves. |
| Secrets (API keys) | Cloudflare (encrypted) | Do not back up. If lost, create new keys at Resend and Turnstile and update Cloudflare. |
| Enquiry emails | Your mailbox | Use your mailbox provider's export or backup feature, and keep important client correspondence in a client folder |
| Domain registration | Registrar account | Auto-renew on; registrar account has 2FA and a recovery email outside the domain |
| DNS records | Cloudflare | Cloudflare → DNS → **Export**. Save the file after any DNS change. |
| Account recovery | Registrar, Cloudflare, GitHub, Resend, mailbox | Save each service's 2FA **recovery codes** somewhere safe offline |

## Recovering from common situations

### A bad deployment broke the site

Cloudflare Pages → Deployments → last good deployment → **Rollback to this deployment**. This is instant. Then fix the code and redeploy.

### A content change needs undoing

On GitHub, open the commit and use **Revert**, or locally:

```powershell
git log --oneline                # find the commit
git revert <commit-id>
git push
```

### The laptop is lost or broken

1. Change passwords and revoke sessions for GitHub, Cloudflare, Resend and email.
2. Rotate the Resend API key and Turnstile secret (SECURITY.md).
3. On a new computer: install Node.js and Git, then `git clone` the repository and run `npm install`.

### The GitHub repository is deleted

Re-create it from your latest ZIP or local copy (`git init`, commit, push), then reconnect it in Cloudflare Pages → Settings → Builds → **Git repository**.

### DNS records are deleted or changed

Cloudflare → DNS → **Import** the exported file, or re-create the records from DEPLOYMENT.md and EMAIL_SETUP.md. Then check the website and send a test email.

### The domain expires

Renew it immediately at the registrar. Most registrars allow recovery during a grace period, but fees can rise sharply once that passes. This is why auto-renew matters.

## Regular routine

| When | Task |
| --- | --- |
| After any DNS change | Export DNS records |
| Monthly | Confirm the latest deployment is healthy and a test enquiry arrives |
| Quarterly | Download a ZIP of the repository; update dependencies (SECURITY.md); check domain renewal date |
| Yearly | Review who has access to each account; remove anyone who no longer needs it |
