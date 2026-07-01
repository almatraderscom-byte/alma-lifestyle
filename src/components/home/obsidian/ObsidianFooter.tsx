'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface ObsidianFooterProps {
  stripImages: string[];
}

const WORDMARK = 'ALMA LIFESTYLE';

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'শপ',
    links: [
      { label: 'সব পণ্য', href: '/products' },
      { label: 'পাঞ্জাবি', href: '/products?category=panjabi' },
      { label: 'ইসলামিক', href: '/products?category=islamic' },
      { label: 'এক্সেসরিজ', href: '/products?category=accessories' },
    ],
  },
  {
    title: 'কোম্পানি',
    links: [
      { label: 'আমাদের সম্পর্কে', href: '/about' },
      { label: 'যোগাযোগ', href: '/contact' },
      { label: 'ডেলিভারি', href: '/delivery' },
      { label: 'অর্ডার ট্র্যাক', href: '/track' },
    ],
  },
  {
    title: 'সাপোর্ট',
    links: [
      { label: 'সচরাচর জিজ্ঞাসা', href: '/faq' },
      { label: 'রিটার্ন ও রিফান্ড', href: '/refund' },
      { label: 'প্রাইভেসি পলিসি', href: '/privacy' },
      { label: 'শর্তাবলী', href: '/terms' },
    ],
  },
];

/** Giant wordmark: constant per-letter 3D float + cursor-reactive refraction
 *  glow (cyan/orange chromatic split). Ported from the demo — always animating,
 *  so the wordmark never reads as flat text. */
function useWordmarkRipple(wordRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const word = wordRef.current;
    if (!word) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const letters = Array.from(word.querySelectorAll<HTMLElement>(".fw-l"));
    if (!letters.length) return;

    const st = letters.map(() => ({ z: 0, rx: 0, ry: 0, y: 0, g: 0 }));
    let mX = 0;
    let mY = 0;
    let mIn = false;
    const R = 220;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mX = e.clientX;
      mY = e.clientY;
      mIn = true;
    };
    const onLeave = () => {
      mIn = false;
    };
    word.addEventListener("pointermove", onMove);
    word.addEventListener("pointerleave", onLeave);

    const loop = () => {
      const t = performance.now() / 1000;
      for (let i = 0; i < letters.length; i++) {
        const ph = i * 0.42;
        // Idle float — a touch more pronounced so the row visibly waves + tilts
        // in 3D even when the pointer is nowhere near it.
        const iy = Math.sin(t * 1.05 + ph) * 12;
        const irx = Math.sin(t * 0.85 + ph) * 9;
        const iry = Math.sin(t * 0.5 + ph) * 5;
        const irz = Math.sin(t * 0.6 + ph) * 2.4;
        let tz = 0;
        let trx = 0;
        let tryv = 0;
        let ty = 0;
        let tg = 0;
        if (mIn) {
          const r = letters[i].getBoundingClientRect();
          const cxl = r.left + r.width / 2;
          const dx = mX - cxl;
          const dy = mY - (r.top + r.height / 2);
          let inf = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / R);
          inf *= inf;
          tz = inf * 120;
          tryv = -(dx / R) * inf * 40;
          trx = (dy / R) * inf * 32;
          ty = -inf * 14;
          tg = Math.max(0, 1 - Math.abs(dx) / (R * 1.15));
          tg *= tg;
        }
        const s = st[i];
        s.z += (tz - s.z) * 0.12;
        s.rx += (trx - s.rx) * 0.12;
        s.ry += (tryv - s.ry) * 0.12;
        s.y += (ty - s.y) * 0.12;
        s.g += (tg - s.g) * 0.14;
        letters[i].style.transform =
          `translateY(${(iy + s.y).toFixed(2)}px) translateZ(${s.z.toFixed(2)}px) rotateX(${(irx + s.rx).toFixed(2)}deg) rotateY(${(iry + s.ry).toFixed(2)}deg) rotateZ(${irz.toFixed(2)}deg)`;
        if (s.g > 0.01) {
          const g = s.g;
          letters[i].style.filter = `brightness(${(1 + g * 0.55).toFixed(3)})`;
          letters[i].style.textShadow =
            `${(g * 3).toFixed(1)}px 0 ${(g * 4).toFixed(1)}px rgba(255,120,90,${(g * 0.5).toFixed(2)}),${(-g * 3).toFixed(1)}px 0 ${(g * 4).toFixed(1)}px rgba(90,150,255,${(g * 0.5).toFixed(2)}),0 0 ${(g * 22).toFixed(1)}px rgba(255,255,255,${(g * 0.65).toFixed(2)})`;
        } else if (letters[i].style.filter) {
          letters[i].style.filter = "";
          letters[i].style.textShadow = "";
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      word.removeEventListener("pointermove", onMove);
      word.removeEventListener("pointerleave", onLeave);
    };
  }, [wordRef]);
}

export function ObsidianFooter({ stripImages }: ObsidianFooterProps) {
  const wordRef = useRef<HTMLDivElement | null>(null);
  useWordmarkRipple(wordRef);

  return (
    <footer className="ob-footer" id="footer">
      <div className="container">
        <div className="foot-top">
          <div className="foot-brand">
            <Link href="/" className="ob-logo">
              ALMA
            </Link>
            <p className="bn">
              প্রিমিয়াম পাঞ্জাবি, ইসলামিক এসেনশিয়ালস ও লাইফস্টাইল পণ্য — সেই মুহূর্তগুলোর জন্য যেগুলো
              সত্যিই গুরুত্বপূর্ণ।
            </p>
            <div className="socials">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 9h3l.4-3H14V4.5c0-.9.3-1.5 1.6-1.5H17V.3C16.7.3 15.6.2 14.4.2 11.9.2 10.3 1.7 10.3 4.4V6H7.5v3h2.8v11H14V9Z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                </svg>
              </a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .3-3.4-.7-2.9-1.2-4.7-4.1-4.8-4.3-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.9-1c.2-.2.4-.2.6-.1l2 .9c.2.1.4.2.4.3.1.2.1.9-.1 1.4Z" />
                </svg>
              </a>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div className="foot-col bn" key={col.title}>
              <h5>{col.title}</h5>
              {col.links.map((l) => (
                <Link key={l.label} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {stripImages.length > 0 && (
        <div className="foot-strip" aria-hidden>
          {stripImages.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${src}-${i}`} src={src} alt="" />
          ))}
        </div>
      )}

      <div className="foot-word anton" ref={wordRef} aria-label={WORDMARK}>
        {WORDMARK.split('').map((ch, i) => (
          <span className="fw-l" key={i}>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </div>

      <div className="container">
        <div className="foot-legal">
          <span>© 2026 Alma Lifestyle</span>
          <span>Terms of Service · Privacy Notice</span>
        </div>
      </div>
    </footer>
  );
}
