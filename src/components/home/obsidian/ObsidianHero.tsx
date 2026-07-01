'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { CinematicHeroContent } from '@/lib/cinematic-content-types';
import type { ObsidianCard } from './obsidian-data';

interface ObsidianHeroProps {
  hero?: CinematicHeroContent;
  products: ObsidianCard[];
}

/** A coverflow slide is either a real product card or the CMS hero video.
 *  The video occupies one of the 3D cards (in place of a product image) rather
 *  than sitting behind the hero — so the WebGL orb shows through the backdrop. */
type HeroSlide =
  | { kind: 'product'; key: string; card: ObsidianCard }
  | { kind: 'video'; key: string; videoSrc: string; posterSrc: string; objectPosition: string };

/** Per-slide accent themes — the hero orb, wash + spotlight recolour to these as
 *  the carousel cycles (faithful to the demo's per-product theming). */
const HERO_THEMES = ['#ffb524', '#7c5cff', '#1f7bff', '#ff2d55', '#00e0a0', '#ff6a00'];

/** rgba() string from a #hex + alpha. */
function hexRGBA(hex: string, a: number): string {
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
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
  const heroVideoSrc = hero?.videoSrc?.trim() ?? '';
  const heroPosterSrc = hero?.posterSrc?.trim() ?? '';

  // Build the coverflow: the CMS hero video (if any) becomes the FIRST 3D card,
  // in place of a product image; the rest are product cards. No background video.
  const productSlides: HeroSlide[] = products.map((c) => ({ kind: 'product', key: c.id, card: c }));
  const slides: HeroSlide[] = (
    heroVideoSrc
      ? [
          {
            kind: 'video',
            key: 'hero-video',
            videoSrc: heroVideoSrc,
            posterSrc: heroPosterSrc,
            objectPosition: hero?.mediaObjectPosition || 'center',
          } as HeroSlide,
          ...productSlides,
        ]
      : productSlides
  ).slice(0, 6);
  const n = slides.length || 1;
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(0);
  activeRef.current = active;

  const go = useCallback((i: number) => setActive((((i % n) + n) % n)), [n]);

  // Front-card life: slow idle sway + mouse-follow 3D tilt on the ACTIVE card only
  // (faithful to the demo's `sway()` loop). Non-active cards keep the coverflow layout.
  useEffect(() => {
    const car = carouselRef.current;
    if (!car) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const ins = Array.from(car.querySelectorAll<HTMLElement>('.c-in'));
    if (!ins.length) return;
    let tgX = 0;
    let tgY = 0;
    let mtX = 0;
    let mtY = 0;
    let over = false;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = car.getBoundingClientRect();
      tgX = (e.clientX - r.left) / r.width - 0.5;
      tgY = (e.clientY - r.top) / r.height - 0.5;
      over = true;
    };
    const onLeave = () => {
      over = false;
    };
    car.addEventListener('pointermove', onMove);
    car.addEventListener('pointerleave', onLeave);
    const sway = () => {
      const t = performance.now() / 1000;
      mtX += ((over ? tgX : 0) - mtX) * 0.06;
      mtY += ((over ? tgY : 0) - mtY) * 0.06;
      const idleY = Math.sin(t * 0.55) * 6.0;
      const idleX = Math.sin(t * 0.4 + 1.1) * 3.0;
      const cur = activeRef.current;
      for (let i = 0; i < ins.length; i++) {
        const el = ins[i];
        if (!el) continue;
        if (i === cur) {
          // Persistent base tilt (BASE_RY/BASE_RX) so the front card always reads
          // as a 3D plane — not a flat billboard — then idle sway + mouse-follow on
          // top. Depth is real because `.c-card` is now `transform-style:preserve-3d`.
          const BASE_RY = -13;
          const BASE_RX = 7;
          const ry = BASE_RY + idleY + mtX * 18;
          const rx = BASE_RX + idleX - mtY * 14;
          el.style.transform = `rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
        } else if (el.style.transform !== '') {
          el.style.transform = '';
        }
      }
      raf = requestAnimationFrame(sway);
    };
    raf = requestAnimationFrame(sway);
    return () => {
      cancelAnimationFrame(raf);
      car.removeEventListener('pointermove', onMove);
      car.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  // White-flash cut on each slide change (skip first paint).
  const firstFlash = useRef(true);
  useEffect(() => {
    const f = flashRef.current;
    if (!f) return;
    if (firstFlash.current) {
      firstFlash.current = false;
      return;
    }
    f.classList.remove('fire');
    void f.offsetWidth; // reflow to restart the animation
    f.classList.add('fire');
  }, [active]);

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

  // Per-product theming: recolour the orb rings/light/fog (WebGL) plus the DOM
  // wash + the spotlight section below, in sync with the active carousel card.
  useEffect(() => {
    const theme = HERO_THEMES[active % HERO_THEMES.length];
    // The `--theme`/`--wash` custom props MUST be set on the `.obsidian-home`
    // wrapper, not on <html>: `.obsidian-home` re-declares `--theme` locally
    // (with the interpolating @property transition), which would otherwise
    // shadow anything set on documentElement and freeze the sections below.
    const root = (document.querySelector('.obsidian-home') as HTMLElement | null)?.style;
    if (root) {
      root.setProperty('--theme', theme);
      root.setProperty('--wash', hexRGBA(theme, 0.34));
    }
    if (typeof window !== 'undefined' && typeof window.almaTheme === 'function') {
      window.almaTheme(theme);
    }
  }, [active]);

  return (
    <section className="hero" id="hero">
      {/* WebGL orb scene (three.js) — the cinematic hero backdrop, always visible.
          The CMS hero video now lives inside the 3D coverflow (see below), not
          layered over the orb, so the orb reads clearly behind the cards. */}
      <canvas id="webgl" className="hero-webgl" aria-hidden />

      {/* Ambient ripple + particle field (2D canvas — mouse-reactive, works even
          where WebGL is unavailable). Sits just above the orb, below the content. */}
      <canvas id="ripple" className="hero-ripple" aria-hidden />

      <div className="hero-wash" aria-hidden />
      <div className="hero-ghost anton" aria-hidden>
        {ghost}
      </div>

      <div className="hero-carousel" ref={carouselRef}>
        <div className="c-track">
          {slides.map((p, i) => (
            <div
              key={p.key}
              className="c-card"
              style={cardStyle(i, active, n)}
              onClick={() => {
                setActive(i);
                resetAuto();
              }}
            >
              <div className="c-in">
                {p.kind === 'video' ? (
                  <video
                    src={p.videoSrc}
                    poster={p.posterSrc || undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ objectPosition: p.objectPosition }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.card.imageUrl} alt={p.card.title} />
                )}
                <div className="veil" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-fade" aria-hidden />
      <div className="hero-flash" ref={flashRef} aria-hidden />

      <div className="hero-overlay">
        <div className="container">
          <div className="ov-left">
            {current && current.kind === 'product' && (
              <>
                <div className="ov-tags">
                  <span className="ob-tag">
                    <span aria-hidden>🔥</span> HOT
                  </span>
                  <span className="ob-tag bn">{current.card.categoryLabel}</span>
                </div>
                <h1
                  key={active}
                  className="ov-title ov-title-anim bn-serif"
                  style={{ fontFamily: 'var(--font-noto-serif-bengali), serif' }}
                >
                  {current.card.heroTitle}
                </h1>
                <div className="ov-sub">
                  {current.card.codeText ||
                    hero?.subheading ||
                    'ALMA LIFESTYLE · SIGNATURE COLLECTION'}
                </div>
                <div className="ov-price price">
                  {current.card.priceText}
                  {current.card.compareAtText && (
                    <span className="was">{current.card.compareAtText}</span>
                  )}
                </div>
                <div className="ov-cta">
                  <Link href={current.card.href} className="ob-btn solid">
                    Shop Now
                  </Link>
                </div>
              </>
            )}
            {current && current.kind === 'video' && (
              <>
                <div className="ov-tags">
                  <span className="ob-tag">
                    <span aria-hidden>🔥</span> HOT
                  </span>
                  <span className="ob-tag bn">{hero?.eyebrow || 'সিগনেচার'}</span>
                </div>
                <h1
                  key={active}
                  className="ov-title ov-title-anim bn-serif"
                  style={{ fontFamily: 'var(--font-noto-serif-bengali), serif' }}
                >
                  {hero?.brandName || 'ALMA LIFESTYLE'}
                </h1>
                <div className="ov-sub">
                  {hero?.subheading || 'ALMA LIFESTYLE · SIGNATURE COLLECTION'}
                </div>
                <div className="ov-cta">
                  <Link href="/products" className="ob-btn solid">
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
                  key={`th-${p.key}`}
                  type="button"
                  className={`thumb${i === active ? ' act' : ''}`}
                  aria-label={p.kind === 'video' ? 'Hero video' : p.card.title}
                  onClick={() => {
                    setActive(i);
                    resetAuto();
                  }}
                >
                  {p.kind === 'video' ? (
                    p.posterSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.posterSrc} alt="" />
                    ) : (
                      <span className="thumb-play" aria-hidden>
                        ▶
                      </span>
                    )
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.card.imageUrl} alt="" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vertical carousel controls — two large circular buttons stacked on the
          far-right middle of the hero (mirrors the Apechain reference layout). */}
      <div className="c-nav c-nav-side">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => {
            go(active - 1);
            resetAuto();
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 15l6-6 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}
