/**
 * The service divisions of Ilelah Technologies, in display order.
 * These are public-facing names for areas of work, not separately
 * registered companies. Used on the homepage, Services and About pages.
 */
import type { IconName } from '@/lib/icons';

export interface Division {
  name: string;
  summary: string;
  href: string;
  icon: IconName;
  cta: string;
}

export const divisions: Division[] = [
  {
    name: 'Software Development',
    summary: 'Business applications, web systems and internal tools built around the way you work.',
    href: '/services/software-development/',
    icon: 'code',
    cta: 'Software development',
  },
  {
    name: 'Ilelah Business Suite',
    summary: 'Our own app for shops and small businesses: sales, stock and pricing on an Android device.',
    href: '/products/business-suite/',
    icon: 'stock',
    cta: 'Ilelah Business Suite',
  },
  {
    name: 'EduTech, CBT and School Systems',
    summary: 'Computer-based testing, results and school management systems that suit your equipment.',
    href: '/edutech/',
    icon: 'school',
    cta: 'EduTech and CBT',
  },
  {
    name: 'Website Design and Development',
    summary: 'Fast, clear websites for businesses, schools and organisations, written and built for mobile.',
    href: '/services/website-design/',
    icon: 'globe',
    cta: 'Websites',
  },
  {
    name: 'Mobile App Development',
    summary: 'Android apps for staff and customers, including apps that keep working offline.',
    href: '/services/mobile-apps/',
    icon: 'mobile',
    cta: 'Mobile apps',
  },
  {
    name: 'ICT Support, Consultancy and Maintenance',
    summary: 'Computers, networks and software kept working, and honest advice before you buy.',
    href: '/services/ict-support/',
    icon: 'support',
    cta: 'ICT support',
  },
  {
    name: 'Graphic Design and Branding',
    summary: 'Logos, brand identity, print and social media material that look professional.',
    href: '/services/graphic-design/',
    icon: 'pen',
    cta: 'Design and branding',
  },
  {
    name: 'Digital Skills Training',
    summary: 'Practical courses from computer basics to programming, AI and cybersecurity.',
    href: '/academy/',
    icon: 'academy',
    cta: 'Digital Academy',
  },
];
