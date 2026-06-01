'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { scrollViewport } from '@/lib/animation-variants';

const features = [
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
];

export function WhyChooseAlma() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={scrollViewport}
          className="mb-12 text-center md:mb-16"
        >
          <p className="editorial-label mb-3 text-terracotta">কেন ALMA</p>
          <h2 className="font-bn-heading text-3xl font-bold text-charcoal md:text-5xl">
            আমাদের গর্ব, আপনার বিশ্বাস
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-bn-body text-base text-text-light md:text-lg">
            ALMA — যেখানে প্রিমিয়াম মিলে সাধ্যের সাথে। আমরা বাছাই করি, আপনি পান।
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={reduceMotion ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.6 }}
              viewport={scrollViewport}
              className="rounded-lg p-6 text-center transition-colors hover:bg-cream"
            >
              <div className="mb-4 text-5xl" aria-hidden>
                {feature.icon}
              </div>
              <h3 className="font-bn-heading text-xl font-semibold text-charcoal mb-3">
                {feature.title}
              </h3>
              <p className="font-bn-body text-text-light leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
