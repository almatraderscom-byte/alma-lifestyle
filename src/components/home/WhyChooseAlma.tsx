'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { scrollViewport } from '@/lib/animation-variants';
import type { CinematicContent } from '@/lib/cinematic-content-types';

const DEFAULT_FEATURES = [
  {
    icon: '✨',
    title: 'প্রিমিয়াম কোয়ালিটি',
    description:
      'সাবধানে বাছাই করা প্রতিটি পণ্য — কাপড় থেকে electronics, মান গ্যারান্টিযুক্ত',
  },
  {
    icon: '💎',
    title: 'এলিগেন্ট ডিজাইন',
    description: 'Latest trend এবং classic style এর নিখুঁত মিশ্রণ — আধুনিক পরিবারের জন্য',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'পরিবার ম্যাচিং',
    description:
      'বাবা, মা, ছেলে, মেয়ে — সবার জন্য মিলিয়ে design করা special collection',
  },
  {
    icon: '🚚',
    title: 'দ্রুত ডেলিভারি',
    description: '৬৪ জেলায় ৩-৫ কার্যদিবসে ডেলিভারি — ঢাকার মধ্যে আরও দ্রুত',
  },
  {
    icon: '💳',
    title: 'সুবিধাজনক পেমেন্ট',
    description: 'bKash, Nagad, ক্যাশ অন ডেলিভারি — যেটা আপনার পছন্দ সেটাই',
  },
  {
    icon: '🛡️',
    title: 'বিশ্বস্ত সেবা',
    description: '১০০% অরিজিনাল পণ্যের গ্যারান্টি — পছন্দ না হলে সহজ রিটার্ন policy',
  },
] as const;

const PILLAR_ICONS = ['✨', '💎', '👨‍👩‍👧‍👦', '🚚', '💳', '🛡️'];

interface WhyChooseAlmaProps {
  content?: CinematicContent['whyAlma'];
}

export function WhyChooseAlma({ content }: WhyChooseAlmaProps) {
  const reduceMotion = useReducedMotion();
  const features = content?.pillars?.length
    ? content.pillars.map((p, i) => ({
        icon: PILLAR_ICONS[i % PILLAR_ICONS.length],
        title: p.title,
        description: p.description,
      }))
    : DEFAULT_FEATURES;

  const sectionTitle = content?.sectionTitle ?? 'কেন ALMA Lifestyle?';
  const sectionSubtitle =
    content?.sectionSubtitle ??
    'আমরা শুধু পণ্য বিক্রি করি না — আপনার পরিবারের জন্য একটি সম্পূর্ণ lifestyle experience তৈরি করি';

  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={scrollViewport}
          className="mb-10 text-center md:mb-14"
        >
          <p className="editorial-label mb-3 text-terracotta">Why ALMA</p>
          <h2 className="font-bn-heading text-3xl font-bold text-charcoal md:text-4xl">
            {sectionTitle}
          </h2>
          <p className="font-bn-body mx-auto mt-4 max-w-2xl text-base text-neutral-600 md:text-lg">
            {sectionSubtitle}
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title + i}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              viewport={scrollViewport}
              className="rounded-xl border border-neutral-100 bg-cream/50 p-6"
            >
              <span className="text-2xl" aria-hidden>
                {feature.icon}
              </span>
              <h3 className="font-bn-heading mt-3 text-lg font-semibold text-charcoal">
                {feature.title}
              </h3>
              <p className="font-bn-body mt-2 text-sm text-neutral-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
