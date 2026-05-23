import type { Metadata } from 'next';
import { Playfair_Display, Noto_Serif_Bengali, Hind_Siliguri } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { RootShell } from '@/components/layout/RootShell';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '600'],
});

const notoSerifBengali = Noto_Serif_Bengali({
  variable: '--font-noto-serif-bengali',
  subsets: ['bengali'],
  weight: ['400', '600', '700'],
});

const hindSiliguri = Hind_Siliguri({
  variable: '--font-hind-siliguri',
  subsets: ['bengali'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'ALMA Lifestyle | প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল',
  description:
    'প্রিমিয়াম পাঞ্জাবি, ইলেকট্রনিক্স, এক্সেসরিজ ও হোম ডেকর — সারা বাংলাদেশে ডেলিভারি। ALMA Lifestyle।',
  openGraph: {
    title: 'ALMA Lifestyle | প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল',
    description:
      'Premium fashion and lifestyle for Bangladesh — Panjabi, electronics, accessories, home decor.',
    locale: 'bn_BD',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${playfair.variable} ${notoSerifBengali.variable} ${hindSiliguri.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-bn-body antialiased bg-warm-white text-primary">
        <RootShell>{children}</RootShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
