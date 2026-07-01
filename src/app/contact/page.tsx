import type { Metadata } from 'next';
import Link from 'next/link';
import { PageLayout } from '@/components/legal/PageLayout';
import { WhatsAppLink } from '@/components/ui/WhatsAppLink';

export const metadata: Metadata = {
  title: 'যোগাযোগ | ALMA Lifestyle',
  description:
    'ALMA Lifestyle এর সাথে যোগাযোগ করুন। WhatsApp, ফোন, ইমেইল এর মাধ্যমে আমাদের সাথে কথা বলুন।',
};

export default function ContactPage() {
  return (
    <PageLayout
      badge="যোগাযোগ"
      heroWord="CONTACT"
      title="আমাদের সাথে যোগাযোগ করুন"
      subtitle="যেকোনো প্রশ্ন, পরামর্শ বা সাহায্যের জন্য আমরা আছি আপনার পাশে"
    >
      <div className="not-prose grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-6 font-bn-heading text-2xl font-semibold text-charcoal">
            যোগাযোগের তথ্য
          </h2>

          <div className="space-y-6 font-bn-body">
            <div className="flex items-start gap-4">
              <span className="text-2xl" aria-hidden>
                📞
              </span>
              <div>
                <h3 className="mb-1 font-medium text-charcoal">ফোন / WhatsApp</h3>
                <a href="tel:+8801307777733" className="text-lg text-terracotta hover:underline">
                  01307-777733
                </a>
                <p className="mt-1 text-sm text-text-light">সকাল ৯টা - রাত ১০টা</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-2xl" aria-hidden>
                ✉️
              </span>
              <div>
                <h3 className="mb-1 font-medium text-charcoal">ইমেইল</h3>
                <a href="mailto:admin@almatraders.com" className="text-terracotta hover:underline">
                  admin@almatraders.com
                </a>
                <p className="mt-1 text-sm text-text-light">২৪ ঘন্টার মধ্যে উত্তর</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-2xl" aria-hidden>
                📍
              </span>
              <div>
                <h3 className="mb-1 font-medium text-charcoal">ঠিকানা</h3>
                <p>ঢাকা, বাংলাদেশ</p>
                <p className="mt-1 text-sm text-text-light">পুরো বাংলাদেশে ডেলিভারি</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-2xl" aria-hidden>
                🕐
              </span>
              <div>
                <h3 className="mb-1 font-medium text-charcoal">সময়সূচি</h3>
                <p>শনি - বৃহস্পতি: সকাল ৯টা - রাত ১০টা</p>
                <p>শুক্রবার: দুপুর ২টা - রাত ১০টা</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 font-bn-heading font-medium text-charcoal">আমাদের ফলো করুন</h3>
            <div className="flex gap-3">
              <a
                href="https://facebook.com/almalifestyle"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bn-body text-white hover:bg-blue-700"
                aria-label="Facebook"
              >
                f
              </a>
              <a
                href="https://instagram.com/almalifestyle"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:opacity-90"
                aria-label="Instagram"
              >
                ig
              </a>
              <WhatsAppLink
                className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald font-bn-body text-white hover:opacity-90"
                aria-label="WhatsApp"
              >
                WA
              </WhatsAppLink>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-6 font-bn-heading text-2xl font-semibold text-charcoal">
            কোন বিষয়ে সাহায্য চান?
          </h2>

          <div className="space-y-3 font-bn-body">
            <Link
              href="/track"
              className="block rounded-lg bg-cream p-4 transition hover:shadow-md"
            >
              <h3 className="mb-1 font-medium text-charcoal">অর্ডার ট্র্যাকিং</h3>
              <p className="text-sm text-text-light">আপনার অর্ডারের status দেখুন</p>
            </Link>

            <Link
              href="/delivery"
              className="block rounded-lg bg-cream p-4 transition hover:shadow-md"
            >
              <h3 className="mb-1 font-medium text-charcoal">ডেলিভারি তথ্য</h3>
              <p className="text-sm text-text-light">ডেলিভারি সময় ও চার্জ</p>
            </Link>

            <Link href="/refund" className="block rounded-lg bg-cream p-4 transition hover:shadow-md">
              <h3 className="mb-1 font-medium text-charcoal">ফেরত নীতি</h3>
              <p className="text-sm text-text-light">Return ও refund policy</p>
            </Link>

            <Link
              href="/size-guide"
              className="block rounded-lg bg-cream p-4 transition hover:shadow-md"
            >
              <h3 className="mb-1 font-medium text-charcoal">সাইজ গাইড</h3>
              <p className="text-sm text-text-light">সঠিক সাইজ বেছে নিন</p>
            </Link>

            <Link href="/faq" className="block rounded-lg bg-cream p-4 transition hover:shadow-md">
              <h3 className="mb-1 font-medium text-charcoal">সাধারণ প্রশ্ন</h3>
              <p className="text-sm text-text-light">FAQ - সব উত্তর এক জায়গায়</p>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
