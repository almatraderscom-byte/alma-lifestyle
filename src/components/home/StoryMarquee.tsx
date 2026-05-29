'use client';

import { STORY_MARQUEE } from '@/lib/content';
import type { MarqueeSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';

const ROW_ONE = 'হাতে তৈরি · বাংলাদেশের গর্ব · প্রিমিয়াম মান ·';
const ROW_TWO = '১০,০০০+ ক্রেতা · ৪.৮ ⭐ রেটিং · দ্রুত ডেলিভারি ·';

interface StoryMarqueeProps {
  data?: MarqueeSectionData;
}

export function StoryMarquee({ data: dataProp }: StoryMarqueeProps) {
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'marquee')!.data;
  const legacySegment = data.text || STORY_MARQUEE.text;
  const rowOneRepeated = Array(4).fill(ROW_ONE).join('');
  const rowTwoRepeated = Array(4).fill(ROW_TWO).join('');

  return (
    <section className="marquee-dual" aria-label="ব্র্যান্ড বার্তা">
      <div className="marquee-row marquee-row-forward h-10 flex items-center border-b border-charcoal/15">
        <div className="marquee-track marquee-track-25">
          <span className="font-bn-body text-sm text-charcoal whitespace-nowrap px-4 inline-flex items-center gap-2">
            <span aria-hidden>✦</span>
            {rowOneRepeated}
          </span>
          <span className="font-bn-body text-sm text-charcoal whitespace-nowrap px-4 inline-flex items-center gap-2" aria-hidden>
            <span>✦</span>
            {rowOneRepeated}
          </span>
        </div>
      </div>
      <div className="marquee-row marquee-row-reverse h-10 flex items-center">
        <div className="marquee-track marquee-track-25 marquee-track-reverse">
          <span className="font-bn-body text-sm text-maroon whitespace-nowrap px-4 inline-flex items-center gap-2">
            <span aria-hidden>★</span>
            {rowTwoRepeated}
          </span>
          <span className="font-bn-body text-sm text-maroon whitespace-nowrap px-4 inline-flex items-center gap-2" aria-hidden>
            <span>★</span>
            {rowTwoRepeated}
          </span>
        </div>
      </div>
      <p className="sr-only">{legacySegment}</p>
    </section>
  );
}
