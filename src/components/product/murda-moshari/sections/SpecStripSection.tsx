'use client';

import { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { useMurdaPage } from '@/components/product/murda-moshari/MurdaPageContext';
import { toBanglaNumber } from '@/lib/format-bn';
import {
  calmEase,
  murdaViewport,
  patternDiamondStyle,
  useMurdaMotionTiming,
} from '@/components/product/murda-moshari/animation-config';

function formatSpecBn(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const [whole, frac] = String(rounded).split('.');
  const wholeBn = toBanglaNumber(Number(whole));
  if (!frac) return wholeBn;
  const fracBn = frac
    .split('')
    .map((d) => toBanglaNumber(Number(d)))
    .join('');
  return `${wholeBn}.${fracBn}`;
}

function AnimatedSpecValue({
  target,
  label,
  unit,
  labelPath,
  unitPath,
}: {
  target: number;
  label: string;
  unit: string;
  labelPath: string;
  unitPath: string;
}) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, murdaViewport);
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v) => formatSpecBn(v));
  const [text, setText] = useState(() => formatSpecBn(reduced ? target : 0));
  const [metaVisible, setMetaVisible] = useState(reduced);
  const { duration, transition } = useMurdaMotionTiming();

  useMotionValueEvent(display, 'change', setText);

  useEffect(() => {
    if (reduced) {
      setText(formatSpecBn(target));
      setMetaVisible(true);
      return;
    }
    if (!inView) return;
    const controls = animate(motionVal, target, {
      duration: duration(1.2),
      ease: calmEase,
    });
    const t = window.setTimeout(() => setMetaVisible(true), duration(1.2) * 1000 + 200);
    return () => {
      controls.stop();
      window.clearTimeout(t);
    };
  }, [inView, reduced, target, motionVal, duration]);

  return (
    <div ref={containerRef} className="px-2 py-4 text-center md:px-6">
      <p className="font-bn-heading text-5xl font-bold text-emerald md:text-7xl">
        {reduced ? formatSpecBn(target) : text}
      </p>
      {metaVisible && (
        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transition({ duration: duration(0.25) })}
        >
          <p
            data-cms-field={unitPath}
            data-cms-label="Spec unit"
            className="font-bn-body mt-1 text-sm text-charcoal/70"
          >
            {unit}
          </p>
          <p
            data-cms-field={labelPath}
            data-cms-label="Spec label"
            className="font-bn-body mt-2 text-xs uppercase tracking-widest text-charcoal/60"
          >
            {label}
          </p>
        </motion.div>
      )}
    </div>
  );
}

export function SpecStripSection() {
  const { specs } = useMurdaPage();
  const specRows = [
    { target: 10.5, label: specs.length.label, unit: specs.length.unit, key: 'length' },
    { target: 6.5, label: specs.width.label, unit: specs.width.unit, key: 'width' },
    { target: 6.5, label: specs.height.label, unit: specs.height.unit, key: 'height' },
  ];
  const reduced = useReducedMotion();
  const Wrapper = reduced ? 'section' : motion.section;
  const Spin = reduced ? 'div' : motion.div;

  return (
    <Wrapper className="relative overflow-visible bg-cream py-12 md:py-16">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <Spin
          className="absolute -inset-[40%] opacity-[0.03]"
          style={patternDiamondStyle}
          {...(!reduced && {
            animate: { rotate: -360 },
            transition: { duration: 300, repeat: Infinity, ease: 'linear' },
          })}
        />
      </div>
      <div className="relative mx-auto max-w-4xl px-4">
        <div className="grid grid-cols-3 divide-x divide-border-subtle">
          {specRows.map((spec, i) => (
            <AnimatedSpecValue
              key={`${spec.label}-${i}`}
              target={spec.target}
              label={spec.label}
              unit={spec.unit}
              labelPath={`specs.${spec.key}.label`}
              unitPath={`specs.${spec.key}.unit`}
            />
          ))}
        </div>
      </div>
    </Wrapper>
  );
}
