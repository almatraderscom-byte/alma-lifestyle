'use client';

import { motion, useReducedMotion } from 'framer-motion';

function ProgressStep({ delay, text }: { delay: number; text: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay * 0.4 + 0.5 }}
      className="flex items-center gap-3 text-sm text-white/70 font-bn-body"
    >
      <motion.div
        className="h-5 w-5 shrink-0 rounded-full border-2 border-[#7c5cff]"
        animate={
          reduceMotion
            ? { backgroundColor: '#7c5cff' }
            : { backgroundColor: ['transparent', '#7c5cff', '#7c5cff'] }
        }
        transition={{ delay: delay * 0.4 + 0.7, duration: 0.3 }}
      />
      <span>{text}</span>
    </motion.div>
  );
}

export function OrderSubmittingAnimation() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0a12]"
      role="status"
      aria-live="polite"
      aria-label="অর্ডার প্রসেস হচ্ছে"
    >
      <div className="mx-auto max-w-md px-6 text-center">
        <div className="relative mb-8 h-48 overflow-hidden rounded-2xl border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1830] via-[#141322] to-[#0d0c16]" />

          {!reduceMotion && (
            <motion.div
              className="absolute right-12 top-4 h-12 w-12 rounded-full bg-amber-300"
              style={{ boxShadow: '0 0 40px rgba(252, 211, 77, 0.6)' }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {!reduceMotion && (
            <motion.div
              className="absolute bottom-12 left-0 flex"
              animate={{ x: [0, -400] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
              {[...Array(12)].map((_, i) => (
                <div key={i} className="mx-3 w-16 shrink-0">
                  <div
                    className="rounded-t bg-neutral-300/50"
                    style={{ height: 24 + (i % 3) * 10, width: 36 + (i % 2) * 8 }}
                  />
                </div>
              ))}
            </motion.div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-20 bg-charcoal/90">
            {!reduceMotion && (
              <motion.div
                className="absolute left-0 top-1/2 flex h-1 w-[200%] -translate-y-1/2"
                animate={{ x: [0, -96] }}
                transition={{ duration: 0.45, repeat: Infinity, ease: 'linear' }}
              >
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="mr-8 h-1 w-12 shrink-0 bg-amber-200" />
                ))}
              </motion.div>
            )}
          </div>

          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
            animate={reduceMotion ? undefined : { y: [0, -3, 0, -2, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <DeliveryRiderSvg animateWheels={!reduceMotion} />
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-bn-heading text-2xl font-bold text-white md:text-3xl">
            আপনার অর্ডার প্রসেস হচ্ছে...
          </h2>
          <p className="mt-3 font-bn-body text-white/60">
            একটু অপেক্ষা করুন, আমরা সব তথ্য সংরক্ষণ করছি
          </p>

          <div className="mt-8 space-y-3 text-left">
            <ProgressStep delay={0} text="অর্ডার তৈরি হচ্ছে..." />
            <ProgressStep delay={1} text="তথ্য যাচাই করা হচ্ছে..." />
            <ProgressStep delay={2} text="নোটিফিকেশন পাঠানো হচ্ছে..." />
            <ProgressStep delay={3} text="ALMA পরিবারে যোগ দিতে প্রস্তুতি..." />
          </div>
        </motion.div>

        <p className="mt-8 font-bn-body text-xs text-white/40">ALMA পরিবারে স্বাগতম</p>
      </div>
    </div>
  );
}

function DeliveryRiderSvg({ animateWheels }: { animateWheels: boolean }) {
  const wheelSpin = animateWheels
    ? { rotate: 360, transition: { duration: 0.45, repeat: Infinity, ease: 'linear' as const } }
    : undefined;

  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden>
      <motion.g
        animate={wheelSpin}
        style={{ transformOrigin: '25px 60px', transformBox: 'fill-box' }}
      >
        <circle cx="25" cy="60" r="12" stroke="#1a1a1a" strokeWidth="3" fill="#444" />
        <line x1="25" y1="48" x2="25" y2="72" stroke="#888" strokeWidth="1.5" />
        <line x1="13" y1="60" x2="37" y2="60" stroke="#888" strokeWidth="1.5" />
      </motion.g>
      <motion.g
        animate={wheelSpin}
        style={{ transformOrigin: '95px 60px', transformBox: 'fill-box' }}
      >
        <circle cx="95" cy="60" r="12" stroke="#1a1a1a" strokeWidth="3" fill="#444" />
        <line x1="95" y1="48" x2="95" y2="72" stroke="#888" strokeWidth="1.5" />
        <line x1="83" y1="60" x2="107" y2="60" stroke="#888" strokeWidth="1.5" />
      </motion.g>
      <path d="M25 58 L55 38 L90 58" stroke="#C97D5D" strokeWidth="3" fill="#C97D5D" />
      <rect
        x="48"
        y="20"
        width="28"
        height="22"
        rx="2"
        fill="#6B2737"
        stroke="#1a1a1a"
        strokeWidth="1.5"
      />
      <text
        x="62"
        y="35"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontFamily="serif"
        fontWeight="bold"
      >
        ALMA
      </text>
      <circle cx="60" cy="25" r="6" fill="#FDB58F" stroke="#1a1a1a" strokeWidth="1.5" />
      <path
        d="M60 31 L55 45 M60 31 L65 45"
        stroke="#1a1a1a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M53 20 Q60 14 67 20 L67 24 L53 24 Z" fill="#1a1a1a" />
    </svg>
  );
}
