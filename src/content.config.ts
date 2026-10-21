/**
 * Content collections: the editable content of the site.
 * Each schema documents the fields a file must have. `npm run build` fails
 * with a clear message if a file is missing a required field.
 * See docs/CONTENT_GUIDE.md for step-by-step editing instructions.
 */
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const iconNames = z.enum([
  'code', 'globe', 'mobile', 'support', 'pen', 'school', 'academy', 'stock', 'chat', 'mail', 'call', 'check', 'pin',
  'clock', 'shield', 'receipt', 'chart', 'users', 'offline', 'cloud', 'exam', 'network', 'printer',
]);

/** Services under /services/<slug>/ */
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    /** Shorter name used in lists and the enquiry form */
    shortTitle: z.string(),
    /** One or two sentences: what the service is, in plain words */
    summary: z.string(),
    /** Page <meta> description, max ~160 characters */
    description: z.string().max(170),
    icon: iconNames,
    order: z.number(),
    /** Value sent with enquiries started from this page */
    enquiryKey: z.string(),
    whoFor: z.array(z.string()),
    includes: z.array(z.object({ title: z.string(), text: z.string() })),
    deliverables: z.array(z.string()).default([]),
    process: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    /** How the work is delivered: remote, on-site, or both */
    delivery: z.object({ remote: z.string().optional(), onsite: z.string().optional() }).optional(),
    draft: z.boolean().default(false),
  }),
});

/** Digital Academy courses under /academy/<slug>/ */
const courses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    description: z.string().max(170),
    order: z.number(),
    /**
     * register-interest: availability, schedule, format and fee not confirmed yet
     * open: enrolment confirmed (fill in duration, delivery and fee first)
     */
    status: z.enum(['register-interest', 'open']).default('register-interest'),
    audience: z.array(z.string()),
    outcomes: z.array(z.string()),
    topics: z.array(z.string()),
    prerequisites: z.string(),
    /** Leave null until confirmed. Never guess. */
    duration: z.string().nullable().default(null),
    delivery: z.string().nullable().default(null),
    /** Fee in naira. null = not published */
    feeNgn: z.number().nullable().default(null),
    draft: z.boolean().default(false),
  }),
});

/** Portfolio projects under /portfolio/<slug>/ */
const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      category: z.enum(['Software', 'Websites', 'Education technology', 'Mobile apps', 'Design and branding', 'ICT']),
      summary: z.string(),
      description: z.string().max(170),
      problem: z.string(),
      solution: z.string(),
      role: z.string(),
      /** Only technologies the owner has confirmed */
      technologies: z.array(z.string()).default([]),
      status: z.enum(['product', 'production', 'prototype', 'internal', 'demonstration']),
      /** Measured, verified results only. Leave empty otherwise. */
      results: z.array(z.string()).default([]),
      /** Real screenshots only. Each needs alt text. */
      images: z.array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() })).default([]),
      /** Client or subject named publicly? Requires written permission. */
      clientNamed: z.boolean().default(false),
      relatedLink: z.object({ label: z.string(), href: z.string() }).optional(),
      order: z.number(),
      /** Must be true (owner and, where relevant, client approval) to appear on the live site */
      approved: z.boolean().default(false),
    }),
});

/** Insights (articles) under /insights/<slug>/ */
const insights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(170),
    summary: z.string(),
    category: z.enum(['Business software', 'Education technology', 'Websites', 'ICT', 'Digital skills', 'Security']),
    author: z.string(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

/** Frequently asked questions (src/content/faqs.yaml) */
const faqs = defineCollection({
  loader: file('./src/content/faqs.yaml'),
  schema: z.object({
    group: z.enum(['Working with us', 'Software and websites', 'Ilelah Business Suite', 'Schools and CBT', 'Training', 'Support and maintenance']),
    question: z.string(),
    answer: z.string(),
    order: z.number(),
  }),
});

/**
 * Ilelah Business Suite features (src/content/business-suite-features.yaml)
 * available   = confirmed in the current release source code
 * planned     = on the roadmap, shown with a "Planned" label
 * unverified  = not yet checked against the source; hidden on the live site
 */
const businessSuiteFeatures = defineCollection({
  loader: file('./src/content/business-suite-features.yaml'),
  schema: z.object({
    group: z.enum(['Selling', 'Stock and pricing', 'Staff and control', 'Reports', 'Receipts', 'Data and setup']),
    name: z.string(),
    text: z.string(),
    icon: iconNames,
    status: z.enum(['available', 'planned', 'unverified']),
    order: z.number(),
  }),
});

export const collections = { services, courses, portfolio, insights, faqs, businessSuiteFeatures };
