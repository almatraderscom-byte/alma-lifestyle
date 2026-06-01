'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { scrollViewport } from '@/lib/animation-variants';

const features = [
  {
    icon: '🧵',
    title: 'হাতে তৈরি',
    description: 'প্রতিটি পোশাক হাতে বুনন এবং সেলাই করা — মেশিনের ব্যবহার ন্যূনতম',
  },
  {
    icon: '✨',
    title: 'প্রিমিয়াম কাপড়',
    description: 'বাংলাদেশের সেরা মানের কটন এবং সিল্ক কাপড় ব্যবহার করি',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'পারিবারিক মিল',
    description: 'বাবা, মা, ছেলে, মেয়ে — সবার জন্য মিলিয়ে মিলিয়ে ডিজাইন',
  },
  {
    icon: '🚚',
    title: '৩ দিনে ডেলিভারি',
    description: '৬৪ জেলায় দ্রুত ডেলিভারি সেবা — ঢাকার বাইরে কুরিয়ার',
  },
  {
    icon: '💳',
    title: 'নিরাপদ পেমেন্ট',
    description: 'bKash, Nagad, ক্যাশ অন ডেলিভারি — যেটা পছন্দ সেটাই',
  },
  {
    icon: '↩️',
    title: 'ফেরত গ্যারান্টি',
    description: 'কোয়ালিটি পছন্দ না হলে ৭ দিনের মধ্যে ফেরত দিতে পারবেন',
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
            ALMA মানে শুধু পোশাক না — এটা বাংলাদেশের ঐতিহ্য, পরিবারের ভালোবাসা, এবং প্রিমিয়াম
            মানের প্রতিশ্রুতি
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
