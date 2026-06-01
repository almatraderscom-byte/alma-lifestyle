import type {
  CategoryColorClass,
  FamilyMatchingCardConfig,
  FamilyMatchingSectionData,
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
    icon: '🧶',
    title: 'কাপড় নির্বাচন',
    description:
      'সিরাজগঞ্জ, নরসিংদী ও কুমিল্লার তাঁতিদের কাছ থেকে সরাসরি কটন ও সিল্ক বাছাই করি।',
    bgClass: 'bg-terracotta' as CategoryColorClass,
    imageHint: 'Image: Fabric selection — cotton rolls',
  },
  {
    icon: '✏️',
    title: 'ডিজাইন',
    description: 'ঐতিহ্যবাহী মোটিফ ও আধুনিক কাটের সমন্বয়ে স্কেচ তৈরি হয়।',
    bgClass: 'bg-maroon' as const,
    imageHint: 'Image: Design sketch — panjabi pattern',
  },
  {
    icon: '🪡',
    title: 'হাতে বুনন',
    description: '৭০+ পরিবারের তাঁতিদের হাতে বোনা হয় প্রতিটি কাপড়।',
    bgClass: 'bg-mustard' as CategoryColorClass,
    imageHint: 'Image: Hand weaving at loom',
  },
  {
    icon: '🧵',
    title: 'সেলাই',
    description: 'অভিজ্ঞ দর্জিরা প্রতিটি সীম সেলাই করেন।',
    bgClass: 'bg-emerald' as CategoryColorClass,
    imageHint: 'Image: Tailor stitching panjabi',
  },
  {
    icon: '🔍',
    title: 'কোয়ালিটি চেক',
    description: 'প্রতিটি পিস তিন ধাপে পরীক্ষা করা হয়।',
    bgClass: 'bg-charcoal' as CategoryColorClass,
    imageHint: 'Image: Quality inspection',
  },
  {
    icon: '📦',
    title: 'প্যাকেজিং ও ডেলিভারি',
    description: 'প্রিমিয়াম বক্সে মোড়ানো হয়, ৬৪ জেলায় পৌঁছে দেওয়া হয়।',
    bgClass: 'bg-maroon' as CategoryColorClass,
    imageHint: 'Image: Packaged order delivery',
  },
];

export function getDefaultHomepageExtras(): HomepageExtras {
  return {
    familyMatching: {
      show: true,
      label: 'ফ্যামিলি ম্যাচিং',
      title: 'পরিবার একসাথে সাজুক',
      body:
        'বাবা, মা, ছেলে, মেয়ে — সবার জন্য মিলিয়ে ডিজাইন। একই রঙ, একই প্যাটার্ন, আলাদা কাট ও সাইজ।',
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
    ourProcess: {
      show: true,
      label: 'আমাদের প্রক্রিয়া',
      title: 'কাপড় থেকে আপনার দরজায়',
      subtitle: 'ছয়টি ধাপে তৈরি হয় প্রতিটি ALMA পোশাক',
      steps: PROCESS_STEP_DEFAULTS.map((s) => ({
        ...s,
        imageUrl: '',
        caption: '',
        alt: '',
      })),
    },
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

  const ourProcess = migrateOurProcessSection(
    {
      ...defaults.ourProcess,
      ...savedOp,
      steps: defaults.ourProcess.steps.map((def, i) => ({
        ...def,
        ...savedOp?.steps?.[i],
      })),
    },
    defaults.ourProcess
  );

  return { familyMatching, ourProcess };
}
