import type { Metadata } from 'next';
import { loadPublicSettingsServer } from '@/lib/storefront/server-data';
import { buildContentPageMetadata } from '@/lib/seo/default-metadata';
import { FAQContent } from '@/components/legal/FAQContent';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadPublicSettingsServer();
  return buildContentPageMetadata(settings, 'faq', {
    title: 'সাধারণ প্রশ্ন | ALMA Lifestyle',
    description:
      'ALMA Lifestyle সম্পর্কে সাধারণ প্রশ্ন ও উত্তর — অর্ডার, পেমেন্ট, ডেলিভারি, ফেরত।',
  });
}

export default function FAQPage() {
  return <FAQContent />;
}
