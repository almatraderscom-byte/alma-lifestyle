import { MURDA_MOSHARI_PAGE } from '@/lib/content';
import type { MurdaMoshariContent } from '@/lib/landing-content-types';

/** Static fallback + admin “reset to default” source. */
export function getDefaultMurdaMoshariContent(): MurdaMoshariContent {
  return {
    overlay: { ...MURDA_MOSHARI_PAGE.overlay },
    hero: {
      eyebrow: MURDA_MOSHARI_PAGE.hero.eyebrow,
      heading: MURDA_MOSHARI_PAGE.hero.heading,
      subheading: MURDA_MOSHARI_PAGE.hero.subheading,
      primaryCta: MURDA_MOSHARI_PAGE.hero.primaryCta,
      whatsappCta: MURDA_MOSHARI_PAGE.hero.whatsappCta,
      whatsappNumber: MURDA_MOSHARI_PAGE.hero.whatsappNumber,
      whatsappPrefill: MURDA_MOSHARI_PAGE.hero.whatsappPrefill,
      trustItems: [...MURDA_MOSHARI_PAGE.hero.trustItems],
      heroImage: '/products/murda-moshari/hero-black.jpg',
    },
    narrative: {
      eyebrow: MURDA_MOSHARI_PAGE.narrative.eyebrow,
      scenes: [...MURDA_MOSHARI_PAGE.narrative.scenes],
    },
    problem: {
      heading: MURDA_MOSHARI_PAGE.problem.heading,
      intro: MURDA_MOSHARI_PAGE.problem.intro,
      points: [...MURDA_MOSHARI_PAGE.problem.points],
      outro: MURDA_MOSHARI_PAGE.problem.outro,
    },
    solution: {
      eyebrow: MURDA_MOSHARI_PAGE.solution.eyebrow,
      heading: MURDA_MOSHARI_PAGE.solution.heading,
      body: MURDA_MOSHARI_PAGE.solution.body,
      tags: [...MURDA_MOSHARI_PAGE.solution.tags],
      image: '/products/murda-moshari/in-use.jpg',
    },
    features: {
      heading: MURDA_MOSHARI_PAGE.features.heading,
      subheading: MURDA_MOSHARI_PAGE.features.subheading,
      items: MURDA_MOSHARI_PAGE.features.items.map((item) => ({ ...item })),
    },
    specs: {
      length: { ...MURDA_MOSHARI_PAGE.specs.length },
      width: { ...MURDA_MOSHARI_PAGE.specs.width },
      height: { ...MURDA_MOSHARI_PAGE.specs.height },
    },
    story: { ...MURDA_MOSHARI_PAGE.story },
    donation: { ...MURDA_MOSHARI_PAGE.donation },
    pricing: { ...MURDA_MOSHARI_PAGE.pricing },
    reviews: {
      heading: MURDA_MOSHARI_PAGE.reviews.heading,
      subheading: MURDA_MOSHARI_PAGE.reviews.subheading,
      verifiedLabel: MURDA_MOSHARI_PAGE.reviews.verifiedLabel,
      images: [...MURDA_MOSHARI_PAGE.reviews.images],
    },
    trustFooter: { ...MURDA_MOSHARI_PAGE.trustFooter },
  };
}
