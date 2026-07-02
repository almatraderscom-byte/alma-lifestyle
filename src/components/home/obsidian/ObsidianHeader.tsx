'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { formatItemCount } from '@/lib/format-bn';
import { FloatingImageArray, type FloatingSocial } from '@/components/obsidian/FloatingImageArray';
import { DEFAULT_HEADER_NAV } from '@/lib/admin-settings-types';

const CONTACT_SOCIALS: FloatingSocial[] = ['whatsapp', 'facebook', 'instagram', 'call'];

export function ObsidianHeader({ navImageSets }: { navImageSets?: string[][] } = {}) {
  const { itemCount } = useCart();
  const settings = useStoreSettings();
  const NAV = settings.headerNav && settings.headerNav.length > 0 ? settings.headerNav : DEFAULT_HEADER_NAV;

  // Each nav link owns its OWN category-specific, de-duplicated image set.
  const imgsFor = (i: number) => navImageSets?.[i] ?? [];
  const [blur, setBlur] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest < 120) {
      setHidden(false);
    } else if (latest > previous) {
      setHidden(true);
    } else if (latest < previous) {
      setHidden(false);
    }
  });

  useEffect(() => {
    const onScroll = () => setBlur(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <motion.header
        className={`ob-header${blur ? ' ob-solid' : ''}`}
        animate={{ y: hidden && !open ? '-100%' : '0%' }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container ob-nav">
          <Link href="/" className="ob-logo" aria-label="Alma Lifestyle">
            ALMA
          </Link>
          <nav className="ob-nav-links bn ob-nav-bold" aria-label="Primary">
            {NAV.map((item, i) => {
              const link = <Link href={item.href}>{item.label}</Link>;
              if (item.social) {
                return (
                  <FloatingImageArray key={`${item.label}-${i}`} socials={CONTACT_SOCIALS}>
                    {link}
                  </FloatingImageArray>
                );
              }
              const imgs = imgsFor(i);
              return imgs.length ? (
                <FloatingImageArray key={`${item.label}-${i}`} images={imgs}>
                  {link}
                </FloatingImageArray>
              ) : (
                <Link key={`${item.label}-${i}`} href={item.href}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ob-nav-right">
            <Link href="/cart" className="ob-cart-btn bn">
              কার্ট ({formatItemCount(itemCount)})
            </Link>
            <button
              type="button"
              className={`ob-burger${open ? ' on' : ''}`}
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </motion.header>

      <div
        className={`ob-scrim${open ? ' on' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside className={`ob-drawer bn${open ? ' on' : ''}`}>
        {NAV.map((item, i) => (
          <Link key={`d-${item.label}-${i}`} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
      </aside>
    </>
  );
}
