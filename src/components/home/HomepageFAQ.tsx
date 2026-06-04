'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { scrollViewport } from '@/lib/animation-variants';
import { cn } from '@/lib/utils';
import type { CinematicContent } from '@/lib/cinematic-content-types';

const DEFAULT_FAQS = [
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
  { q: 'ফ্যামিলি সেট মানে কী?', a: 'একই ডিজাইন এবং রঙের পোশাক বাবা, মা, ছেলে, মেয়ে — সবার জন্য মিলিয়ে।' },
  { q: 'কাস্টম ডিজাইন করা যাবে?', a: 'হ্যাঁ, বিশেষ অর্ডারের জন্য আমাদের WhatsApp এ যোগাযোগ করুন।' },
];

interface HomepageFAQProps {
  content?: CinematicContent['faq'];
}

export function HomepageFAQ({ content }: HomepageFAQProps) {
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = content?.items?.length ? content.items : DEFAULT_FAQS;
  const sectionTitle = content?.sectionTitle ?? 'সাধারণ প্রশ্ন';

  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={scrollViewport}
          className="mb-10 text-center md:mb-12"
        >
          <p className="editorial-label mb-3 text-terracotta">প্রশ্নোত্তর</p>
          <h2 className="font-bn-heading text-3xl font-bold text-charcoal md:text-4xl">
            {sectionTitle}
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={faq.q + index}
                className="rounded-xl border border-neutral-200 bg-cream/30 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-bn-heading text-base font-semibold text-charcoal md:text-lg">
                    {faq.q}
                  </span>
                  <span className="text-terracotta text-xl shrink-0" aria-hidden>
                    {open ? '−' : '+'}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="font-bn-body px-5 pb-4 text-sm text-neutral-600 md:text-base">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-neutral-500">
          আরও প্রশ্ন?{' '}
          <Link href="/contact" className="font-medium text-terracotta hover:underline">
            যোগাযোগ করুন
          </Link>
        </p>
      </div>
    </section>
  );
}
