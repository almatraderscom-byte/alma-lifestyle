'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/legal/PageLayout';

const faqCategories = [
  {
    title: 'অর্ডার সংক্রান্ত',
    faqs: [
      {
        q: 'কীভাবে অর্ডার করব?',
        a: 'পণ্য বেছে → Cart এ যোগ করুন → Checkout এ যান → আপনার তথ্য দিন → Payment method বেছে → অর্ডার confirm করুন। ব্যস!',
      },
      {
        q: 'অর্ডার confirm হয়েছে কিনা কীভাবে জানব?',
        a: 'অর্ডার সফল হলে আপনি instantly confirmation page দেখতে পাবেন। সাথে email এ confirmation এবং SMS এ tracking link পাঠানো হবে।',
      },
      {
        q: 'অর্ডার cancel করা যাবে?',
        a: 'হ্যাঁ, shipping শুরু হওয়ার আগে অর্ডার cancel করা যাবে। 01307-777733 এ call করুন।',
      },
      {
        q: 'একাউন্ট না থাকলেও অর্ডার করা যাবে?',
        a: 'হ্যাঁ! Guest checkout সুবিধা আছে। তবে account থাকলে order history ও tracking সহজ হয়।',
      },
    ],
  },
  {
    title: 'পেমেন্ট',
    faqs: [
      {
        q: 'কোন পেমেন্ট পদ্ধতি accept করেন?',
        a: 'bKash, Nagad, এবং ক্যাশ অন ডেলিভারি (COD)। সবগুলোই available সারা বাংলাদেশে।',
      },
      {
        q: 'অগ্রিম পেমেন্ট জরুরি?',
        a: 'না। COD সুবিধা আছে — পণ্য হাতে পেয়ে চেক করে তারপর payment করতে পারবেন।',
      },
      {
        q: 'Online payment নিরাপদ?',
        a: 'হ্যাঁ। SSL encryption এবং secure gateway ব্যবহার করি। আপনার financial information সুরক্ষিত।',
      },
      {
        q: 'Payment failed হলে কী করব?',
        a: 'যদি payment cut হয় কিন্তু order confirm না হয়, ২৪ ঘন্টার মধ্যে refund পাবেন। সমস্যা থাকলে 01307-777733 এ call করুন।',
      },
    ],
  },
  {
    title: 'ডেলিভারি',
    faqs: [
      {
        q: 'ডেলিভারি কত দিনে পাব?',
        a: 'ঢাকার ভিতরে ১-২ দিন, ঢাকার বাইরে ৩-৫ দিন। চর/দ্বীপ এলাকায় ৫-৭ দিন।',
      },
      {
        q: 'ডেলিভারি চার্জ কত?',
        a: 'ঢাকা সিটি: ৳৮০, ঢাকা জেলা: ৳১০০, অন্য জেলা: ৳১৫০। ৳২,০০০+ অর্ডারে ফ্রি ডেলিভারি।',
      },
      {
        q: 'কোন কোন জেলায় ডেলিভারি দেন?',
        a: 'বাংলাদেশের ৬৪ জেলায় ডেলিভারি দিই। প্রতিটি জেলার শহরাঞ্চল ও মফস্বল এলাকা cover করি।',
      },
      {
        q: 'অর্ডার track করব কীভাবে?',
        a: 'অর্ডার নম্বর ও ফোন দিয়ে /track পেজে track করুন। SMS এবং WhatsApp এ ও updates পাবেন।',
      },
    ],
  },
  {
    title: 'পণ্য সংক্রান্ত',
    faqs: [
      {
        q: 'কাপড়ের কোয়ালিটি কেমন?',
        a: '১০০% premium quality fabric। আমরা trusted manufacturer ও supplier দের থেকে carefully selected products নিয়ে আসি। প্রতিটি পণ্য কোয়ালিটি যাচাই করে stock করি।',
      },
      {
        q: 'সাইজ মিল না খেলে কী করব?',
        a: '৭ দিনের মধ্যে exchange করতে পারবেন (tag ও packaging intact থাকতে হবে)। 01307-777733 এ যোগাযোগ করুন।',
      },
      {
        q: 'Family matching সেট মানে কী?',
        a: 'একই design ও color এ পুরো পরিবারের পোশাক — বাবা, মা, ছেলে, মেয়ে। ঈদ, অনুষ্ঠান বা photoshoot এর জন্য perfect!',
      },
      {
        q: 'Custom বা bulk order করা যাবে?',
        a: 'হ্যাঁ! Bulk order বা corporate gifting এর জন্য আমাদের সাথে যোগাযোগ করুন: 01307-777733।',
      },
    ],
  },
  {
    title: 'ফেরত ও রিফান্ড',
    faqs: [
      {
        q: 'পছন্দ না হলে ফেরত দেওয়া যাবে?',
        a: 'হ্যাঁ, ৭ দিনের মধ্যে ফেরত দিতে পারবেন (Tag ও packaging সহ unused condition এ)। বিস্তারিত /refund পেজে।',
      },
      {
        q: 'Refund কতদিনে পাব?',
        a: 'bKash/Nagad এ ১-৩ কার্যদিবস। COD এর ক্ষেত্রে ৩-৫ কার্যদিবস।',
      },
      {
        q: 'Defective পণ্য পেলে?',
        a: 'অবশ্যই full refund + return shipping free। ছবি/ভিডিও সহ 01307-777733 এ জানান।',
      },
    ],
  },
];

export function FAQContent() {
  return (
    <PageLayout
      slug="faq"
      badge="সাহায্য"
      heroWord="FAQ"
      title="সাধারণ প্রশ্নাবলী (FAQ)"
      subtitle="আপনার সব প্রশ্নের উত্তর এক জায়গায়"
    >
      <div className="not-prose space-y-8">
        {faqCategories.map((category) => (
          <div key={category.title}>
            <h2 className="mb-4 border-b border-border-subtle pb-2 font-bn-heading text-2xl font-semibold text-charcoal">
              {category.title}
            </h2>
            <div className="space-y-3">
              {category.faqs.map((faq) => (
                <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-cream/60"
        aria-expanded={isOpen}
      >
        <span className="pr-4 font-bn-body font-medium text-charcoal">{question}</span>
        <span
          className={`text-xl text-terracotta transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ⌄
        </span>
      </button>
      {isOpen && <div className="px-6 pb-4 font-bn-body text-text-light">{answer}</div>}
    </div>
  );
}
