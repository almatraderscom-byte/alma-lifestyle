'use client';

import { useState } from 'react';
import Link from 'next/link';
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

function PlusIcon({ open }: { open: boolean }) {
  return (
    <motion.span
      className="flex h-8 w-8 shrink-0 items-center justify-center text-mustard"
      animate={{ rotate: open ? 45 : 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    </motion.span>
  );
}

export function CinematicFAQ() {
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const instant = !!reduceMotion;

  return (
    <section className="section-padding bg-cream">
      <div className="mx-auto max-w-3xl px-4">
        <motion.h2
          className="mb-12 text-center font-bn-heading text-4xl font-bold text-charcoal"
          initial={instant ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={scrollViewport}
        >
          সাধারণ প্রশ্ন
        </motion.h2>

        <div>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={faq.q}
                initial={instant ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: instant ? 0 : idx * 0.08, duration: 0.5 }}
                viewport={scrollViewport}
                className="group relative border-t border-charcoal/20"
              >
                <span
                  className={cn(
                    'absolute left-0 top-0 h-full w-0.5 origin-top bg-mustard transition-transform duration-300',
                    isOpen ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-50'
                  )}
                  aria-hidden
                />
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-between gap-6 py-6 text-left transition-transform duration-300',
                    isOpen ? 'scale-[1.02] text-mustard' : 'text-charcoal group-hover:scale-[1.01]'
                  )}
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  <span className="font-bn-heading text-2xl font-semibold leading-snug">{faq.q}</span>
                  <PlusIcon open={isOpen} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={instant ? false : { height: 0, opacity: 0, y: 8 }}
                      animate={{ height: 'auto', opacity: 1, y: 0 }}
                      exit={instant ? undefined : { height: 0, opacity: 0, y: 8 }}
                      transition={{ duration: instant ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 font-bn-body text-base leading-relaxed text-charcoal/70">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center font-bn-body text-text-light">
          <Link href="/faq" className="text-mustard underline decoration-mustard/40 underline-offset-4 hover:text-maroon">
            সব প্রশ্নের উত্তর দেখুন →
          </Link>
        </p>
      </div>
    </section>
  );
}
