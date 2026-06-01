import type { Metadata } from 'next';
import { FAQContent } from '@/components/legal/FAQContent';

export const metadata: Metadata = {
  title: 'সাধারণ প্রশ্ন | ALMA Lifestyle',
  description: 'ALMA Lifestyle সম্পর্কে সাধারণ প্রশ্ন ও উত্তর — অর্ডার, পেমেন্ট, ডেলিভারি, ফেরত।',
};

export default function FAQPage() {
  return <FAQContent />;
}
