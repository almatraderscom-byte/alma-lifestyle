'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export function FacebookPixel({ pixelId }: { pixelId?: string }) {
  const id = pixelId?.trim();
  if (!id) return null;

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (!window.fbq?.loaded) {
        if (attempts > 80) window.clearInterval(timer);
        return;
      }

      window.clearInterval(timer);
      void import('@/lib/pixel-dev').then(({ recordPixelEvent }) => {
        recordPixelEvent('Init', { pixel_id: id }, 'fbq');
        recordPixelEvent('PageView', {}, 'fbq');
      });
    }, 50);

    return () => window.clearInterval(timer);
  }, [id]);

  return (
    <>
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${id}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { loaded?: boolean };
  }
}
