'use client';

import { useEffect } from 'react';

export function CinematicImageRevealInit() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, batchIndex) => {
          if (!entry.isIntersecting || seen.has(entry.target)) return;
          seen.add(entry.target);
          const el = entry.target as HTMLElement;
          const stagger = Number(el.dataset.revealIndex ?? batchIndex) * 40;
          window.setTimeout(() => {
            el.style.animation = 'imageReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards';
          }, stagger);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    const scan = () => {
      document.querySelectorAll('.cinematic-image-reveal:not([data-reveal-bound])').forEach((node, i) => {
        node.setAttribute('data-reveal-bound', '1');
        if (!node.hasAttribute('data-reveal-index')) node.setAttribute('data-reveal-index', String(i % 12));
        observer.observe(node);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
