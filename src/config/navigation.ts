/** Site navigation. Edit labels or order here; header and footer read from it. */

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavItem extends NavLink {
  children?: NavLink[];
}

export const serviceLinks: NavLink[] = [
  { label: 'Software development', href: '/services/software-development/', description: 'Business tools, web applications and automation' },
  { label: 'Website design and development', href: '/services/website-design/', description: 'Fast, clear websites you can keep up to date' },
  { label: 'Mobile app development', href: '/services/mobile-apps/', description: 'Android apps, including apps that work offline' },
  { label: 'ICT support and consultancy', href: '/services/ict-support/', description: 'Setup, maintenance, networks and advice' },
  { label: 'Graphic design and branding', href: '/services/graphic-design/', description: 'Logos, print, social media and brand identity' },
];

export const mainNav: NavItem[] = [
  { label: 'Services', href: '/services/', children: [{ label: 'All services', href: '/services/' }, ...serviceLinks] },
  { label: 'Products', href: '/products/', children: [
    { label: 'All products', href: '/products/' },
    { label: 'Ilelah Business Suite', href: '/products/business-suite/', description: 'Sales, stock and pricing for shops' },
  ] },
  { label: 'EduTech', href: '/edutech/' },
  { label: 'Academy', href: '/academy/' },
  { label: 'Portfolio', href: '/portfolio/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: 'Services',
    links: [...serviceLinks, { label: 'EduTech and CBT', href: '/edutech/' }, { label: 'Digital Academy', href: '/academy/' }],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about/' },
      { label: 'Products', href: '/products/' },
      { label: 'Portfolio', href: '/portfolio/' },
      { label: 'Insights', href: '/insights/' },
      { label: 'FAQs', href: '/faq/' },
    ],
  },
  {
    heading: 'Get in touch',
    links: [
      { label: 'Request a quote', href: '/quote/' },
      { label: 'Contact us', href: '/contact/' },
      { label: 'Privacy policy', href: '/privacy/' },
      { label: 'Terms of use', href: '/terms/' },
    ],
  },
];
