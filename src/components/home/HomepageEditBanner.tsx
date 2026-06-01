'use client';

export function HomepageEditBanner() {
  return (
    <div
      data-homepage-edit-banner
      className="sticky top-0 z-[100] flex items-center gap-3 border-b-2 border-[#C97D5D] bg-cream px-4 py-3"
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C97D5D] text-white text-sm"
        aria-hidden
      >
        💡
      </div>
      <div>
        <p className="font-bn-body font-semibold text-charcoal">Visual Editor Mode</p>
        <p className="font-bn-body text-sm text-text-light">
          Click any section in the preview to edit it · Hover to see edit options · Click outside to
          deselect
        </p>
      </div>
    </div>
  );
}
