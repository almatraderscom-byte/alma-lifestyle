import type {
  CategoryColorClass,
  FamilyMatchingCardConfig,
  FamilyMatchingSectionData,
  HomepageCtaData,
  HomepageExtras,
  OurProcessSectionData,
} from '@/lib/homepage-config-types';
import { emptyImageSlot } from '@/lib/homepage-image-slots';
import { migrateFamilyMatchingSection, migrateOurProcessSection } from '@/lib/homepage-migrations';

const FAMILY_CARD_DEFAULTS: Omit<FamilyMatchingCardConfig, 'id'>[] = [
  {
    label: 'পুরুষ',
    href: '/products?type=men_panjabi',
    imageHint: 'Image: Man in matching panjabi',
    bgClass: 'bg-maroon',
    imageUrl: '',
    caption: '',
    alt: '',
  },
  {
    label: 'মহিলা',
    href: '/products?type=women_three_piece',
    imageHint: 'Image: Woman in three-piece',
    bgClass: 'bg-terracotta',
    imageUrl: '',
    caption: '',
    alt: '',
  },
  {
    label: 'ছেলে',
    href: '/products?type=boy_panjabi',
    imageHint: 'Image: Boy in panjabi',
    bgClass: 'bg-mustard',
    imageUrl: '',
    caption: '',
    alt: '',
  },
  {
    label: 'মেয়ে',
    href: '/products?type=girl_two_piece',
    imageHint: 'Image: Girl in two-piece',
    bgClass: 'bg-emerald',
    imageUrl: '',
    caption: '',
    alt: '',
  },
];

const PROCESS_STEP_DEFAULTS = [
  {
    icon: '🔎',
    title: 'বাছাই',
    description:
      'আমরা trusted manufacturer ও vendor দের থেকে best products যত্নে বাছাই করি',
    bgClass: 'bg-terracotta' as CategoryColorClass,
    imageHint: 'Image: Product curation — premium selection',
  },
  {
    icon: '✅',
    title: 'যাচাই',
    description: 'প্রতিটি পণ্যের কোয়ালিটি, fabric, finishing যাচাই করি stocking এর আগে',
    bgClass: 'bg-maroon' as const,
    imageHint: 'Image: Quality check — fabric inspection',
  },
  {
    icon: '📷',
    title: 'ছবি তোলা',
    description: 'Professional photography দিয়ে আসল রঙ ও design তুলে ধরি',
    bgClass: 'bg-mustard' as CategoryColorClass,
    imageHint: 'Image: Product photography studio',
  },
  {
    icon: '📝',
    title: 'লিস্টিং',
    description: 'Detailed description, accurate pricing দিয়ে website এ list করি',
    bgClass: 'bg-emerald' as CategoryColorClass,
    imageHint: 'Image: Product listing on website',
  },
  {
    icon: '📦',
    title: 'প্যাকেজিং',
    description: 'Premium packaging — যাতে আপনার কাছে perfect condition এ পৌঁছায়',
    bgClass: 'bg-charcoal' as CategoryColorClass,
    imageHint: 'Image: Premium gift packaging',
  },
  {
    icon: '🚚',
    title: 'ডেলিভারি',
    description: '৬৪ জেলায় দ্রুত ও নিরাপদ ডেলিভারি — tracking সহ',
    bgClass: 'bg-maroon' as CategoryColorClass,
    imageHint: 'Image: Nationwide delivery courier',
  },
];

/** Detect outdated copy (weavers/tailors/handwoven claims) saved in the database. */
const LEGACY_PROCESS_MARKERS =
  /তাঁতি|হাতে\s*বোনা|দর্জি|মোটিফ|স্কেচ|সিরাজগঞ্জ|নরসিংদী|কুমিল্লার\s*তাঁতি/i;

export function ourProcessHasLegacyClaims(section: OurProcessSectionData | undefined): boolean {
  if (!section) return false;
  const header = `${section.title} ${section.subtitle}`;
  if (LEGACY_PROCESS_MARKERS.test(header)) return true;
  return (section.steps ?? []).some((step) =>
    LEGACY_PROCESS_MARKERS.test(`${step.title} ${step.description}`)
  );
}

export function getDefaultOurProcessSection(): OurProcessSectionData {
  return {
    show: true,
    label: 'আমাদের প্রক্রিয়া',
    title: 'বাছাই থেকে আপনার দরজায়',
    subtitle: 'ছয়টি ধাপে আপনার কাছে পৌঁছায় প্রতিটি ALMA পণ্য',
    steps: PROCESS_STEP_DEFAULTS.map((step) => ({
      ...step,
      imageUrl: '',
      caption: '',
      alt: '',
    })),
  };
}

function mergeOurProcessWithDefaults(
  saved: OurProcessSectionData | undefined,
  defaults: OurProcessSectionData
): OurProcessSectionData {
  const useDefaultCopy =
    !saved?.steps?.length ||
    saved.steps.length !== defaults.steps.length ||
    ourProcessHasLegacyClaims(saved);

  if (!useDefaultCopy && saved) {
    return migrateOurProcessSection(
      {
        ...defaults,
        ...saved,
        steps: defaults.steps.map((def, i) => ({
          ...def,
          ...saved.steps[i],
        })),
      },
      defaults
    );
  }

  return migrateOurProcessSection(
    {
      show: saved?.show ?? defaults.show,
      label: defaults.label,
      title: defaults.title,
      subtitle: defaults.subtitle,
      steps: defaults.steps.map((def, i) => {
        const savedStep = saved?.steps?.[i];
        return {
          ...def,
          imageUrl: savedStep?.imageUrl?.trim() || def.imageUrl,
          caption: savedStep?.caption ?? def.caption,
          alt: savedStep?.alt ?? def.alt,
        };
      }),
    },
    defaults
  );
}

export function getDefaultHomepageCta(): HomepageCtaData {
  return {
    heading: 'এবার আপনার পরিবারের পালা',
    body: 'আজই অর্ডার করুন এবং ALMA পরিবারের অংশ হয়ে যান',
    primaryCta: 'কালেকশন দেখুন →',
    primaryHref: '/products',
    secondaryCta: 'WhatsApp এ মেসেজ করুন',
    secondaryHref: '',
  };
}

export function getDefaultHomepageExtras(): HomepageExtras {
  return {
    homepageCta: getDefaultHomepageCta(),
    familyMatching: {
      show: true,
      label: 'ফ্যামিলি ম্যাচিং',
      title: 'পরিবার একসাথে সাজুক',
      body:
        'বাবা, মা, ছেলে, মেয়ে — সবার জন্য carefully matched design। একই রঙ, একই pattern, আলাদা cut এবং size — পুরো পরিবারের জন্য বিশেষ collection।',
      ctaText: 'ফ্যামিলি সেট দেখুন →',
      ctaHref: '/products?type=family-set',
      banner: emptyImageSlot(
        'Image: Family wearing matching ALMA outfits — outdoor golden hour',
        'bg-maroon'
      ),
      cards: FAMILY_CARD_DEFAULTS.map((c, i) => ({
        ...c,
        id: `family-${i + 1}`,
      })),
    },
    ourProcess: getDefaultOurProcessSection(),
  };
}

export function mergeHomepageExtras(
  saved: HomepageExtras | undefined,
  defaults: HomepageExtras = getDefaultHomepageExtras()
): HomepageExtras {
  const savedFm = saved?.familyMatching;
  const savedOp = saved?.ourProcess;

  const familyMatching = migrateFamilyMatchingSection(
    {
      ...defaults.familyMatching,
      ...savedFm,
      banner: {
        ...defaults.familyMatching.banner,
        ...savedFm?.banner,
      },
      cards: defaults.familyMatching.cards.map((def, i) => ({
        ...def,
        ...savedFm?.cards?.[i],
        id: savedFm?.cards?.[i]?.id ?? def.id,
      })),
    },
    defaults.familyMatching
  );

  const ourProcess = mergeOurProcessWithDefaults(savedOp, defaults.ourProcess);

  return {
    familyMatching,
    ourProcess,
    homepageCta: { ...getDefaultHomepageCta(), ...saved?.homepageCta },
  };
}
