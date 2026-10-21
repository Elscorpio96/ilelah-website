/**
 * Structured data (schema.org JSON-LD) builders.
 * Only verified, visible facts go in here: no ratings, reviews, opening
 * hours, street address or prices that the page does not show.
 */
import { site, activeSocialLinks } from '@/config/site';

export function organizationSchema(siteUrl: URL) {
  const sameAs = activeSocialLinks().map((s) => s.href);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': new URL('/#organization', siteUrl).href,
    name: site.name,
    ...(site.legalEntity ? { legalName: site.legalEntity } : {}),
    url: siteUrl.href,
    logo: new URL('/brand/ilelah-mark-1024.png', siteUrl).href,
    slogan: site.tagline,
    description: site.description,
    email: site.contact.email,
    telephone: site.contact.phone,
    founder: { '@type': 'Person', name: site.founder.name, jobTitle: site.founder.role },
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.location.city,
      addressRegion: site.location.region,
      addressCountry: site.location.countryCode,
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteSchema(siteUrl: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': new URL('/#website', siteUrl).href,
    name: site.name,
    url: siteUrl.href,
    publisher: { '@id': new URL('/#organization', siteUrl).href },
    inLanguage: 'en-NG',
  };
}

export function breadcrumbSchema(siteUrl: URL, crumbs: { label: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: new URL(c.href, siteUrl).href,
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}

export function articleSchema(siteUrl: URL, a: { title: string; description: string; path: string; published: Date; updated?: Date; author: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    mainEntityOfPage: new URL(a.path, siteUrl).href,
    datePublished: a.published.toISOString().slice(0, 10),
    ...(a.updated ? { dateModified: a.updated.toISOString().slice(0, 10) } : {}),
    author: { '@type': 'Person', name: a.author },
    publisher: { '@id': new URL('/#organization', siteUrl).href },
    image: new URL('/og-default.png', siteUrl).href,
  };
}

export function softwareSchema(siteUrl: URL, p: { name: string; description: string; path: string; os: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: p.name,
    description: p.description,
    url: new URL(p.path, siteUrl).href,
    applicationCategory: 'BusinessApplication',
    operatingSystem: p.os,
    publisher: { '@id': new URL('/#organization', siteUrl).href },
  };
}
