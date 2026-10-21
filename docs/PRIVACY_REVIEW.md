# Privacy review

Prepared for your legal adviser's review. This is **not legal advice**, and having a privacy page does not by itself mean the business complies with the **Nigeria Data Protection Act 2023 (NDPA)** or other laws.

## What the website collects

| Data | Source | Purpose | Stored where | Required? |
| --- | --- | --- | --- | --- |
| Name, email | Enquiry forms | Reply to the enquiry | Business inbox (via Resend) | Yes |
| Phone / WhatsApp | Enquiry forms | Reply by phone or WhatsApp if chosen | Business inbox | Only if phone or WhatsApp contact is chosen |
| Organisation, country | Enquiry forms | Understand the enquiry | Business inbox | Optional (country defaults to Nigeria) |
| Service, course, message, desired outcome, budget, timeline, contact preference | Enquiry forms | Prepare a reply or quote | Business inbox | Message and service required |
| Consent tick | Enquiry forms | Record agreement to be contacted | Business inbox | Yes |
| IP address | Every request | Security, rate limiting, Turnstile | Cloudflare (transient); a short-lived counter in KV if enabled | Automatic |
| Page views (no cookies) | Cloudflare Web Analytics, **only if enabled** | Visitor statistics | Cloudflare | Off by default |

**Not collected:** no cookies for tracking or advertising, no accounts, no payment data, no file uploads, no special-category data (the form asks visitors not to include it).

## Processors (third parties)

| Provider | Role | Location | Action needed |
| --- | --- | --- | --- |
| Cloudflare | Hosting, security, Turnstile, optional analytics | Global (including the US and EU) | Review Cloudflare's data processing terms (DPA) |
| Resend | Delivers form emails | United States | Review Resend's DPA and privacy policy |
| Mailbox provider (to be chosen) | Stores enquiry emails | Depends on provider | Name it in the privacy policy; review its DPA |

These are **cross-border transfers** under the NDPA. Your adviser should confirm the basis for transfer and whether any NDPC filing or registration applies to the business, for example registration as a data controller or processor of a particular class, or annual compliance audit returns, depending on the volume of data processed.

## Lawful basis (as drafted)

- Enquiry handling: consent (the tick box) and steps taken at the person's request before a contract
- Security processing (IP address): legitimate interests

## Retention (as drafted)

- Enquiries that do not lead to work: **deleted after 24 months.** You must actually do this; set a reminder.
- Client correspondence: for the working relationship plus any legally required period

## Rights

The policy lists access, correction, deletion, restriction, portability, objection, withdrawal of consent and complaint to the NDPC. You need a simple internal process:

1. Requests arrive at `walid@ilelahtech.com`
2. Confirm the requester's identity, using an email reply from the same address as a minimum
3. Search the inbox and any spreadsheets for their details
4. Act on the request and reply within the period the law requires. Ask your adviser for the current deadline.
5. Keep a short log of requests and actions

## Schools and student data

The website itself collects no student data. CBT and school-system **projects** do process student data, which is a separate and more significant obligation. Each school project should have a written agreement covering roles (school as controller, Ilelah Technologies as processor), security, access, retention, breach notification and deletion at the end of the contract. Review this with your adviser before the next school deployment.

## Items for legal review

- [ ] Exact legal entity name and contact details for the controller
- [ ] Lawful bases as drafted
- [ ] Retention periods
- [ ] International transfer wording and safeguards
- [ ] Whether a Data Protection Officer, NDPC registration or compliance audit applies
- [ ] Wording on children
- [ ] Terms of use: limitation of liability and governing law
- [ ] Processor agreements template for school and client projects

## When to update the privacy policy

Update it, and the `LAST_UPDATED` date in `src/pages/privacy.astro`, whenever you:

- turn on analytics or add any third-party script
- add a new form, field or data type
- change mailbox provider
- start storing enquiries anywhere other than email (a spreadsheet, CRM or database)
