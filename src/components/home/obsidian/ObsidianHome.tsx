'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { CinematicHeroContent } from '@/lib/cinematic-content-types';
import type {
  CategoriesSectionData,
  ReviewsSectionData,
  TrustSectionData,
} from '@/lib/homepage-config-types';
import type { CardProduct } from '@/lib/products-data';
import { formatBnText, formatRating } from '@/lib/format-bn';
import { getDefaultImageForHint, resolveImageUrl } from '@/lib/default-images';
import { ObsidianHeader } from './ObsidianHeader';
import { ObsidianHero } from './ObsidianHero';
import { ObsidianFooter } from './ObsidianFooter';
import { buildObsidianSlots, type ObsidianCard } from './obsidian-data';

interface ObsidianHomeProps {
  products: CardProduct[];
  hero?: CinematicHeroContent;
  categories?: CategoriesSectionData;
  reviews?: ReviewsSectionData;
  trust?: TrustSectionData;
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

function Spotlight({ product }: { product: ObsidianCard | null }) {
  if (!product) return null;
  return (
    <section className="spotlight" id="spotlight">
      <div className="spot-ghost">PANJABI</div>
      <div className="container spot-grid">
        <div className="spot-head">
          <span className="ob-tag dark">ALMA SPOTLIGHT</span>
          <h2 className="spot-title">
            CRAFTED FOR
            <br />
            EVERY OCCASION
          </h2>
          <div className="spot-body">
            <p className="bn">
              আলমা লাইফস্টাইলের প্রতিটি পাঞ্জাবি বাছাই করা হয় সেই মুহূর্তগুলোর জন্য যেগুলো সত্যিই
              গুরুত্বপূর্ণ — ঈদ, উৎসব কিংবা প্রতিদিনের স্নিগ্ধতা।
            </p>
            <p>
              From premium silk to breathable cotton, every piece is tailored for comfort and finished
              for occasion. Fast delivery across Bangladesh with cash on delivery.
            </p>
            <p className="bn">সহজ। যত্নশীল। টেকসই। পার্থক্যটা অনুভব করতে প্রস্তুত?</p>
          </div>
          <div className="spot-cta">
            <Link href="/products?category=panjabi" className="ob-btn dark solid">
              Shop Panjabi
            </Link>
            <Link href="/products" className="ob-btn dark">
              View Collection
            </Link>
          </div>
        </div>
        <div className="spot-visual">
          <Link href={product.href} className="spot-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt={product.title} />
            <div className="sc-label">
              <h4>{product.title}</h4>
              <p>
                {product.categoryLabel} · {product.priceText}
              </p>
              <span className="sc-btn">Shop now ▸</span>
            </div>
          </Link>
          <div className="spot-what">
            <span className="bar" />
            <span className="pill">এটা কী?</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryShowcase({ data }: { data?: CategoriesSectionData }) {
  if (!data) return null;
  const img = (imageUrl: string, hint: string) =>
    resolveImageUrl(imageUrl, getDefaultImageForHint(hint));
  return (
    <section className="ob-cats-showcase" id="categories">
      <div className="container">
        <div className="ocs-head">
          <span className="ob-tag dark">{data.label}</span>
          <h3 className="ocs-title bn-serif">{data.title}</h3>
        </div>
        <div className="ocs-grid">
          <Link href={data.featured.href} className="ocs-card feat">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(data.featured.imageUrl, data.featured.imageHint)} alt={data.featured.displayName} />
            <div className="ocs-veil" />
            <div className="ocs-body">
              <h4 className="bn-serif">{data.featured.displayName}</h4>
              {data.featured.subtitle && <p className="bn">{formatBnText(data.featured.subtitle)}</p>}
              <span className="ocs-go bn">দেখুন →</span>
            </div>
          </Link>
          <div className="ocs-stack">
            {data.stacked.map((cat, i) => (
              <Link key={`${cat.categorySlug}-${i}`} href={cat.href} className="ocs-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(cat.imageUrl, cat.imageHint)} alt={cat.displayName} />
                <div className="ocs-veil" />
                <div className="ocs-body">
                  <h4 className="bn-serif">{cat.displayName}</h4>
                  <span className="ocs-go bn">দেখুন →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const PC_MODS = ['tall feat glow-violet', '', '', '', '', 'wide glow-gold', '', ''];

function ProductsGrid({ products }: { products: ObsidianCard[] }) {
  return (
    <section className="products" id="products">
      <div className="container">
        <div className="products-head">
          <h3>
            <span className="dot" /> ALMA COLLECTION
          </h3>
          <Link href="/products" className="see-all bn">
            সব পণ্য দেখুন ▶
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
                <h4>{p.title}</h4>
                <p>{p.priceText}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShineBand({ products }: { products: ObsidianCard[] }) {
  const track = [...products, ...products];
  return (
    <div className="shine">
      <div className="container shine-head">
        <span className="ob-tag dark">ALMA COLLECTION</span>
        <h3 className="shine-title">
          যেখানে আলমা
          <br />
          উজ্জ্বল হয়
        </h3>
      </div>
      <div className="shine-row">
        <div className="shine-track">
          {track.map((p, i) => (
            <div className={`scard${i % products.length === 1 ? ' hi' : ''}`} key={`${p.id}-${i}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt="" />
              <div className="sc-in">
                <h5>{p.title}</h5>
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
        <div className="obr-head">
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

function TrustBadges({ data }: { data?: TrustSectionData }) {
  if (!data || data.items.length === 0) return null;
  return (
    <section className="ob-trust" id="trust">
      <div className="container">
        <div className="obt-grid">
          {data.items.map((item) => (
            <div className="obt-item" key={item.id}>
              <span className="obt-icon" aria-hidden>
                {item.icon}
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

const CATS = ['পাঞ্জাবি', 'ইসলামিক', 'এক্সেসরিজ', 'ইলেকট্রনিক্স', 'হোম ও ডেকর', 'ফ্যামিলি সেট'];

function CatsMarquee() {
  const items = [...CATS, ...CATS];
  return (
    <div className="cats" id="cats">
      <div className="cats-row">
        <div className="cats-track">
          {items.map((c, i) => (
            <span className="ci" key={`${c}-${i}`}>
              {c}
              <span className="csep" aria-hidden />
            </span>
          ))}
        </div>
      </div>
      <div className="cats-cta">
        <Link href="/products" className="ob-btn dark solid">
          সব পণ্য দেখুন
        </Link>
      </div>
    </div>
  );
}

/* --------------------------------- root --------------------------------- */

export function ObsidianHome({ products, hero, categories, reviews, trust }: ObsidianHomeProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useScrollSky(rootRef);

  const { heroPool, spotlight, grid, shine, strip } = buildObsidianSlots(products);

  return (
    <div className="obsidian-home" ref={rootRef}>
      <ObsidianHeader />
      <main id="top">
        <ObsidianHero hero={hero} products={heroPool} />
        <Spotlight product={spotlight} />
        <CategoryShowcase data={categories} />
        <ProductsGrid products={grid} />
        <ShineBand products={shine} />
        <Reviews data={reviews} />
        <TrustBadges data={trust} />
        <CatsMarquee />
      </main>
      <ObsidianFooter stripImages={strip} />
    </div>
  );
}
