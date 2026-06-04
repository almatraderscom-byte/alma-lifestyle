'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    id: 'quality',
    title: 'প্রিমিয়াম কোয়ালিটি',
    description: 'সাবধানে বাছাই করা প্রতিটি পণ্য — কাপড় থেকে electronics, মান গ্যারান্টিযুক্ত',
    Icon: DiamondIcon,
  },
  {
    id: 'design',
    title: 'এলিগেন্ট ডিজাইন',
    description: 'Latest trend এবং classic style এর নিখুঁত মিশ্রণ — আধুনিক পরিবারের জন্য',
    Icon: WeaveIcon,
  },
  {
    id: 'family',
    title: 'পরিবার ম্যাচিং',
    description: 'বাবা, মা, ছেলে, মেয়ে — সবার জন্য মিলিয়ে design করা special collection',
    Icon: FamilyIcon,
  },
  {
    id: 'delivery',
    title: 'দ্রুত ডেলিভারি',
    description: '৬৪ জেলায় ৩-৫ কার্যদিবসে ডেলিভারি — ঢাকার মধ্যে আরও দ্রুত',
    Icon: DeliveryIcon,
  },
  {
    id: 'payment',
    title: 'সুবিধাজনক পেমেন্ট',
    description: 'bKash, Nagad, ক্যাশ অন ডেলিভারি — যেটা আপনার পছন্দ সেটাই',
    Icon: PaymentIcon,
  },
  {
    id: 'trust',
    title: 'বিশ্বস্ত সেবা',
    description: '১০০% অরিজিনাল পণ্যের গ্যারান্টি — পছন্দ না হলে সহজ রিটার্ন policy',
    Icon: ShieldIcon,
  },
] as const;

function IconDraw({ children, draw }: { children: React.ReactNode; draw: boolean }) {
  return (
    <div className="mx-auto h-20 w-20 text-mustard" aria-hidden>
      {children}
    </div>
  );
}

function DiamondIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full">
      <motion.path
        d="M40 12 L62 32 L40 68 L18 32 Z M40 12 L40 68"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: draw ? 1 : 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.circle
        cx="58"
        cy="22"
        r="1.5"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: draw ? 1 : 0 }}
        transition={{ delay: 1.2, duration: 0.35 }}
      />
      <motion.circle
        cx="22"
        cy="26"
        r="1"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: draw ? 1 : 0 }}
        transition={{ delay: 1.35, duration: 0.35 }}
      />
    </svg>
  );
}

function WeaveIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full">
      {[18, 32, 46, 60].map((y, i) => (
        <motion.path
          key={y}
          d={`M12 ${y} H68`}
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: draw ? 1 : 0 }}
          transition={{ duration: 1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
      {[24, 40, 56].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 14 V66`}
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: draw ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </svg>
  );
}

function FamilyIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full">
      <motion.circle cx="28" cy="26" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.8 }} />
      <motion.circle cx="52" cy="26" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.1 }} />
      <motion.path d="M18 58 Q28 42 40 48 Q52 42 62 58" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 1, delay: 0.2 }} />
      <motion.circle cx="40" cy="58" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.35 }} />
    </svg>
  );
}

function DeliveryIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full">
      <motion.path d="M14 48 H46 L58 36 H66 V48 H14" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 1.1 }} />
      <motion.circle cx="24" cy="52" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.8 }} />
      <motion.circle cx="52" cy="52" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.9 }} />
      <motion.path d="M10 32 Q40 18 70 32" stroke="currentColor" strokeWidth="1.2" fill="none" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 1.2, delay: 0.3 }} />
    </svg>
  );
}

function PaymentIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full">
      <motion.rect x="16" y="24" width="48" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 1 }} />
      <motion.path d="M16 34 H64 M28 48 H52" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.4 }} />
      <motion.path d="M22 58 V62 M40 58 V62 M58 58 V62" stroke="currentColor" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.5, delay: 0.7 }} />
    </svg>
  );
}

function ShieldIcon({ draw }: { draw: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full">
      <motion.path d="M40 12 L62 22 V38 C62 52 52 64 40 68 C28 64 18 52 18 38 V22 Z" stroke="currentColor" strokeWidth="1.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 1.2 }} />
      <motion.path d="M32 40 L38 46 L50 32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }} transition={{ duration: 0.6, delay: 1 }} />
    </svg>
  );
}

function PillarCard({
  feature,
  index,
  instant,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
  instant: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });
  const draw = instant || inView;
  const Icon = feature.Icon;

  return (
    <motion.article
      ref={ref}
      className="group rounded-sm border border-mustard/10 bg-cream p-8 text-center transition-shadow duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(200,155,60,0.15)]"
      initial={instant ? false : { opacity: 0, y: 24 }}
      animate={instant || inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ delay: instant ? 0 : index * 0.12, duration: 0.55 }}
    >
      <IconDraw draw={draw}>
        <Icon draw={draw} />
      </IconDraw>
      <h3 className="mt-6 font-bn-heading text-xl font-semibold text-charcoal">{feature.title}</h3>
      <motion.span
        className="mx-auto mt-3 block h-0.5 w-8 bg-mustard"
        initial={instant ? { scaleX: 1 } : { scaleX: 0 }}
        animate={draw ? { scaleX: 1 } : undefined}
        transition={{ delay: instant ? 0 : 1.1, duration: 0.45 }}
      />
      <p className="mt-4 font-bn-body text-sm leading-relaxed text-charcoal/70">{feature.description}</p>
    </motion.article>
  );
}

export function CinematicWhyAlma() {
  const reduced = useReducedMotion();
  const instant = !!reduced;

  return (
    <section className="bg-cream px-6 py-20 lg:px-16" aria-labelledby="why-alma-heading">
      <div className="mx-auto max-w-6xl text-center">
        <p className="font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">কেন ALMA</p>
        <h2 id="why-alma-heading" className="mt-4 font-bn-heading text-4xl font-bold text-charcoal md:text-5xl">
          আমাদের গর্ব, আপনার বিশ্বাস
        </h2>
        <p className="mx-auto mt-4 max-w-2xl font-bn-body text-base text-charcoal/70 md:text-lg">
          ALMA — যেখানে প্রিমিয়াম মিলে সাধ্যের সাথে। আমরা বাছাই করি, আপনি পান।
        </p>
      </div>
      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <PillarCard key={feature.id} feature={feature} index={index} instant={instant} />
        ))}
      </div>
    </section>
  );
}
