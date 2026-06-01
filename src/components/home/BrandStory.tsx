'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { isUsableImageUrl } from '@/lib/homepage-image';
import type { BrandStorySectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';
import { EASE_PREMIUM, scrollViewport } from '@/lib/animation-variants';
import { cn } from '@/lib/utils';

interface BrandStoryProps {
  data?: BrandStorySectionData;
}

const STORY_PARAGRAPHS = [
  '২০১৮ সালে বাংলাদেশের সিরাজগঞ্জে ALMA যাত্রা শুরু করে — একটি ছোট তাঁত ঘর থেকে। আমাদের লক্ষ্য ছিল সহজ: ঐতিহ্যবাহী হাতে বোনা পোশাককে আধুনিক পরিবারের কাছে পৌঁছে দেওয়া, যেখানে প্রতিটি সেলাইয়ে বাংলার গল্প থাকে।',
  'আজ আমরা ৭০+ পরিবারের তাঁতি ও দর্জির সাথে কাজ করি। আমরা শুধু পোশাক বিক্রি করি না — কারিগরদের জীবিকা নিশ্চিত করি, ঐতিহ্য বহন করি, এবং প্রতিটি গ্রাহকের পরিবারকে আমাদের নিজের মতো গুরুত্ব দিই।',
  'প্রতিটি পাঞ্জাবি ও পরিবার সেট তৈরি হয় ছয়টি ধাপে — কাপড় বাছাই থেকে কোয়ালিটি চেক পর্যন্ত। আমাদের মিশন: বাংলাদেশের মানকে বিশ্বমানের সঙ্গে মিলিয়ে রাখা, আপনার ঘরে।',
  'আমরা চাই আমাদের পরিবার আপনার পরিবারের মতো একসাথে সাজুক — ঈদ, বিবাহ, বা শুধু একসাথে কাটানো একটি সুন্দর দিনের জন্য।',
];

const COLLAGE_HINTS = [
  { hint: 'Image: Weaver at loom — Sirajganj', bgClass: 'bg-mustard' },
  { hint: 'Image: Fabric close-up — cotton texture', bgClass: 'bg-terracotta' },
  { hint: 'Image: Family in ALMA outfits — candid smile', bgClass: 'bg-maroon' },
];

export function BrandStory({ data: dataProp }: BrandStoryProps) {
  const reduceMotion = useReducedMotion();
  const { ref: sectionRef } = useScrollAnimation();

  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'brandStory')!.data;

  const mainImage = isUsableImageUrl(data.imageUrl);

  return (
    <section ref={sectionRef} className="section-padding bg-warm-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={scrollViewport}
            transition={{ duration: 0.7, ease: EASE_PREMIUM }}
            className="space-y-4"
          >
            {mainImage ? (
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg">
                <HomepageSectionImage
                  src={data.imageUrl}
                  alt={data.title}
                  sizes="(max-width: 768px) 100vw, 45vw"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <PlaceholderImage
                  hint={COLLAGE_HINTS[0].hint}
                  bgClass={cn(COLLAGE_HINTS[0].bgClass, 'col-span-2 aspect-[16/10] w-full rounded-lg')}
                />
                {COLLAGE_HINTS.slice(1).map((item) => (
                  <PlaceholderImage
                    key={item.hint}
                    hint={item.hint}
                    bgClass={cn(item.bgClass, 'aspect-square w-full rounded-lg')}
                  />
                ))}
              </div>
            )}
            <p className="font-bn-body text-sm text-text-light">{data.imageCaption}</p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={scrollViewport}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE_PREMIUM }}
            className="md:py-4"
          >
            <p className="editorial-label mb-4 text-terracotta">{data.label}</p>
            <h2 className="font-bn-heading text-[1.75rem] font-bold text-charcoal md:text-4xl leading-[1.35]">
              {data.title}
            </h2>

            <blockquote className="my-6 border-l-4 border-terracotta pl-5 font-bn-heading text-xl italic text-maroon md:text-2xl">
              প্রতিটি সুতায় বাংলার গল্প
            </blockquote>

            <div className="space-y-4 font-bn-body text-base text-text-light leading-relaxed md:text-lg">
              {STORY_PARAGRAPHS.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
              {data.body && !STORY_PARAGRAPHS.some((p) => p === data.body) && (
                <p>{data.body}</p>
              )}
            </div>

            <p className="mt-6 font-bn-body text-sm text-terracotta font-medium">
              প্রতিষ্ঠা · ২০১৮ · বাংলাদেশ
            </p>

            <Link
              href={data.ctaHref}
              className="link-underline mt-8 inline-block font-bn-body text-base font-semibold text-charcoal"
            >
              {data.cta}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
