import type { Metadata } from 'next';
import { buildContentPageMetadata } from '@/lib/seo/default-metadata';
import Link from 'next/link';
import { PageLayout } from '@/components/legal/PageLayout';
import { loadPublicSettingsServer } from '@/lib/storefront/server-data';
import { getFreeDeliveryThreshold, getZoneCharges } from '@/lib/delivery-settings';
import { toBanglaNumber } from '@/lib/format-bn';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadPublicSettingsServer();
  return buildContentPageMetadata(settings, 'delivery', {
    title: 'ডেলিভারি নীতিমালা | ALMA Lifestyle',
    description:
      'ALMA Lifestyle এর ডেলিভারি সময়, চার্জ এবং policy সম্পর্কে বিস্তারিত জানুন।',
  });
}

function formatLocalPhone(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('880') ? `0${digits.slice(3)}` : digits;
}

export default async function DeliveryPage() {
  const settings = await loadPublicSettingsServer();
  const zones = getZoneCharges(settings);
  const dhakaCharge = `৳${toBanglaNumber(zones.dhaka_city)}`;
  const outsideCharge = `৳${toBanglaNumber(zones.outside_dhaka)}`;
  const freeThreshold = `৳${toBanglaNumber(getFreeDeliveryThreshold(settings))}`;
  const phone = formatLocalPhone(settings.contactPhone);

  return (
    <PageLayout
      slug="delivery"
      badge="নীতিমালা"
      heroWord="DELIVERY"
      title="ডেলিভারি নীতিমালা"
      subtitle="দ্রুত ও নিরাপদ ডেলিভারি — পুরো বাংলাদেশে"
      lastUpdated="১ জুন, ২০২৬"
    >
      <h2>ডেলিভারি এলাকা</h2>
      <p>
        ALMA Lifestyle বাংলাদেশের <strong>৬৪টি জেলায়</strong> ডেলিভারি সেবা দেয়। ঢাকা শহরের
        ভিতরে থেকে শুরু করে দূরতম গ্রামাঞ্চল পর্যন্ত — আমরা আপনার দোরগোড়ায় পণ্য পৌঁছে দিই।
      </p>

      <h2>ডেলিভারি সময়</h2>

      <h3>ঢাকার ভিতরে</h3>
      <ul>
        <li>
          <strong>সময়:</strong> ১-২ কার্যদিবস
        </li>
        <li>
          <strong>ডেলিভারি চার্জ:</strong> {dhakaCharge}
        </li>
        <li>
          <strong>সার্ভিস:</strong> Home delivery বা office delivery
        </li>
      </ul>

      <h3>ঢাকার বাইরে (অন্য জেলা)</h3>
      <ul>
        <li>
          <strong>সময়:</strong> ৩-৫ কার্যদিবস
        </li>
        <li>
          <strong>ডেলিভারি চার্জ:</strong> {outsideCharge}
        </li>
        <li>
          <strong>সার্ভিস:</strong> কুরিয়ার (Sundarban, Steadfast, RedX)
        </li>
      </ul>

      <h3>ফ্রি ডেলিভারি</h3>
      <p>
        <strong>{freeThreshold}+</strong> অর্ডারে <strong>ফ্রি ডেলিভারি</strong> — সারা বাংলাদেশে।
      </p>

      <h2>ডেলিভারি প্রক্রিয়া</h2>
      <ol>
        <li>
          <strong>অর্ডার কনফার্মেশন:</strong> অর্ডার করার ২৪ ঘন্টার মধ্যে আমরা আপনাকে ফোন করে
          কনফার্ম করব
        </li>
        <li>
          <strong>প্রসেসিং:</strong> ১-২ কার্যদিবসে আপনার অর্ডার প্রস্তুত হবে
        </li>
        <li>
          <strong>শিপিং:</strong> আমাদের পার্টনার কুরিয়ার পণ্য নিয়ে যাবে
        </li>
        <li>
          <strong>ট্র্যাকিং:</strong> SMS এবং WhatsApp এ tracking নম্বর পাবেন
        </li>
        <li>
          <strong>ডেলিভারি:</strong> আপনার ঠিকানায় পৌঁছে যাবে
        </li>
      </ol>

      <h2>ডেলিভারি চার্জ</h2>
      <table>
        <thead>
          <tr>
            <th>এলাকা</th>
            <th>সময়</th>
            <th>চার্জ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ঢাকা সিটি</td>
            <td>১-২ দিন</td>
            <td>{dhakaCharge}</td>
          </tr>
          <tr>
            <td>ঢাকার বাইরে (সব জেলা)</td>
            <td>৩-৫ দিন</td>
            <td>{outsideCharge}</td>
          </tr>
        </tbody>
      </table>

      <h2>ক্যাশ অন ডেলিভারি (COD)</h2>
      <p>
        সম্পূর্ণ বাংলাদেশে <strong>ক্যাশ অন ডেলিভারি</strong> সুবিধা available। পণ্য হাতে পেয়ে
        চেক করে তারপর payment করুন। অগ্রিম পেমেন্টের কোন বাধ্যবাধকতা নেই।
      </p>

      <h2>অর্ডার ট্র্যাকিং</h2>
      <p>অর্ডার দেওয়ার পর আপনি ৩টি উপায়ে track করতে পারবেন:</p>
      <ul>
        <li>
          <strong>SMS:</strong> Status update SMS পাবেন
        </li>
        <li>
          <strong>WhatsApp:</strong> Real-time updates
        </li>
        <li>
          <strong>Website:</strong>{' '}
          <Link href="/track">/track</Link> পেজে অর্ডার নম্বর দিয়ে track করুন
        </li>
      </ul>

      <h2>ডেলিভারি সংক্রান্ত সমস্যা?</h2>
      <p>ডেলিভারিতে দেরি, ভুল পণ্য, বা অন্য কোনো সমস্যা হলে অনুগ্রহ করে দ্রুত আমাদের জানান:</p>
      <ul>
        <li>ফোন: {phone}</li>
        <li>WhatsApp: {phone}</li>
        <li>Email: {settings.contactEmail}</li>
      </ul>

      <h2>গুরুত্বপূর্ণ তথ্য</h2>
      <ul>
        <li>সঠিক ঠিকানা ও ফোন নম্বর দিন</li>
        <li>ডেলিভারির সময় ফোন রাখুন available</li>
        <li>পণ্য receive করার আগে ভাল করে check করে নিন</li>
        <li>কোনো সমস্যা থাকলে delivery man এর সামনেই জানান</li>
        <li>ছুটির দিনে (শুক্রবার, সরকারি ছুটি) ডেলিভারি বন্ধ থাকতে পারে</li>
      </ul>
    </PageLayout>
  );
}
