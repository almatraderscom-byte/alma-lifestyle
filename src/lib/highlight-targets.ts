/**
 * Named spotlight targets the ALMA AI assistant can highlight on a page
 * (ElevenLabs-style guided tour: backdrop blurs, the target zooms forward
 * inside a neon ring for ~2.5s).
 *
 * Shared by the server (taught to Gemini in the system prompt) and the
 * client (resolved to a DOM node by the spotlight engine). Selectors are
 * candidate lists — the first one that matches wins, so a target survives
 * markup refactors as long as one selector still resolves.
 */

export interface HighlightTarget {
  /** CSS selector candidates, tried in order. */
  selectors: string[];
  /** Bengali description shown to the AI so it picks the right key. */
  description: string;
  /** Path the target lives on ('/', '/products/<slug>' …) — prompt hint only. */
  page: string;
}

export const HIGHLIGHT_TARGETS: Record<string, HighlightTarget> = {
  hero: {
    selectors: ['.obsidian-home .hero'],
    description: 'হোমপেজের হিরো স্লাইডার (মূল প্রোডাক্ট শোকেস)',
    page: '/',
  },
  categories: {
    selectors: ['#categories'],
    description: 'ক্যাটাগরি সেকশন (পাঞ্জাবি/ইসলামিক/অন্যান্য)',
    page: '/',
  },
  spotlight: {
    selectors: ['#spotlight .spot-grid', '#spotlight'],
    description: 'ALMA স্পটলাইট সেকশন (ফিচার্ড প্রোডাক্ট)',
    page: '/',
  },
  products: {
    selectors: ['#products', '.obsidian-home .pgrid'],
    description: 'হোমপেজের প্রোডাক্ট গ্রিড (সব পণ্যের প্রিভিউ)',
    page: '/',
  },
  'family-matching': {
    selectors: ['[data-alma-target="family-matching"]'],
    description: 'ফ্যামিলি ম্যাচিং সেট শোকেস (বাবা-ছেলে/মা-মেয়ে ম্যাচিং)',
    page: '/',
  },
  reviews: {
    selectors: ['#reviews'],
    description: 'কাস্টমার রিভিউ সেকশন',
    page: '/',
  },
  faq: {
    selectors: ['[data-alma-target="faq"]'],
    description: 'সচরাচর জিজ্ঞাসা (FAQ) সেকশন',
    page: '/',
  },
  trust: {
    selectors: ['#trust'],
    description: 'ট্রাস্ট/গ্যারান্টি সেকশন (ডেলিভারি, রিটার্ন, কোয়ালিটি)',
    page: '/',
  },
  'pdp-price': {
    selectors: ['.ob-pdp-price'],
    description: 'প্রোডাক্ট পেজের দাম/অফার',
    page: '/products/<slug>',
  },
  'pdp-add-to-cart': {
    selectors: ['.ob-pdp-cta'],
    description: 'প্রোডাক্ট পেজের "কার্টে যোগ করুন / এখনই কিনুন" বাটন',
    page: '/products/<slug>',
  },
};

export type HighlightKey = keyof typeof HIGHLIGHT_TARGETS;

export function isHighlightKey(key: string): key is HighlightKey {
  return Object.prototype.hasOwnProperty.call(HIGHLIGHT_TARGETS, key);
}
