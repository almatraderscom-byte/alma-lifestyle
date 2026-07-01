'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { CinematicHeroContent } from '@/lib/cinematic-content-types';
import type {
  CategoriesSectionData,
  ObsidianHomeCopy,
  ReviewsSectionData,
  TrustSectionData,
} from '@/lib/homepage-config-types';
import { DEFAULT_OBSIDIAN_COPY } from '@/lib/homepage-config-types';
import type { CardProduct } from '@/lib/products-data';
import { formatBnText, formatRating } from '@/lib/format-bn';
import { getDefaultImageForHint, resolveImageUrl } from '@/lib/default-images';
import { ObsidianHeader } from './ObsidianHeader';
import { ObsidianHero } from './ObsidianHero';
import { ObsidianFooter } from './ObsidianFooter';
import { ObsidianFX } from './ObsidianFX';
import { buildObsidianSlots, type ObsidianCard } from './obsidian-data';

interface ObsidianHomeProps {
  products: CardProduct[];
  hero?: CinematicHeroContent;
  categories?: CategoriesSectionData;
  reviews?: ReviewsSectionData;
  trust?: TrustSectionData;
  /** Editable copy for the hard-styled sections (defaults when omitted). */
  copy?: ObsidianHomeCopy;
}

/* ---- scroll-driven day->night sky (4-stop hyperlapse from demo) ---- */
type SkyStop = { top: number[]; bot: number[]; ink: number[]; sun: number[]; strip: number };
const SKY: SkyStop[] = [
  { top: [198, 222, 247], bot: [152, 194, 238], ink: [16, 28, 54], sun: [255, 248, 224, 0.55], strip: 0.16 },
  { top: [120, 168, 236], bot: [86, 138, 220], ink: [22, 38, 78], sun: [224, 236, 255, 0.42], strip: 0.22 },
  { top: [70, 116, 220], bot: [48, 90, 196], ink: [232, 240, 255], sun: [198, 218, 255, 0.3], strip: 0.32 },
  { top: [46, 84, 204], bot: [30, 58, 168], ink: [238, 244, 255], sun: [150, 182, 238, 0.2], strip: 0.44 },
];
const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
const mix = (a: number[], b: number[], f: number) => a.map((v, i) => lerp(v, b[i], f));
const rgb = (a: number[]) => `rgb(${a.map((v) => Math.round(v)).join(',')})`;
const rgba = (a: number[]) =>
  `rgba(${a.slice(0, 3).map((v) => Math.round(v)).join(',')},${a[3] !== undefined ? a[3] : 1})`;

function useScrollSky(rootRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const startEl = root.querySelector<HTMLElement>('.shine');
    const footEl = root.querySelector<HTMLElement>('.ob-footer');
    if (!startEl || !footEl) return;

    const ds = document.documentElement.style;
    let raf = 0;

    const paint = () => {
      raf = 0;
      const vh = window.innerHeight;
      const sY = window.pageYOffset;
      const zStart = startEl.getBoundingClientRect().top + sY;
      const fr = footEl.getBoundingClientRect();
      const zEnd = fr.top + sY + fr.height;
      const raw = Math.max(0, Math.min(1, (sY + vh - zStart) / Math.max(1, zEnd - zStart)));
      const p = Math.pow(raw, 1.7);
      const seg = p * (SKY.length - 1);
      const i = Math.min(SKY.length - 2, Math.floor(seg));
      const f = seg - i;
      const A = SKY[i];
      const B = SKY[i + 1];
      ds.setProperty('--sky-top', rgb(mix(A.top, B.top, f)));
      ds.setProperty('--sky-bot', rgb(mix(A.bot, B.bot, f)));
      const ink = mix(A.ink, B.ink, f);
      ds.setProperty('--sky-ink', rgb(ink));
      ds.setProperty('--sky-dim', rgba([...ink, 0.66]));
      ds.setProperty('--sky-line', rgba([...ink, 0.16]));
      ds.setProperty('--sun', rgba(mix(A.sun, B.sun, f)));
      ds.setProperty('--strip-op', lerp(A.strip, B.strip, f).toFixed(3));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    paint();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [rootRef]);
}

/* ------------------------------ sub-sections ------------------------------ */

function Spotlight({
  product,
  categories,
  copy,
}: {
  product: ObsidianCard | null;
  categories?: CategoriesSectionData;
  copy: ObsidianHomeCopy['spotlight'];
}) {
  if (!product) return null;
  const img = (imageUrl: string, hint: string) =>
    resolveImageUrl(imageUrl, getDefaultImageForHint(hint));
  return (
    <section className="spotlight" id="spotlight">
      <div className="spot-ghost">PANJABI</div>
      <div className="container">
        {/* Category showcase now lives ON TOP of the spotlight — same CMS data,
            same styling, just merged into this one premium section. */}
        {categories && (
          <div className="spot-cats" id="categories">
            <div className="ocs-head" data-ob-reveal>
              <span className="ob-tag dark">{categories.label}</span>
              <h3 className="ocs-title bn-serif">{categories.title}</h3>
            </div>
            <div className="ocs-grid">
              <Link href={categories.featured.href} className="ocs-card feat">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img(categories.featured.imageUrl, categories.featured.imageHint)}
                  alt={categories.featured.displayName}
                />
                <div className="ocs-veil" />
                <div className="ocs-body">
                  <h4 className="bn-serif">{categories.featured.displayName}</h4>
                  {categories.featured.subtitle && (
                    <p className="bn">{formatBnText(categories.featured.subtitle)}</p>
                  )}
                  <span className="ocs-go bn">{copy.categoryGo}</span>
                </div>
              </Link>
              <div className="ocs-stack">
                {categories.stacked.map((cat, i) => (
                  <Link key={`${cat.categorySlug}-${i}`} href={cat.href} className="ocs-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img(cat.imageUrl, cat.imageHint)} alt={cat.displayName} />
                    <div className="ocs-veil" />
                    <div className="ocs-body">
                      <h4 className="bn-serif">{cat.displayName}</h4>
                      <span className="ocs-go bn">{copy.categoryGo}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="spot-grid">
          <div className="spot-head" data-ob-reveal>
            {/* Two-part unified tag (reference SPOTLIGHT badge): existing
                "ALMA SPOTLIGHT" string split into a solid-black + white half. */}
            <span className="spot-badge">
              <span className="sb-dark" data-cms-field="obsidianCopy.spotlight.badgeDark" data-cms-label="Spotlight badge (dark)">
                {copy.badgeDark}
              </span>
              <span className="sb-light" data-cms-field="obsidianCopy.spotlight.badgeLight" data-cms-label="Spotlight badge (light)">
                {copy.badgeLight}
              </span>
            </span>
            <h2 className="spot-title">
              <span data-cms-field="obsidianCopy.spotlight.titleLine1" data-cms-label="Spotlight title line 1">
                {copy.titleLine1}
              </span>
              <br />
              <span data-cms-field="obsidianCopy.spotlight.titleLine2" data-cms-label="Spotlight title line 2">
                {copy.titleLine2}
              </span>
            </h2>
            <div className="spot-body">
              <p className="bn" data-cms-field="obsidianCopy.spotlight.bodyBn" data-cms-label="Spotlight body (Bangla)">
                {copy.bodyBn}
              </p>
              <p data-cms-field="obsidianCopy.spotlight.bodyEn" data-cms-label="Spotlight body (English)">
                {copy.bodyEn}
              </p>
            </div>
            <div className="spot-cta">
              <Link
                href={copy.ctaPrimaryHref}
                className="ob-btn dark solid"
                data-cms-field="obsidianCopy.spotlight.ctaPrimary"
                data-cms-label="Spotlight primary button"
              >
                {copy.ctaPrimary}
              </Link>
              <Link
                href={copy.ctaSecondaryHref}
                className="ob-btn dark"
                data-cms-field="obsidianCopy.spotlight.ctaSecondary"
                data-cms-label="Spotlight secondary button"
              >
                {copy.ctaSecondary}
              </Link>
            </div>
          </div>
          <div className="spot-visual">
            {/* Large faint background word behind the floating graphic. */}
            <span className="spot-bgword" aria-hidden>
              {product.categoryLabel}
            </span>
            {/* Floating mesh-gradient capsule "rod" with the chromatic-glitch
                "What's this?" button (existing এটা কী? string). */}
            <div className="spot-rod">
              <Link
                href={product.href}
                className="spot-what-btn"
                data-text={copy.whatButton}
                aria-label={copy.whatButton}
                data-cms-field="obsidianCopy.spotlight.whatButton"
                data-cms-label="Spotlight 'What's this' button"
              >
                {copy.whatButton}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PC_MODS = ['tall feat glow-violet', '', '', '', '', 'wide glow-gold', '', ''];

function ProductsGrid({
  products,
  copy,
}: {
  products: ObsidianCard[];
  copy: ObsidianHomeCopy['products'];
}) {
  return (
    <section className="products" id="products">
      <div className="container">
        <div className="products-head" data-ob-reveal>
          <h3>
            <span className="dot" />{' '}
            <span data-cms-field="obsidianCopy.products.heading" data-cms-label="Products heading">
              {copy.heading}
            </span>
          </h3>
          <Link
            href={copy.viewAllHref}
            className="see-all bn"
            data-cms-field="obsidianCopy.products.viewAll"
            data-cms-label="Products 'view all' link"
          >
            {copy.viewAll}
          </Link>
        </div>
        <div className="pgrid">
          {products.map((p, i) => (
            <Link key={p.id} href={p.href} className={`pcard ${PC_MODS[i] ?? ''}`.trim()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt={p.title} />
              <div className="pc-veil" />
              <span className="pc-cat">{p.categoryLabel}</span>
              <div className="pc-body">
                <h4>{p.heroTitle}</h4>
                <p>{p.codeText ? `${p.codeText} · ${p.priceText}` : p.priceText}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShineBand({
  products,
  copy,
}: {
  products: ObsidianCard[];
  copy: ObsidianHomeCopy['shine'];
}) {
  const track = [...products, ...products];
  return (
    <div className="shine">
      <div className="container shine-head">
        <div className="shine-blobs" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <span className="ob-tag dark" data-cms-field="obsidianCopy.shine.tag" data-cms-label="Shine band tag">
          {copy.tag}
        </span>
        <h3 className="shine-title" data-ob-reveal>
          <span data-cms-field="obsidianCopy.shine.titleLine1" data-cms-label="Shine title line 1">
            {copy.titleLine1}
          </span>
          <br />
          <span data-cms-field="obsidianCopy.shine.titleLine2" data-cms-label="Shine title line 2">
            {copy.titleLine2}
          </span>
        </h3>
      </div>
      <div className="shine-row">
        <div className="shine-track">
          {track.map((p, i) => (
            <div className={`scard${i % products.length === 1 ? ' hi' : ''}`} key={`${p.id}-${i}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt="" />
              <div className="sc-in">
                <h5>{p.heroTitle}</h5>
                <p>
                  {p.categoryLabel} · {p.priceText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Reviews({ data }: { data?: ReviewsSectionData }) {
  if (!data || data.items.length === 0) return null;
  return (
    <section className="ob-reviews" id="reviews">
      <div className="container">
        <div className="obr-head" data-ob-reveal>
          <h3 className="bn-serif">{data.title}</h3>
          {data.verifiedLabel && <span className="obr-verified bn">✔ {data.verifiedLabel}</span>}
        </div>
        <div className="obr-grid">
          {data.items.slice(0, 6).map((r) => (
            <figure className="obr-card" key={r.id}>
              <div className="obr-stars" aria-label={`${r.rating} / 5`}>
                {'★'.repeat(Math.round(r.rating))}
                <span className="obr-rate">{formatRating(r.rating)}</span>
              </div>
              <blockquote className="obr-text bn">{formatBnText(r.text)}</blockquote>
              <figcaption className="obr-meta">
                <span className="obr-name bn">{r.name}</span>
                {r.city && <span className="obr-city bn">{r.city}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Animated line-art icons replacing the "cheap emoji" trust badges. Each is a
   stroked SVG that draws/pulses on its own via CSS keyframes in obsidian.css.
   Chosen by index so it maps to the 4 CMS trust items (delivery, cash, return,
   support) while gracefully cycling for any count. */
function ObTrustGlyph({ index }: { index: number }) {
  const kind = index % 4;
  const common = {
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (kind === 0) {
    // Delivery truck
    return (
      <svg {...common} className="obt-svg obt-svg--truck" aria-hidden>
        <path className="obt-draw" d="M4 14h22v16H4z" />
        <path className="obt-draw" d="M26 20h8l6 6v4h-14z" />
        <circle className="obt-wheel" cx="14" cy="34" r="3.4" />
        <circle className="obt-wheel" cx="33" cy="34" r="3.4" />
        <path className="obt-dash" d="M0 24h4M0 28h6" />
      </svg>
    );
  }
  if (kind === 1) {
    // Cash on delivery
    return (
      <svg {...common} className="obt-svg obt-svg--cash" aria-hidden>
        <rect className="obt-draw" x="6" y="13" width="36" height="22" rx="3" />
        <circle className="obt-coin" cx="24" cy="24" r="6" />
        <path className="obt-draw" d="M10 17v14M38 17v14" />
      </svg>
    );
  }
  if (kind === 2) {
    // Easy return
    return (
      <svg {...common} className="obt-svg obt-svg--return" aria-hidden>
        <path className="obt-spin" d="M38 24a14 14 0 1 1-4.1-9.9" />
        <path className="obt-spin" d="M34 6v9h-9" />
      </svg>
    );
  }
  // Support / headset
  return (
    <svg {...common} className="obt-svg obt-svg--support" aria-hidden>
      <path className="obt-draw" d="M10 26v-2a14 14 0 0 1 28 0v2" />
      <rect className="obt-pulse" x="6" y="24" width="7" height="12" rx="2.5" />
      <rect className="obt-pulse" x="35" y="24" width="7" height="12" rx="2.5" />
      <path className="obt-draw" d="M38 36v2a6 6 0 0 1-6 6h-6" />
    </svg>
  );
}

function TrustBadges({ data }: { data?: TrustSectionData }) {
  if (!data || data.items.length === 0) return null;
  return (
    <section className="ob-trust" id="trust">
      <div className="container">
        <div className="obt-grid">
          {data.items.map((item, i) => (
            <div className="obt-item" key={item.id}>
              <span className="obt-icon" aria-hidden>
                <ObTrustGlyph index={i} />
              </span>
              <h4 className="obt-title bn-serif">{item.title}</h4>
              <p className="obt-text bn">{formatBnText(item.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CatsMarquee({ copy }: { copy: ObsidianHomeCopy['cats'] }) {
  const base = copy.items;
  const items = [...base, ...base];
  return (
    <div className="cats" id="cats">
      <div className="cats-row">
        <div className="cats-track">
          {items.map((c, i) => (
            <span
              className="ci"
              key={`${c}-${i}`}
              data-cms-field={`obsidianCopy.cats.items.${i % base.length}`}
              data-cms-label="Category marquee item"
            >
              {c}
              <span className="csep" aria-hidden />
            </span>
          ))}
        </div>
      </div>
      <div className="cats-cta">
        <Link
          href={copy.ctaHref}
          className="ob-btn dark solid"
          data-cms-field="obsidianCopy.cats.cta"
          data-cms-label="Category marquee button"
        >
          {copy.cta}
        </Link>
      </div>
    </div>
  );
}

/* --------------------------------- root --------------------------------- */

export function ObsidianHome({
  products,
  hero,
  categories,
  reviews,
  trust,
  copy = DEFAULT_OBSIDIAN_COPY,
}: ObsidianHomeProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useScrollSky(rootRef);

  const { cards, heroPool, spotlight, grid, shine, strip } = buildObsidianSlots(products);

  // Category-specific, de-duplicated image pools for the nav-hover reveal.
  // NAV order: [পাঞ্জাবি, কালেকশন, সব পণ্য, যোগাযোগ(social — no images)].
  const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
  const panjabiImages = uniq(
    cards.filter((c) => c.categorySlug === 'panjabi').map((c) => c.imageUrl)
  );
  const allImages = uniq(cards.map((c) => c.imageUrl));
  // "সব পণ্য": interleave categories so a mix of 1–2 per category surfaces first,
  // never repeating an image already shown earlier in the same set.
  const byCat = new Map<string, string[]>();
  cards.forEach((c) => {
    const key = c.categorySlug ?? 'other';
    if (!byCat.has(key)) byCat.set(key, []);
    byCat.get(key)!.push(c.imageUrl);
  });
  const mixed: string[] = [];
  const cols = Array.from(byCat.values());
  for (let r = 0; r < Math.max(...cols.map((c) => c.length), 0); r++) {
    for (const col of cols) if (col[r]) mixed.push(col[r]);
  }
  const allMixed = uniq(mixed.length ? mixed : allImages);

  const navImageSets: string[][] = [
    panjabiImages.length ? panjabiImages : allImages, // পাঞ্জাবি
    panjabiImages.length ? panjabiImages : allImages, // কালেকশন (panjabi + matching)
    allMixed, // সব পণ্য
    [], // যোগাযোগ → social bubbles (handled in header)
  ];

  return (
    <div className="obsidian-home" ref={rootRef}>
      <ObsidianFX />
      <ObsidianHeader navImageSets={navImageSets} />
      <main id="top">
        <ObsidianHero hero={hero} products={heroPool} />
        <Spotlight product={spotlight} categories={categories} copy={copy.spotlight} />
        <ProductsGrid products={grid} copy={copy.products} />
        <ShineBand products={shine} copy={copy.shine} />
        <Reviews data={reviews} />
        <TrustBadges data={trust} />
        <CatsMarquee copy={copy.cats} />
      </main>
      <ObsidianFooter stripImages={strip} />
    </div>
  );
}
