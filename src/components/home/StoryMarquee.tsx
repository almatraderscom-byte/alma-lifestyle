import { STORY_MARQUEE } from '@/lib/content';

export function StoryMarquee() {
  const segment = STORY_MARQUEE.text;
  const repeated = Array(4).fill(segment).join('');

  return (
    <section
      className="marquee-strip h-10 bg-charcoal flex items-center"
      aria-label="ব্র্যান্ড বার্তা"
    >
      <div className="marquee-track">
        <span className="font-bn-body text-sm text-cream whitespace-nowrap px-4">
          {repeated}
        </span>
        <span className="font-bn-body text-sm text-mustard whitespace-nowrap px-4" aria-hidden>
          {repeated}
        </span>
      </div>
    </section>
  );
}
