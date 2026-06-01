'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { scrollViewport } from '@/lib/animation-variants';
import { cn } from '@/lib/utils';

const familyTypes = [
  {
    label: 'পুরুষ',
    hint: 'Image: Man in matching panjabi',
    bgClass: 'bg-maroon',
    href: '/products?type=men_panjabi',
  },
  {
    label: 'মহিলা',
    hint: 'Image: Woman in three-piece',
    bgClass: 'bg-terracotta',
    href: '/products?type=women_three_piece',
  },
  {
    label: 'ছেলে',
    hint: 'Image: Boy in panjabi',
    bgClass: 'bg-mustard',
    href: '/products?type=boy_panjabi',
  },
  {
    label: 'মেয়ে',
    hint: 'Image: Girl in two-piece',
    bgClass: 'bg-emerald',
    href: '/products?type=girl_two_piece',
  },
];

export function FamilyMatchingShowcase() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65 }}
            viewport={scrollViewport}
          >
            <p className="editorial-label mb-3 text-terracotta">ফ্যামিলি ম্যাচিং</p>
            <h2 className="font-bn-heading text-3xl font-bold text-charcoal md:text-5xl leading-[1.35]">
              পরিবার একসাথে সাজুক
            </h2>
            <p className="font-bn-body mt-5 text-base text-text-light md:text-lg leading-relaxed">
              বাবা, মা, ছেলে, মেয়ে — সবার জন্য মিলিয়ে ডিজাইন। একই রঙ, একই প্যাটার্ন, আলাদা
              কাট ও সাইজ — ঈদ, বিবাহ বা পারিবারিক অনুষ্ঠানে সবাই একসাথে সাজুন।
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded bg-terracotta px-8 font-bn-body text-base font-semibold text-white transition-colors hover:bg-[#b06d4f]"
            >
              ফ্যামিলি সেট দেখুন →
            </Link>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            viewport={scrollViewport}
            className="relative"
          >
            <PlaceholderImage
              hint="Image: Family wearing matching ALMA outfits — outdoor golden hour"
              bgClass="bg-maroon aspect-[4/3] w-full rounded-xl"
            />
          </motion.div>
        </div>

        <motion.div
          className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={scrollViewport}
        >
          {familyTypes.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group block overflow-hidden rounded-lg"
            >
              <PlaceholderImage
                hint={item.hint}
                bgClass={cn(item.bgClass, 'aspect-[3/4] w-full transition-transform duration-500 group-hover:scale-[1.02]')}
              />
              <p className="font-bn-heading mt-3 text-center text-lg font-semibold text-charcoal">
                {item.label}
              </p>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
