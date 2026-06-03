'use client';

import { useRef, type MouseEvent } from 'react';
import {
  DoorOpen,
  HandHeart,
  Package,
  Ruler,
  Shield,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { MURDA_MOSHARI_PAGE } from '@/lib/content';
import {
  calmEase,
  fadeUp,
  murdaViewport,
  useMurdaMotionTiming,
} from '@/components/product/murda-moshari/animation-config';

const FEATURE_ICONS: LucideIcon[] = [
  Shield,
  Wind,
  DoorOpen,
  HandHeart,
  Package,
  Ruler,
  Ruler,
  Ruler,
];

function FeatureCard({
  title,
  desc,
  Icon,
  index,
  cols,
}: {
  title: string;
  desc: string;
  Icon: LucideIcon;
  index: number;
  cols: number;
}) {
  const reduced = useReducedMotion();
  const { duration, stagger, transition } = useMurdaMotionTiming();
  const cardRef = useRef<HTMLDivElement>(null);
  const row = Math.floor(index / cols);
  const col = index % cols;
  const cascadeDelay = (row + col) * stagger(0.08);

  const cardInner = (
    <>
      <motion.div
        className="text-emerald"
        {...(!reduced && {
          initial: { opacity: 0, scale: 0.85 },
          whileInView: { opacity: 1, scale: 1 },
          viewport: murdaViewport,
          transition: transition({ duration: duration(0.5), delay: cascadeDelay + duration(0.35) }),
          whileHover: { scale: 1.08, transition: { duration: 0.3, ease: calmEase } },
        })}
      >
        <Icon className="h-8 w-8" strokeWidth={1.5} aria-hidden />
      </motion.div>
      <h3 className="font-bn-heading mt-4 text-lg font-bold text-charcoal">{title}</h3>
      <p className="font-bn-body mt-2 text-sm leading-relaxed text-charcoal/70">{desc}</p>
    </>
  );

  if (reduced) {
    return (
      <div className="h-full rounded-2xl border border-border-subtle bg-cream/40 p-6">
        {cardInner}
      </div>
    );
  }

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el || window.innerWidth < 768) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--tilt-x', `${-y * 8}deg`);
    el.style.setProperty('--tilt-y', `${x * 8}deg`);
  }

  function handleLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  }

  return (
    <motion.div
      ref={cardRef}
      className="h-full rounded-2xl border border-border-subtle bg-cream/40 p-6 md:[transform-style:preserve-3d]"
      style={{
        transform: 'perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))',
        ['--tilt-x' as string]: '0deg',
        ['--tilt-y' as string]: '0deg',
      }}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={murdaViewport}
      transition={transition({ duration: duration(0.65), delay: cascadeDelay })}
      whileHover={{
        y: -4,
        zIndex: 1,
        boxShadow: '0 0 24px rgba(200, 155, 60, 0.15)',
        borderColor: 'rgba(200, 155, 60, 0.55)',
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {cardInner}
    </motion.div>
  );
}

export function FeatureGridSection() {
  const { features } = MURDA_MOSHARI_PAGE;
  const reduced = useReducedMotion();
  const Wrapper = reduced ? 'section' : motion.section;

  return (
    <Wrapper className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4" style={{ perspective: '1000px' }}>
        <h2 className="font-bn-heading text-center text-2xl text-charcoal md:text-3xl">
          {features.heading}
        </h2>
        <p className="font-bn-body mt-3 text-center text-sm text-charcoal/70 md:text-base">
          {features.subheading}
        </p>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.items.map((item, index) => (
            <FeatureCard
              key={item.title}
              title={item.title}
              desc={item.desc}
              Icon={FEATURE_ICONS[index] ?? Shield}
              index={index}
              cols={4}
            />
          ))}
        </div>
      </div>
    </Wrapper>
  );
}
