import type { HomepageSectionId } from '@/lib/homepage-config-types';

export const HOMEPAGE_EDIT_SECTION_NAMES: Record<string, string> = {
  hero: 'Hero Section',
  bestSelling: 'Best Selling',
  marquee: 'Story Marquee',
  'why-choose-alma': 'Why Choose ALMA',
  'family-matching': 'Family Matching',
  categories: 'Categories',
  featured: 'Featured Products',
  brandStory: 'Brand Story',
  'our-process': 'Our Process',
  reviews: 'Reviews',
  collectionBanner: 'Collection Banner',
  community: 'Community Grid',
  'homepage-faq': 'FAQ',
  trust: 'Trust Strip',
  'homepage-cta': 'Final CTA',
};

export function isConfigSectionId(id: string): id is HomepageSectionId {
  return [
    'hero',
    'marquee',
    'categories',
    'featured',
    'brandStory',
    'reviews',
    'collectionBanner',
    'community',
    'trust',
  ].includes(id);
}

export type HomepageEditMessage =
  | { type: 'EDIT_SECTION'; sectionId: string; sectionName: string }
  | { type: 'HIGHLIGHT_SECTION'; sectionId: string }
  | { type: 'CLEAR_SECTION_EDIT' };

export function isHomepageEditMessage(data: unknown): data is HomepageEditMessage {
  if (!data || typeof data !== 'object') return false;
  const t = (data as { type?: string }).type;
  return t === 'EDIT_SECTION' || t === 'HIGHLIGHT_SECTION' || t === 'CLEAR_SECTION_EDIT';
}
