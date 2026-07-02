'use client';

import { useState } from 'react';
const GUIDES = [
  {
    id: 'product',
    title: 'How to add a product',
    steps: [
      'Open Products in the sidebar and click Add New.',
      'Fill in the English title, Bangla title, price, and category.',
      'Upload at least one product image and set a featured image.',
      'Click Publish when ready, or Save Draft to finish later.',
    ],
  },
  {
    id: 'homepage',
    title: 'How to edit homepage',
    steps: [
      'Go to Homepage Builder in the sidebar.',
      'Expand a section card to edit its text, images, or colors.',
      'Use Section Order at the top to drag sections or toggle visibility.',
      'Watch the live preview on the right, then click Save Changes.',
    ],
  },
  {
    id: 'orders',
    title: 'How to view orders',
    steps: [
      'Click Orders in the sidebar to see all customer orders.',
      'Use filters to find pending or shipped orders.',
      'Open an order to update status when you ship or deliver.',
    ],
  },
];

export function AdminHelp() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>('product');

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--ob-violet)] text-white text-lg font-bold shadow-lg hover:bg-[var(--ob-violet-2)]"
        aria-label="Help"
      >
        ?
      </button>

      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-black/30" aria-label="Close help" onClick={() => setOpen(false)} />
          <aside className="fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Help & Guides</h2>
              <button type="button" className="text-neutral-500 hover:text-neutral-800" onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {GUIDES.map((guide) => (
                <div key={guide.id} className="rounded-lg border border-neutral-200 overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                    onClick={() => setExpanded(expanded === guide.id ? null : guide.id)}
                  >
                    {guide.title}
                    <span className="text-neutral-400">{expanded === guide.id ? '▾' : '▸'}</span>
                  </button>
                  {expanded === guide.id && (
                    <ol className="list-decimal list-inside px-4 pb-4 space-y-2 text-sm text-neutral-600">
                      {guide.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
              <a
                href="#"
                className="block text-center text-sm font-medium text-[var(--ob-violet)] hover:underline py-2"
                onClick={(e) => e.preventDefault()}
              >
                Watch Tutorial Video
              </a>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
