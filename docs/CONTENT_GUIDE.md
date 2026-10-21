# Content guide

All website text lives in plain files you can edit in any text editor. **Visual Studio Code** is recommended because it highlights mistakes. After any change:

```powershell
npm run dev      # look at the change at http://localhost:4321
npm run build    # confirm nothing is broken before publishing
```

Then commit and push (see DEPLOYMENT.md). If a required field is missing or misspelled, `npm run build` stops and names the file and field.

## Where things are

| Content | File |
| --- | --- |
| Phone, email, WhatsApp, location, founder, prices, social links | `src/config/site.ts` |
| Menu items and footer links | `src/config/navigation.ts` |
| The eight service divisions on Home, Services and About | `src/config/divisions.ts` |
| Service pages | `src/content/services/*.md` |
| Courses | `src/content/courses/*.md` |
| Portfolio projects | `src/content/portfolio/*.md` |
| Articles (Insights) | `src/content/insights/*.md` |
| FAQs | `src/content/faqs.yaml` |
| Business Suite features | `src/content/business-suite-features.yaml` |
| Homepage, About, EduTech, Business Suite and other page text | `src/pages/*.astro` (the text sits between the HTML tags) |

### Writing tips for the `.md` and `.yaml` files

- The part between the two `---` lines is the **front matter**: one `field: value` per line.
- If a value contains a colon followed by a space (`: `), wrap it in double quotes: `summary: "Courses: practical and hands-on"`.
- Lists use `  - item` (two spaces, a dash, a space).
- Indentation matters in front matter and YAML. Use spaces, not tabs.
- Below the second `---` is ordinary text. Leave a blank line between paragraphs. `## Heading` makes a heading, and `[link text](/contact/)` makes a link.

## Common edits

### Change contact details

Edit `src/config/site.ts`:

```ts
contact: {
  email: 'walid@ilelahtech.com',
  phone: '+2347066793518',          // used for tel: links (no spaces)
  phoneDisplay: '+234 706 679 3518', // shown to visitors
  whatsapp: '2347066793518',         // digits only; set to null to hide WhatsApp everywhere
```

### Add a social media link

Only once the account exists. In `src/config/site.ts`, replace `null` with the full address:

```ts
linkedin: 'https://www.linkedin.com/company/your-exact-page',
```

It then appears in the footer, on the contact page and in the structured data.

### Set the legal entity name (after CAC confirmation)

```ts
legalEntity: 'ILELAH TECHNOLOGIES LIMITED' as string | null, // exact registered name
registrationNumber: 'RC 0000000' as string | null,           // only if you want it published
```

### Confirm Business Suite features

Open `src/content/business-suite-features.yaml`. For each feature, check that it exists in the release customers receive, then change:

```yaml
  status: unverified
```

to `available` (it is in the current release) or `planned` (on the roadmap; shown with a "Planned" label). Features left `unverified` stay hidden on the live site. Once at least one feature is `available` or `planned`, the "being confirmed" notice is replaced by the feature list.

Add a feature by copying an entry and giving it a new `id` (lowercase, hyphens) and `order`. Available icons are listed in `src/lib/icons.ts`.

### Change or hide Business Suite prices

In `src/config/site.ts`:

```ts
businessSuitePricing: {
  showPricing: true,   // false hides prices everywhere
  currency: 'NGN',
  offline: 50000,
  online: 60000,
},
```

### Add a course

1. Copy an existing file in `src/content/courses/`, for example `python-programming.md`, to a new name such as `data-analysis-excel.md`. The file name becomes the web address: `/academy/data-analysis-excel/`.
2. Edit every field. Keep `status: register-interest` until the course is confirmed.
3. To open enrolment, fill in the details first, then change the status:

   ```yaml
   status: open
   duration: "6 weeks, two evenings a week"
   delivery: "In person in Bauchi, or online"
   feeNgn: 45000
   ```

Never publish dates, fees, certificates or instructor credentials that are not confirmed.

### Add a portfolio project

1. Copy `src/content/portfolio/ilelah-business-suite.md` to a new file, e.g. `acme-stores-website.md`.
2. Fill in the fields. `status` must be one of `product`, `production`, `prototype`, `internal` or `demonstration`.
3. Only list **measured, verified** results under `results`.
4. Only set `clientNamed: true` and use the client's name if you have their **written permission**.
5. Set `approved: true` when it is ready. Unapproved projects show only in `npm run dev`.

**Adding real screenshots:**

1. Put the images in `src/assets/portfolio/` (create the folder), e.g. `src/assets/portfolio/business-suite-sales.png`. Remove any customer data from screenshots first.
2. In the project file:

   ```yaml
   images:
     - src: ../../assets/portfolio/business-suite-sales.png
       alt: "Sales screen showing a cart with three items and the total"
       caption: "Recording a sale (version 1.8)"
   ```

Images are automatically resized and compressed at build time.

### Publish the CBT project

`src/content/portfolio/school-cbt-system.md` is ready but hidden. Review the wording and status, keep the school unnamed unless you have its written permission, then set `approved: true`.

### Add an article

1. Create `src/content/insights/your-article-slug.md`:

   ```markdown
   ---
   title: "Your article title"
   description: "One-sentence summary for search results, under 160 characters."
   summary: "One or two sentences shown on the Insights page."
   category: Business software
   author: Walid Bello Ilelah
   published: 2026-11-15
   draft: true
   ---

   Your article text…
   ```

2. `category` must be one of: Business software, Education technology, Websites, ICT, Digital skills, Security.
3. Drafts (`draft: true`) appear only in `npm run dev`. Change to `draft: false`, or delete the line, to publish.

### Add or edit an FAQ

In `src/content/faqs.yaml`, copy an entry, give it a unique `id`, pick a `group` from the list at the top of `src/content.config.ts` and set `order`. Answers must not promise prices, timelines or support hours that are not agreed.

### Add a new service page

Copy a file in `src/content/services/`, change all fields (including a unique `enquiryKey` from: software, website, mobile, business-suite, edutech, ict, design, training, other) and its `order`. Add it to `serviceLinks` in `src/config/navigation.ts` so it appears in the menu, and to `src/config/divisions.ts` if it is a new division.

## Content rules

These protect the business's credibility:

- No invented clients, testimonials, statistics, awards, certifications, team members or years in business
- No school or client named without written permission
- No student or customer data, even in screenshots
- Prices only as approved, and always "confirmed in writing"
- Courses are "practical skills training", not accredited qualifications
- Mock-ups, if ever used, must be clearly labelled as mock-ups
