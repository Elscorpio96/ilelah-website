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
  { label: 'Hospital and clinic systems', href: '/services/hospital-systems/', description: 'Patient records, billing, pharmacy and lab' },
  { label: 'E-commerce and online stores', href: '/services/ecommerce/', description: 'Sell online with payments and orders' },
  { label: 'CCTV installation', href: '/services/cctv-installation/', description: 'Security cameras with viewing on your phone' },
  { label: 'AI and automation', href: '/services/ai-automation/', description: 'AI assistants and automated workflows' },
];

export const mainNav: NavItem[] = [
  { label: 'Services', href: '/services/', children: [{ label: 'All services', href: '/services/' }, ...serviceLinks] },
  { label: 'Products', href: '/products/', children: [
    { label: 'All products', href: '/products/' },
    { label: 'Ilelah Business Suite', href: '/products/business-suite/', description: 'Sales, stock and pricing for shops' },
  ] },
  { label: 'EduTech', href: '/edutech/' },
  { label: 'Academy', href: '/academy/', children: [
    { label: 'Digital Academy', href: '/academy/', description: 'Practical digital skills courses' },
    { label: 'Islamic Academy (coming soon)', href: '/islamic-academy/', description: 'Faith and modern learning together' },
  ] },
  { label: 'Portfolio', href: '/portfolio/' },
  { label: 'About', href: '/about/', children: [
    { label: 'About us', href: '/about/', description: 'Who we are and how we work' },
    { label: 'Industries', href: '/industries/', description: 'Who we help and how' },
    { label: 'Careers', href: '/careers/', description: 'Jobs, internships and SIWES' },
    { label: 'Partnerships', href: '/partnerships/', description: 'Resellers, trainers and collaborators' },
  ] },
  { label: 'Contact', href: '/contact/' },
];

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: 'Services',
    links: [...serviceLinks, { label: 'EduTech and CBT', href: '/edutech/' }, { label: 'Digital Academy', href: '/academy/' }, { label: 'Islamic Academy (coming soon)', href: '/islamic-academy/' }],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about/' },
      { label: 'Industries', href: '/industries/' },
      { label: 'Careers', href: '/careers/' },
      { label: 'Partnerships', href: '/partnerships/' },
      { label: 'Products', href: '/products/' },
      { label: 'Portfolio', href: '/portfolio/' },
      { label: 'Insights', href: '/insights/' },
      { label: 'FAQs', href: '/faq/' },
      { label: 'Company profile (PDF)', href: '/downloads/ilelah-technologies-company-profile.pdf' },
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
