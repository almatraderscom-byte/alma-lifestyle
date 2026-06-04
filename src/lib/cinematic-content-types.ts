import type { CinematicGradientToken } from '@/lib/cinematic-config';

export interface CinematicChapterStageContent {
  eyebrow: string;
  heading: string;
  body: string;
  imageLabel: string;
  gradientFrom: CinematicGradientToken;
  gradientTo: CinematicGradientToken;
  /** Published product slug for stage background image (stages 1–3). */
  productSlug?: string;
  cta?: { label: string; href: string };
}

export interface CinematicHeroContent {
  videoSrc: string;
  posterSrc: string;
  eyebrow: string;
  brandName: string;
  subheading: string;
  metaLeft: string;
  metaRight: string;
  mediaObjectPosition: string;
  mediaObjectPositionMobile: string;
}

export interface CinematicPillarContent {
  id: string;
  title: string;
  description: string;
}

export interface CinematicFaqItem {
  q: string;
  a: string;
}

export interface CinematicContent {
  hero: CinematicHeroContent;
  chapters: {
    sectionNumber: string;
    stages: CinematicChapterStageContent[];
  };
  closing: {
    eyebrow: string;
    heading: string;
    cta: { label: string; href: string };
  };
  whyAlma: {
    sectionTitle: string;
    sectionSubtitle: string;
    pillars: CinematicPillarContent[];
  };
  faq: {
    sectionTitle: string;
    items: CinematicFaqItem[];
  };
}
