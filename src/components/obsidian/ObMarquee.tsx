import Link from 'next/link';

const DEFAULT_CATS = ['পাঞ্জাবি', 'ইসলামিক', 'এক্সেসরিজ', 'ইলেকট্রনিক্স', 'হোম ও ডেকর', 'ফ্যামিলি সেট'];

interface ObMarqueeProps {
  /** Words to scroll. Defaults to the storefront category set. */
  items?: string[];
  /** Optional centered pill CTA below the marquee. */
  cta?: { label: string; href: string } | null;
}

/** Infinite marquee — massive words + square blue icon blocks + centered pill,
 *  on the shared scroll-sky background. Extracted from the homepage `CatsMarquee`
 *  so every page integrates the identical band (requirement #4). */
export function ObMarquee({ items = DEFAULT_CATS, cta = { label: 'সব পণ্য দেখুন', href: '/products' } }: ObMarqueeProps) {
  const loop = [...items, ...items];
  return (
    <div className="cats" id="cats">
      <div className="cats-row">
        <div className="cats-track">
          {loop.map((c, i) => (
            <span className="ci" key={`${c}-${i}`}>
              {c}
              <span className="csep" aria-hidden />
            </span>
          ))}
        </div>
      </div>
      {cta && (
        <div className="cats-cta">
          <Link href={cta.href} className="ob-btn dark solid">
            {cta.label}
          </Link>
        </div>
      )}
    </div>
  );
}
