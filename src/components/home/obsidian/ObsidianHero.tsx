'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { CinematicHeroContent } from '@/lib/cinematic-content-types';
import type { HeroOverlayConfig, HomepageImageSlotAdjust } from '@/lib/homepage-config-types';
import { resolveImageSlot } from '@/lib/homepage-image-slots';
import { useCmsEdit } from '@/components/cms/cms-edit-context';
import type { ObsidianCard } from './obsidian-data';

interface ObsidianHeroProps {
  hero?: CinematicHeroContent;
  products: ObsidianCard[];
  /** Per-slot image overrides + framing for the hero coverflow (`hero-0`…). */
  imageSlots?: Record<string, HomepageImageSlotAdjust>;
  /** Owner overrides for the overlay text (product name/code/price + labels). */
  overlay?: HeroOverlayConfig;
}

/** First non-empty trimmed string, else the fallback. Keeps overlay overrides
 *  falling back to live product data whenever the owner leaves a box blank. */
function pickText(override: string | undefined, fallback: string): string {
  const t = override?.trim();
  return t ? t : fallback;
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

export function ObsidianHero({ hero, products, imageSlots, overlay }: ObsidianHeroProps) {
  // In the visual editor we freeze the auto-rotation so the owner can click and
  // edit the overlay text of the visible card without it sliding away mid-edit.
  const editing = useCmsEdit()?.editing ?? false;
  const heroVideoSrc = hero?.videoSrc?.trim() ?? '';
  const heroPosterSrc = hero?.posterSrc?.trim() ?? '';

  // Build the coverflow: the CMS hero video (if any) becomes the FIRST 3D card,
  // in place of a product image; the rest are product cards. No background video.
  // Key includes the slot index so pinning the same product to two cards can't
  // collide React keys.
  const productSlides: HeroSlide[] = products.map((c, i) => ({
    kind: 'product',
    key: `${c.id}-${i}`,
    card: c,
  }));
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
  // The video (when present) occupies slot 0, so a product card at coverflow
  // index `i` maps to product-pool index `i - videoOffset` — the slot the owner
  // pins a product to via `heroProductIds`.
  const videoOffset = heroVideoSrc ? 1 : 0;
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const washARef = useRef<HTMLDivElement | null>(null);
  const washBRef = useRef<HTMLDivElement | null>(null);
  const washFront = useRef<0 | 1>(0);
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
    if (n > 1 && !editing) {
      timer.current = setInterval(() => setActive((a) => (a + 1) % n), 5000);
    }
  }, [n, editing]);

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
    // The `--theme` custom prop MUST be set on the `.obsidian-home` wrapper,
    // not on <html>: `.obsidian-home` re-declares `--theme` locally (with the
    // interpolating @property transition), which would otherwise shadow
    // anything set on documentElement and freeze the sections below.
    const root = (document.querySelector('.obsidian-home') as HTMLElement | null)?.style;
    if (root) {
      root.setProperty('--theme', theme);
    }
    // Hero colour bloom: cross-fade between TWO stacked wash layers by opacity
    // only. The previous single layer transitioned its background gradient,
    // which forced a full-viewport main-thread repaint every frame — the root
    // cause of the Windows (Chromium/ANGLE) slide-change glitch. Opacity
    // cross-fades run entirely on the GPU compositor.
    const washBg = `radial-gradient(72% 62% at 62% 40%, ${hexRGBA(theme, 0.4)}, transparent 66%)`;
    const a = washARef.current;
    const b = washBRef.current;
    if (a && b) {
      const front = washFront.current === 0 ? a : b;
      const back = washFront.current === 0 ? b : a;
      back.style.background = washBg;
      back.style.opacity = '0.95';
      front.style.opacity = '0';
      washFront.current = washFront.current === 0 ? 1 : 0;
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

      {/* Two stacked wash layers — the active theme colour cross-fades between
          them via compositor-only opacity (see the theming effect above). */}
      <div className="hero-wash" ref={washARef} aria-hidden />
      <div className="hero-wash wash-b" ref={washBRef} aria-hidden />
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
                  (() => {
                    const r = resolveImageSlot(imageSlots, `hero-${i}`, p.card.imageUrl);
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.src}
                        alt={p.card.title}
                        data-cms-field={`imageSlots.hero-${i}`}
                        data-cms-type="image-adjust"
                        data-cms-label={`Hero card image ${i + 1}`}
                        style={r.style}
                      />
                    );
                  })()
                )}
                <div className="veil" />
                {editing && p.kind === 'product' && (
                  <button
                    type="button"
                    className="hero-pick-product"
                    data-cms-field={`heroProductIds.${i - videoOffset}`}
                    data-cms-type="product"
                    data-cms-label={`Hero card ${i - videoOffset + 1} product`}
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 6,
                      pointerEvents: 'auto',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: '1px solid rgba(255,255,255,0.85)',
                      background: 'rgba(124,92,255,0.92)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                      cursor: 'pointer',
                    }}
                  >
                    🔄 পণ্য বদলান
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-fade" aria-hidden />
      <div className="hero-flash" ref={flashRef} aria-hidden />

      <div className="hero-overlay">
        <div className="container">
          {/* `.hero-overlay` is pointer-events:none so the orb/ripple behind it
              stay mouse-reactive. In the visual editor we re-enable pointer
              events here so the owner can click the overlay text to edit it. */}
          <div
            className="ov-left"
            style={editing ? { pointerEvents: 'auto' } : undefined}
          >
            {current && current.kind === 'product' && (
              <>
                <div className="ov-tags">
                  <span
                    className="ob-tag"
                    data-cms-field="heroOverlay.hotBadge"
                    data-cms-type="text"
                    data-cms-label="HOT badge"
                  >
                    <span aria-hidden>🔥</span>{' '}
                    {pickText(overlay?.hotBadge, 'HOT')}
                  </span>
                  {/* Category, name, code and price are always the live product's
                      own values — the owner controls them by assigning a product
                      to the card (the "পণ্য বদলান" button on the 3D card). */}
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
                  <Link
                    href={current.card.href}
                    className="ob-btn solid"
                    data-cms-field="heroOverlay.shopNow"
                    data-cms-type="text"
                    data-cms-label="Shop Now button"
                  >
                    {pickText(overlay?.shopNow, 'Shop Now')}
                  </Link>
                </div>
              </>
            )}
            {current && current.kind === 'video' && (
              <>
                <div className="ov-tags">
                  <span
                    className="ob-tag"
                    data-cms-field="heroOverlay.hotBadge"
                    data-cms-type="text"
                    data-cms-label="HOT badge"
                  >
                    <span aria-hidden>🔥</span>{' '}
                    {pickText(overlay?.hotBadge, 'HOT')}
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
                  <Link
                    href="/products"
                    className="ob-btn solid"
                    data-cms-field="heroOverlay.shopNow"
                    data-cms-type="text"
                    data-cms-label="Shop Now button"
                  >
                    {pickText(overlay?.shopNow, 'Shop Now')}
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="ov-right">
            <Link
              href="/products"
              className="see-all bn"
              data-cms-field="heroOverlay.seeAll"
              data-cms-type="text"
              data-cms-label="See all products link"
            >
              {pickText(overlay?.seeAll, 'সব পণ্য দেখুন ▶')}
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
                    <img src={resolveImageSlot(imageSlots, `hero-${i}`, p.card.imageUrl).src} alt="" />
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
