'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { scrollViewport } from '@/lib/animation-variants';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: '🧶',
    title: 'কাপড় নির্বাচন',
    description:
      'সিরাজগঞ্জ, নরসিংদী ও কুমিল্লার তাঁতিদের কাছ থেকে সরাসরি কটন ও সিল্ক বাছাই করি। প্রতিটি রোলের গুণমান হাতে যাচাই করা হয়।',
    bgClass: 'bg-terracotta',
  },
  {
    icon: '✏️',
    title: 'ডিজাইন',
    description:
      'ঐতিহ্যবাহী মোটিফ ও আধুনিক কাটের সমন্বয়ে স্কেচ তৈরি হয়। পরিবার সেটের জন্য রঙ ও প্যাটার্ন একসাথে মিলিয়ে নেওয়া হয়।',
    bgClass: 'bg-maroon',
  },
  {
    icon: '🪡',
    title: 'হাতে বুনন',
    description:
      '৭০+ পরিবারের তাঁতিদের হাতে বোনা হয় প্রতিটি কাপড়। মেশিনের ব্যবহার শুধুমাত্র কাঠামোর জন্য, বুনন পুরোটাই হাতে।',
    bgClass: 'bg-mustard',
  },
  {
    icon: '🧵',
    title: 'সেলাই',
    description:
      'অভিজ্ঞ দর্জিরা প্রতিটি সীম সেলাই করেন। ফিটিং, কলার ও কাফের কাজে বিশেষ যত্ন নেওয়া হয় যাতে ঈদ বা অনুষ্ঠানে আরামদায়ক থাকে।',
    bgClass: 'bg-emerald',
  },
  {
    icon: '🔍',
    title: 'কোয়ালিটি চেক',
    description:
      'প্রতিটি পিস তিন ধাপে পরীক্ষা — কাপড়, সেলাই ও ফিনিশিং। কোনো ত্রুটি থাকলে পুনরায় কাজ করা হয়, গ্রাহকের কাছে যায় না।',
    bgClass: 'bg-charcoal',
  },
  {
    icon: '📦',
    title: 'প্যাকেজিং ও ডেলিভারি',
    description:
      'প্রিমিয়াম বক্সে মোড়ানো হয়, ৬৪ জেলায় ১–৫ দিনে পৌঁছে দেওয়া হয়। ঢাকায় ১–২ দিন, বাইরে কুরিয়ার সেবা।',
    bgClass: 'bg-[#92400e]',
  },
];

export function OurProcess() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section-padding bg-warm-white">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={scrollViewport}
          className="mb-12 text-center md:mb-16"
        >
          <p className="editorial-label mb-3 text-terracotta">আমাদের প্রক্রিয়া</p>
          <h2 className="font-bn-heading text-3xl font-bold text-charcoal md:text-4xl">
            কাপড় থেকে আপনার দরজায়
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-bn-body text-text-light">
            ছয়টি ধাপে তৈরি হয় প্রতিটি ALMA পোশাক — স্বচ্ছতা ও মানের প্রতিশ্রুতি
          </p>
        </motion.div>

        <div className="relative md:px-4">
          <div
            className="absolute left-4 top-0 bottom-0 w-px bg-border-subtle md:left-1/2 md:-translate-x-px"
            aria-hidden
          />

          <ol className="space-y-10 md:space-y-14">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.li
                  key={step.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.55 }}
                  viewport={scrollViewport}
                  className={cn(
                    'relative grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-12',
                    !isEven && 'md:[&>div:first-child]:order-2'
                  )}
                >
                  <div
                    className={cn(
                      'pl-10 md:pl-0',
                      isEven ? 'md:pr-12 md:text-right' : 'md:pl-12'
                    )}
                  >
                    <span className="text-3xl" aria-hidden>
                      {step.icon}
                    </span>
                    <h3 className="font-bn-heading mt-2 text-xl font-bold text-charcoal">
                      {step.title}
                    </h3>
                    <p className="font-bn-body mt-3 text-text-light leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className={cn('pl-10 md:pl-0', !isEven && 'md:order-1')}>
                    <PlaceholderImage
                      hint={`Image: ${step.title}`}
                      bgClass={cn(step.bgClass, 'aspect-[4/3] w-full rounded-lg')}
                    />
                  </div>

                  <span
                    className="absolute left-4 top-2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-terracotta font-bn-body text-sm font-bold text-white md:left-1/2"
                    aria-hidden
                  >
                    {idx + 1}
                  </span>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
