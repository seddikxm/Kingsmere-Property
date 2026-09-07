import type { HomepageSection } from '@/types';

export type HomepageSectionKey =
  | 'hero'
  | 'services'
  | 'featured'
  | 'about'
  | 'testimonials'
  | 'booking';

export const SECTION_DEFINITIONS: {
  key: HomepageSectionKey;
  label: string;
  description: string;
}[] = [
  { key: 'hero', label: 'Hero', description: 'Full-screen headline with the stats bar' },
  { key: 'services', label: 'Services', description: 'Kingsmere Property Services grid' },
  { key: 'featured', label: 'Featured Properties', description: 'Highlighted property listings' },
  { key: 'about', label: 'About', description: 'Agency story and strengths' },
  { key: 'testimonials', label: 'Testimonials', description: 'Client stories card stack' },
  { key: 'booking', label: 'Booking', description: 'Consultation booking form' },
];

export const DEFAULT_HOMEPAGE_LAYOUT: HomepageSection[] = SECTION_DEFINITIONS.map(
  (section, index) => ({
    section_key: section.key,
    enabled: true,
    sort_order: index,
  }),
);

export function isHomepageSectionKey(key: string): key is HomepageSectionKey {
  return SECTION_DEFINITIONS.some((s) => s.key === key);
}
