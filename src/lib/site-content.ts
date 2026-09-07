import { IMAGES } from '@/lib/constants';

export type HeroStat = { value: number; suffix: string; label: string };

export type HeroContent = {
  badge: string;
  titleTop: string;
  titleAccent: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  image: string;
  stats: HeroStat[];
};

export type AboutStrength = { title: string; description: string };

export type AboutContent = {
  eyebrow: string;
  heading: string;
  paragraph: string;
  image: string;
  statValue: string;
  statLabel: string;
  strengths: AboutStrength[];
};

export type TestimonialItem = {
  id: string;
  name: string;
  profession: string;
  rating: number;
  description: string;
  avatarUrl: string;
};

export type TestimonialsContent = {
  eyebrow: string;
  heading: string;
  subheading: string;
  items: TestimonialItem[];
};

export type FooterContent = {
  tagline: string;
  ctaLabel: string;
  backgroundImage: string;
  quickLinks: { label: string; href: string }[];
};

export const DEFAULT_HERO_CONTENT: HeroContent = {
  badge: 'Premium Kingsmere Property Services',
  titleTop: 'Find your place.',
  titleAccent: 'With confidence.',
  subtitle:
    'Expert real estate guidance for buyers, sellers, and investors. Schedule a personal consultation and take the next step toward your property goals.',
  primaryCta: 'Schedule your consultation',
  secondaryCta: 'Explore services',
  image: IMAGES.hero,
  stats: [
    { value: 12, suffix: '+', label: 'Years of market experience' },
    { value: 500, suffix: '+', label: 'Clients guided home' },
    { value: 24, suffix: 'h', label: 'Average response time' },
  ],
};

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  eyebrow: 'About Kingsmere',
  heading: 'A real estate partnership built on trust, clarity, and results',
  paragraph:
    'We help buyers find the right property, sellers attract serious offers, and investors evaluate opportunities with confidence. Every consultation is focused on your timeline, your budget, and your goals.',
  image: IMAGES.about,
  statValue: '98%',
  statLabel: 'Of clients say they would recommend our real estate guidance to a friend.',
  strengths: [
    {
      title: 'Local Property Expertise',
      description: 'Deep knowledge of neighborhoods, pricing trends, and available inventory.',
    },
    {
      title: 'Buyer & Seller Guidance',
      description: 'Personalized strategy whether you are purchasing your first home or listing a property.',
    },
    {
      title: 'Market Context',
      description: 'Clear, data-driven insights to help you make confident real estate decisions.',
    },
    {
      title: 'Transparent Communication',
      description: 'Regular updates, honest feedback, and a process that puts your priorities first.',
    },
  ],
};

export const DEFAULT_TESTIMONIALS_CONTENT: TestimonialsContent = {
  eyebrow: 'Client Stories',
  heading: 'Testimonials',
  subheading:
    'Hear from the buyers, sellers, and landlords who trust Kingsmere Property with their most important assets.',
  items: [
    {
      id: 'testimonial-1',
      name: 'Sarah & James H.',
      profession: 'Homeowners',
      rating: 5,
      description:
        'Kingsmere Property made buying our first home effortless. Their attention to detail and market knowledge gave us complete confidence from start to finish.',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'testimonial-2',
      name: 'Margaret T.',
      profession: 'Property Investor',
      rating: 5,
      description:
        'A truly premium service. They handled everything with discretion, secured a fantastic tenant, and kept me informed at every step. Highly recommended.',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'testimonial-3',
      name: 'Richard & Eleanor B.',
      profession: 'Sellers',
      rating: 4.5,
      description:
        'From valuation to completion, the team was professional, responsive, and genuinely invested in achieving the best outcome for our family home.',
      avatarUrl:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'testimonial-4',
      name: 'David K.',
      profession: 'Landlord',
      rating: 5,
      description:
        'The property management service is outstanding. My portfolio has never been in better hands — they treat every unit as if it were their own.',
      avatarUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    },
  ],
};

export const DEFAULT_FOOTER_CONTENT: FooterContent = {
  tagline:
    'Premium real estate guidance for buyers, sellers, and investors. One conversation is all it takes to move with confidence.',
  ctaLabel: 'Book a consultation',
  backgroundImage: IMAGES.footer,
  quickLinks: [
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Featured properties', href: '#properties' },
    { label: 'Book consultation', href: '#booking' },
  ],
};

/**
 * Merge CMS-stored JSON over hardcoded defaults. Sections saved by the admin
 * are complete documents, so a shallow merge with array replacement is enough.
 */
export function mergeContent<T>(defaults: T, override: unknown): T {
  if (!override || typeof override !== 'object' || Array.isArray(override)) return defaults;
  return { ...(defaults as Record<string, unknown>), ...(override as Record<string, unknown>) } as T;
}
