'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatItemCount } from '@/lib/format-bn';

const NAV = [
  { label: 'পাঞ্জাবি', href: '/products?category=panjabi' },
  { label: 'কালেকশন', href: '/products' },
  { label: 'সব পণ্য', href: '/products' },
  { label: 'যোগাযোগ', href: '/contact' },
];

export function ObsidianHeader() {
  const { itemCount } = useCart();
  const [blur, setBlur] = useState(false);
  const [open, setOpen] = useState(false);

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
      <header className={`ob-header${blur ? ' blur' : ''}`}>
        <div className="container ob-nav">
          <Link href="/" className="ob-logo" aria-label="Alma Lifestyle">
            ALMA
          </Link>
          <nav className="ob-nav-links bn" aria-label="Primary">
            {NAV.map((item, i) => (
              <Link key={`${item.label}-${i}`} href={item.href}>
                {item.label}
              </Link>
            ))}
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
      </header>

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
