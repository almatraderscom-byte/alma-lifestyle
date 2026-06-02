'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { formatBnText } from '@/lib/format-bn';
import { getTextFontClass, splitTextForAnimation } from '@/lib/text-utils';
import { cn } from '@/lib/utils';
import type { CollectionBannerSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { getDefaultImageForHint } from '@/lib/default-images';
import { EASE_PREMIUM } from '@/lib/animation-variants';

interface CollectionBannerEditorialProps {
  data?: CollectionBannerSectionData;
}

function AnimatedTitle({
  text,
  active,
}: {
  text: string;
  active: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const fontClass = getTextFontClass(text, 'display');
  const units = splitTextForAnimation(text);
  const headingClass = cn(
    fontClass,
    'text-[2.2rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold text-cream leading-[1.25]'
  );

  if (reduceMotion || units.length <= 1) {
    return <h2 className={headingClass}>{text}</h2>;
  }

  return (
    <h2 className={headingClass}>
      {units.map((unit, i) => (
        <motion.span
          key={`${i}-${unit}`}
          className="inline-block"
          style={unit === ' ' ? { width: '0.35em' } : undefined}
          initial={{ opacity: 0, y: 50, rotateX: -90 }}
          animate={
            active
              ? { opacity: 1, y: 0, rotateX: 0 }
              : { opacity: 0, y: 50, rotateX: -90 }
          }
          transition={{
            duration: 0.6,
            delay: 0.35 + i * 0.05,
            ease: [0.215, 0.61, 0.355, 1],
          }}
        >
          {unit === ' ' ? '\u00A0' : unit}
        </motion.span>
      ))}
    </h2>
  );
}

export function CollectionBannerEditorial({ data: dataProp }: CollectionBannerEditorialProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px', amount: 0.3 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const touchActiveRef = useRef(false);

  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'collectionBanner')!.data;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  const bannerFallback = getDefaultImageForHint(
    data.imageHint || 'Eid collection banner'
  );
  const titleUnits = splitTextForAnimation(data.title);
  const subtitleDelay = 0.45 + titleUnits.length * 0.05 + 0.2;
  const ctaDelay = subtitleDelay + 0.2;

  const updatePointerPosition = useCallback((clientX: number, clientY: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setMousePos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const touch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setIsTouchDevice(touch);

    const section = sectionRef.current;
    if (!section) return;

    const handleMouseMove = (e: MouseEvent) => {
      updatePointerPosition(e.clientX, e.clientY);
    };
    const handleEnter = () => setIsHovering(true);
    const handleLeave = () => setIsHovering(false);

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchActiveRef.current = true;
      setIsHovering(true);
      updatePointerPosition(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchActiveRef.current || e.touches.length !== 1) return;
      updatePointerPosition(e.touches[0].clientX, e.touches[0].clientY);
    };

    const endTouch = () => {
      touchActiveRef.current = false;
      setIsHovering(false);
    };

    section.addEventListener('mousemove', handleMouseMove);
    section.addEventListener('mouseenter', handleEnter);
    section.addEventListener('mouseleave', handleLeave);
    section.addEventListener('touchstart', handleTouchStart, { passive: true });
    section.addEventListener('touchmove', handleTouchMove, { passive: true });
    section.addEventListener('touchend', endTouch);
    section.addEventListener('touchcancel', endTouch);

    return () => {
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('mouseenter', handleEnter);
      section.removeEventListener('mouseleave', handleLeave);
      section.removeEventListener('touchstart', handleTouchStart);
      section.removeEventListener('touchmove', handleTouchMove);
      section.removeEventListener('touchend', endTouch);
      section.removeEventListener('touchcancel', endTouch);
    };
  }, [reduceMotion, updatePointerPosition]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative min-h-[70vh] md:min-h-[760px] flex items-center justify-center overflow-hidden pattern-overlay',
        !isTouchDevice && !reduceMotion && 'cursor-crosshair'
      )}
    >
      <motion.div className="absolute inset-0 scale-110" style={reduceMotion ? undefined : { y: bgY }}>
        <HomepageSectionImage
          src={data.backgroundImageUrl}
          fallbackSrc={bannerFallback}
          alt={data.title}
          sizes="100vw"
          priority
        />
      </motion.div>

      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          opacity: isHovering && !reduceMotion ? 0.4 : 0.55,
        }}
        aria-hidden
      />
      {isHovering && !reduceMotion && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(
              circle 350px at ${mousePos.x}% ${mousePos.y}%,
              transparent 0%,
              transparent 30%,
              rgba(0,0,0,0.3) 70%,
              rgba(0,0,0,0.6) 100%
            )`,
          }}
          aria-hidden
        />
      )}

      <div className="relative z-10 text-center px-6 md:px-12 max-w-4xl py-20 md:py-28">
        <motion.p
          className="editorial-label text-mustard mb-6 mx-auto w-fit tracking-[0.16em]"
          initial={reduceMotion ? false : { opacity: 0, y: -10 }}
          animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.4, ease: EASE_PREMIUM }}
        >
          {data.label || 'বিশেষ আয়োজন'}
        </motion.p>

        <AnimatedTitle text={data.title} active={isInView || Boolean(reduceMotion)} />

        <motion.p
          className="font-bn-body text-lg md:text-xl text-cream/85 mt-5"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: subtitleDelay, ease: EASE_PREMIUM }}
        >
          {data.subtitle}
        </motion.p>

        <motion.div
          className="mt-10"
          initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
          animate={isInView || reduceMotion ? { scale: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.5, delay: ctaDelay, ease: EASE_PREMIUM }}
        >
          <motion.div
            animate={reduceMotion ? undefined : { boxShadow: ['0 0 0 rgba(201,125,93,0.0)', '0 0 24px rgba(201,125,93,0.28)', '0 0 0 rgba(201,125,93,0.0)'] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block rounded"
          >
            <Link
              href={data.href}
              className="inline-flex items-center justify-center min-h-14 px-10 bg-cream text-charcoal font-bn-body text-lg font-semibold rounded hover:bg-white transition-colors duration-300"
            >
              {data.cta} →
            </Link>
          </motion.div>
        </motion.div>
        {data.promo && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 100 }}
            animate={
              isInView || reduceMotion
                ? reduceMotion
                  ? { opacity: 1, x: 0 }
                  : { opacity: 1, x: 0, y: [0, -8, 0] }
                : undefined
            }
            transition={{
              opacity: { duration: 0.6, delay: 1 },
              x: { duration: 0.6, delay: 1, ease: EASE_PREMIUM },
              y: { duration: 3, delay: 1.5, ease: 'easeInOut', repeat: Infinity },
            }}
            className="mt-6 inline-block px-6 py-2 bg-mustard/20 backdrop-blur-sm border border-mustard/50 rounded-full"
          >
            <span className="font-bn-body text-mustard text-sm font-medium">
              {formatBnText(data.promo)}
            </span>
          </motion.div>
        )}
        <p className="sr-only">{data.imageHint}</p>
      </div>
    </section>
  );
}
