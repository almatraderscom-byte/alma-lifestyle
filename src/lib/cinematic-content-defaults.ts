import {
  CINEMATIC_CHAPTERS,
  CINEMATIC_CLOSING,
  CINEMATIC_HERO,
  type CinematicGradientToken,
} from '@/lib/cinematic-config';
import type { CinematicContent } from '@/lib/cinematic-content-types';

const DEFAULT_WHY_ALMA_PILLARS = [
  {
    id: 'quality',
    title: 'প্রিমিয়াম কোয়ালিটি',
    description:
      'সাবধানে বাছাই করা প্রতিটি পণ্য — কাপড় থেকে electronics, মান গ্যারান্টিযুক্ত',
  },
  {
    id: 'design',
    title: 'এলিগেন্ট ডিজাইন',
    description: 'Latest trend এবং classic style এর নিখুঁত মিশ্রণ — আধুনিক পরিবারের জন্য',
  },
  {
    id: 'family',
    title: 'পরিবার ম্যাচিং',
    description: 'বাবা, মা, ছেলে, মেয়ে — সবার জন্য মিলিয়ে design করা special collection',
  },
  {
    id: 'delivery',
    title: 'দ্রুত ডেলিভারি',
    description: '৬৪ জেলায় ৩-৫ কার্যদিবসে ডেলিভারি — ঢাকার মধ্যে আরও দ্রুত',
  },
  {
    id: 'payment',
    title: 'সুবিধাজনক পেমেন্ট',
    description: 'bKash, Nagad, ক্যাশ অন ডেলিভারি — যেটা আপনার পছন্দ সেটাই',
  },
  {
    id: 'trust',
    title: 'বিশ্বস্ত সেবা',
    description: '১০০% অরিজিনাল পণ্যের গ্যারান্টি — পছন্দ না হলে সহজ রিটার্ন policy',
  },
] as const;

const DEFAULT_FAQ_ITEMS = [
  { q: 'ডেলিভারি কতদিনে পাব?', a: 'ঢাকার মধ্যে ১-২ দিন, ঢাকার বাইরে ৩-৫ দিন।' },
  { q: 'কীভাবে পেমেন্ট করব?', a: 'bKash, Nagad, অথবা ক্যাশ অন ডেলিভারি।' },
  {
    q: 'সাইজ পরিবর্তন করতে পারব?',
    a: 'হ্যাঁ, ডেলিভারি পাওয়ার ৭ দিনের মধ্যে সাইজ পরিবর্তন বা ফেরত দিতে পারবেন।',
  },
  {
    q: 'কাপড়ের কোয়ালিটি কেমন?',
    a: '১০০% প্রিমিয়াম কাপড়। আমরা trusted manufacturer থেকে carefully selected products নিয়ে আসি। প্রতিটি পণ্য কোয়ালিটি যাচাই করে stock করি।',
  },
  {
    q: 'ফ্যামিলি সেট মানে কী?',
    a: 'একই ডিজাইন এবং রঙের পোশাক বাবা, মা, ছেলে, মেয়ে — সবার জন্য মিলিয়ে।',
  },
  {
    q: 'কাস্টম ডিজাইন করা যাবে?',
    a: 'হ্যাঁ, বিশেষ অর্ডারের জন্য আমাদের WhatsApp এ যোগাযোগ করুন।',
  },
] as const;

export function getDefaultCinematicContent(): CinematicContent {
  return {
    hero: {
      videoSrc: CINEMATIC_HERO.videoSrc,
      posterSrc: CINEMATIC_HERO.posterSrc,
      eyebrow: CINEMATIC_HERO.eyebrow,
      brandName: CINEMATIC_HERO.brandName,
      subheading: CINEMATIC_HERO.subheading,
      metaLeft: CINEMATIC_HERO.metaLeft,
      metaRight: CINEMATIC_HERO.metaRight,
      mediaObjectPosition: CINEMATIC_HERO.mediaObjectPosition,
      mediaObjectPositionMobile: CINEMATIC_HERO.mediaObjectPositionMobile,
    },
    chapters: {
      sectionNumber: CINEMATIC_CHAPTERS.sectionNumber,
      stages: CINEMATIC_CHAPTERS.stages.map((stage, index) => ({
        eyebrow: stage.eyebrow,
        heading: stage.heading,
        body: stage.body,
        imageLabel: stage.imageLabel,
        gradientFrom: stage.gradientFrom as CinematicGradientToken,
        gradientTo: stage.gradientTo as CinematicGradientToken,
        ...('cta' in stage && stage.cta ? { cta: { ...stage.cta } } : {}),
      })),
    },
    closing: {
      eyebrow: CINEMATIC_CLOSING.eyebrow,
      heading: CINEMATIC_CLOSING.heading,
      cta: { ...CINEMATIC_CLOSING.cta },
    },
    whyAlma: {
      sectionTitle: 'আমাদের গর্ব, আপনার বিশ্বাস',
      sectionSubtitle:
        'ALMA — যেখানে প্রিমিয়াম মিলে সাধ্যের সাথে। আমরা বাছাই করি, আপনি পান।',
      pillars: DEFAULT_WHY_ALMA_PILLARS.map((p) => ({ ...p })),
    },
    faq: {
      sectionTitle: 'সাধারণ প্রশ্ন',
      items: DEFAULT_FAQ_ITEMS.map((item) => ({ ...item })),
    },
  };
}

export function mergeCinematicContent(
  saved: Partial<CinematicContent> | null | undefined
): CinematicContent {
  const defaults = getDefaultCinematicContent();
  if (!saved) return defaults;

  return {
    hero: { ...defaults.hero, ...saved.hero },
    chapters: {
      sectionNumber: saved.chapters?.sectionNumber ?? defaults.chapters.sectionNumber,
      stages:
        saved.chapters?.stages?.length === defaults.chapters.stages.length
          ? defaults.chapters.stages.map((def, i) => {
              const savedStage = saved.chapters!.stages[i];
              const productSlug = savedStage?.productSlug?.trim() || undefined;
              return {
                ...def,
                ...savedStage,
                ...(productSlug ? { productSlug } : {}),
                cta: savedStage?.cta ?? def.cta,
              };
            })
          : defaults.chapters.stages,
    },
    closing: {
      ...defaults.closing,
      ...saved.closing,
      cta: { ...defaults.closing.cta, ...saved.closing?.cta },
    },
    whyAlma: {
      ...defaults.whyAlma,
      ...saved.whyAlma,
      pillars:
        saved.whyAlma?.pillars?.length === defaults.whyAlma.pillars.length
          ? defaults.whyAlma.pillars.map((def, i) => ({
              ...def,
              ...saved.whyAlma!.pillars[i],
            }))
          : defaults.whyAlma.pillars,
    },
    faq: {
      ...defaults.faq,
      ...saved.faq,
      items:
        saved.faq?.items?.length && saved.faq.items.length > 0
          ? saved.faq.items
          : defaults.faq.items,
    },
  };
}
