/**
 * Central business details for Ilelah Technologies.
 *
 * Every page, the footer, structured data and the legal pages read from this
 * file. Change a detail here once and it updates across the whole site.
 *
 * A value of `null` means "not confirmed yet": the site hides anything that
 * depends on it rather than showing a placeholder or a broken link.
 * See docs/CONTENT_GUIDE.md for how to edit this file.
 */

export interface SocialLinks {
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
  x: string | null;
  youtube: string | null;
  github: string | null;
  tiktok: string | null;
}

export const site = {
  name: 'Ilelah Technologies',
  shortName: 'Ilelah',
  tagline: 'Technology. Innovation. Solutions.',
  description:
    'Business software, school and CBT systems, websites, mobile apps, ICT support, design and digital skills training from Ilelah Technologies in Bauchi, Nigeria.',

  /**
   * Registered legal entity shown in the privacy policy and terms.
   * Leave null until the exact CAC-registered name is confirmed. While null,
   * the legal pages say "Ilelah Technologies" and flag the gap in the draft notice.
   */
  legalEntity: null as string | null,
  /** CAC registration number (RC/BN). Never guess this. */
  registrationNumber: null as string | null,

  founder: {
    name: 'Walid Bello Ilelah',
    role: 'Founder and CEO',
  },

  /**
   * Planned Islamic academy sub-brand. The name is not decided yet:
   * leave `name` null to show the neutral working title, then set it
   * (for example 'Ilelah International Islamic Academy') once chosen.
   */
  islamicAcademy: {
    name: null as string | null,
    workingTitle: 'Islamic Academy',
  },

  location: {
    /** Public wording only. Do not add a street address without approval. */
    display: 'Based in Bauchi, Nigeria',
    city: 'Bauchi',
    region: 'Bauchi State',
    countryCode: 'NG',
    country: 'Nigeria',
  },

  contact: {
    email: 'walid@ilelahtech.com',
    /** E.164 format, used for tel: links */
    phone: '+2347066793518',
    /** Human-readable format */
    phoneDisplay: '+234 706 679 3518',
    /** Digits only, international format, for wa.me links. null hides WhatsApp. */
    whatsapp: '2347066793518' as string | null,
    whatsappGreeting: 'Hello Ilelah Technologies, I found you through your website and would like to ask about ',
  },

  /** Add exact profile URLs only once the accounts exist. null = hidden. */
  social: {
    linkedin: null,
    facebook: null,
    instagram: null,
    x: null,
    youtube: null,
    github: null,
    tiktok: null,
  } satisfies SocialLinks as SocialLinks,

  /**
   * Indicative Business Suite prices supplied by the owner (NGN).
   * Shown as "from" prices with a note that a quote confirms what is included.
   * Set showPricing to false to hide every price on the site.
   */
  businessSuitePricing: {
    showPricing: true,
    currency: 'NGN',
    offline: 50000,
    online: 60000,
  },

  /** Cloudflare Web Analytics beacon token. null keeps analytics switched off. */
  analyticsToken: (import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN as string | undefined) || null,

  /** Cloudflare Turnstile site key (public by design). null renders no widget. */
  turnstileSiteKey: (import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined) || null,

  /**
   * Search engines are told not to index the site unless this is true.
   * Set PUBLIC_ALLOW_INDEXING=true only on the verified production deployment.
   */
  allowIndexing: import.meta.env.PUBLIC_ALLOW_INDEXING === 'true',

  /** Draft content (unapproved projects, unverified features) is only shown in `npm run dev`. */
  showDrafts: import.meta.env.DEV,
} as const;

export function formatNaira(amount: number): string {
  return '₦' + amount.toLocaleString('en-NG');
}

export function whatsappLink(topic?: string): string | null {
  if (!site.contact.whatsapp) return null;
  const text = site.contact.whatsappGreeting + (topic ? topic + '.' : 'your services.');
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const activeSocialLinks = (): { label: string; href: string }[] => {
  const labels: Record<keyof SocialLinks, string> = {
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    instagram: 'Instagram',
    x: 'X',
    youtube: 'YouTube',
    github: 'GitHub',
    tiktok: 'TikTok',
  };
  return (Object.keys(labels) as (keyof SocialLinks)[])
    .filter((k) => !!site.social[k])
    .map((k) => ({ label: labels[k], href: site.social[k] as string }));
};
