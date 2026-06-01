'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { scrollViewport } from '@/lib/animation-variants';
import { cn } from '@/lib/utils';

const faqs = [
  {
    q: 'ডেলিভারি কতদিনে পাব?',
    a: 'ঢাকার মধ্যে ১-২ দিন, ঢাকার বাইরে ৩-৫ দিন।',
  },
  {
    q: 'কীভাবে পেমেন্ট করব?',
    a: 'bKash, Nagad, অথবা ক্যাশ অন ডেলিভারি।',
  },
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
];

export function HomepageFAQ() {
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
            সাধারণ প্রশ্ন
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={faq.q}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.45 }}
                viewport={scrollViewport}
                className="overflow-hidden rounded-lg border border-border-subtle bg-cream/40"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bn-heading text-base font-semibold text-charcoal md:text-lg"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  {faq.q}
                  <span
                    className={cn(
                      'shrink-0 text-terracotta transition-transform duration-300',
                      isOpen && 'rotate-180'
                    )}
                    aria-hidden
                  >
                    ▼
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-border-subtle px-5 pb-4 pt-2 font-bn-body text-text-light leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
