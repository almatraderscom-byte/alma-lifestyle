'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { CinematicHeroContent } from '@/lib/cinematic-content-types';
import type { ObsidianCard } from './obsidian-data';

interface ObsidianHeroProps {
  hero?: CinematicHeroContent;
  products: ObsidianCard[];
}

/** 3D coverflow transform for a card given its offset from the active index. */
function cardStyle(i: number, active: number, n: number): React.CSSProperties {
  let off = i - active;
  if (off > n / 2) off -= n;
  if (off < -n / 2) off += n;
  const abs = Math.abs(off);
  const x = off * 45;
  const z = -abs * 340;
  const ry = off * -44;
  const scale = 1 - abs * 0.11;
  const op = abs > 2 ? 0 : 1 - abs * 0.24;
  return {
    transform: `translateX(${x}%) translateZ(${z}px) rotateY(${ry}deg) scale(${scale})`,
    opacity: op,
    zIndex: 100 - abs,
    filter: abs === 0 ? 'none' : 'brightness(.5) saturate(.85)',
    pointerEvents: op ? 'auto' : 'none',
  };
}

export function ObsidianHero({ hero, products }: ObsidianHeroProps) {
  const slides = products.slice(0, 6);
  const n = slides.length || 1;
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((i: number) => setActive((((i % n) + n) % n)), [n]);

  const resetAuto = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (n > 1) {
      timer.current = setInterval(() => setActive((a) => (a + 1) % n), 5000);
    }
  }, [n]);

  useEffect(() => {
    resetAuto();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [resetAuto]);

  const current = slides[active];
  const ghost = (hero?.brandName || 'ALMA').split(' ')[0];
  const videoSrc = hero?.videoSrc?.trim();
  const posterSrc = hero?.posterSrc?.trim();

  return (
    <section className="hero" id="hero">
      {videoSrc ? (
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc || undefined}
          style={{ objectPosition: hero?.mediaObjectPosition || 'center' }}
        >
          <source src={videoSrc} />
        </video>
      ) : posterSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="hero-video" src={posterSrc} alt="" aria-hidden />
      ) : null}

      <div className="hero-wash" aria-hidden />
      <div className="hero-ghost anton" aria-hidden>
        {ghost}
      </div>

      <div className="hero-carousel">
        <div className="c-track">
          {slides.map((p, i) => (
            <div
              key={p.id}
              className="c-card"
              style={cardStyle(i, active, n)}
              onClick={() => {
                setActive(i);
                resetAuto();
              }}
            >
              <div className="c-in">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={p.title} />
                <div className="veil" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-fade" aria-hidden />

      <div className="hero-overlay">
        <div className="container">
          <div className="ov-left">
            {current && (
              <>
                <div className="ov-tags">
                  <span className="ob-tag">
                    <span aria-hidden>🔥</span> HOT
                  </span>
                  <span className="ob-tag bn">{current.categoryLabel}</span>
                </div>
                <h1
                  className="ov-title bn-serif"
                  style={{ fontFamily: 'var(--font-noto-serif-bengali), serif' }}
                >
                  {current.title}
                </h1>
                <div className="ov-sub">{hero?.subheading || 'ALMA LIFESTYLE · SIGNATURE COLLECTION'}</div>
                <div className="ov-price price">
                  {current.priceText}
                  {current.compareAtText && <span className="was">{current.compareAtText}</span>}
                </div>
                <div className="ov-cta">
                  <Link href={current.href} className="ob-btn solid">
                    Shop Now
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="ov-right">
            <Link href="/products" className="see-all bn">
              সব পণ্য দেখুন ▶
            </Link>
            <div className="thumbs">
              {slides.map((p, i) => (
                <button
                  key={`th-${p.id}`}
                  type="button"
                  className={`thumb${i === active ? ' act' : ''}`}
                  aria-label={p.title}
                  onClick={() => {
                    setActive(i);
                    resetAuto();
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt="" />
                </button>
              ))}
            </div>
            <div className="c-nav">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => {
                  go(active - 1);
                  resetAuto();
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => {
                  go(active + 1);
                  resetAuto();
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
