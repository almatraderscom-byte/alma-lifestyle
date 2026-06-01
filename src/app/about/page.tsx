import type { Metadata } from 'next';
import { PageLayout } from '@/components/legal/PageLayout';

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে | ALMA Lifestyle',
  description:
    'ALMA Lifestyle - বাংলাদেশের প্রিমিয়াম লাইফস্টাইল পণ্যের বিশ্বস্ত ঠিকানা। আমাদের গল্প এবং মিশন জানুন।',
};

export default function AboutPage() {
  return (
    <PageLayout
      badge="আমাদের সম্পর্কে"
      title="ALMA Lifestyle এর গল্প"
      subtitle="এলিগেন্স, কমফোর্ট এবং আধুনিক লাইফস্টাইলের এক বিশ্বস্ত ঠিকানা"
    >
      <h2>আমাদের শুরু</h2>
      <p>
        ALMA Lifestyle তৈরি হয়েছে একটি বিশ্বাস থেকে — সবাই deserve করে প্রিমিয়াম স্টাইল ও মান,
        কিন্তু luxury-level দাম না দিয়ে। আমরা বিশ্বাস করি, ভাল পণ্য সবার জন্য — শুধু কিছু
        মানুষের জন্য না।
      </p>

      <h2>আমাদের মিশন</h2>
      <p>
        আমরা বাংলাদেশের সেরা manufacturer, factory এবং trusted vendor দের সাথে কাজ করে এনে
        দিই হাতে বাছাই করা প্রিমিয়াম পণ্য। আমাদের লক্ষ্য একটাই: আপনার আধুনিক জীবনযাত্রায় এনে
        দেওয়া কমনীয়তা, comfort এবং quality — সাশ্রয়ী দামে।
      </p>

      <h2>আমরা কী অফার করি</h2>
      <ul>
        <li>
          <strong>প্রিমিয়াম ফ্যাশন:</strong> পরিবার ম্যাচিং পাঞ্জাবি, পুরুষদের পোশাক, মহিলাদের
          পোশাক, শিশুদের পোশাক
        </li>
        <li>
          <strong>আধুনিক ইলেকট্রনিক্স:</strong> Latest gadgets এবং accessories
        </li>
        <li>
          <strong>লাইফস্টাইল এক্সেসরিজ:</strong> Watches, bags, wallets এবং আরও
        </li>
        <li>
          <strong>হোম ডেকর:</strong> আপনার ঘরের জন্য নান্দনিক সংগ্রহ
        </li>
      </ul>

      <h2>আমাদের ৩টি প্রতিশ্রুতি</h2>

      <h3>১. প্রিমিয়াম কোয়ালিটি</h3>
      <p>
        Elegant ও trendy ডিজাইনের সাথে premium কোয়ালিটি — প্রতিটি পণ্য কোয়ালিটি যাচাই করে
        stock করি। ১০০% অরিজিনাল গ্যারান্টি।
      </p>

      <h3>২. বিশ্বস্ত সেবা</h3>
      <p>
        দ্রুত ও নির্ভরযোগ্য ডেলিভারি — ৬৪ জেলায় সর্বোচ্চ ৩-৫ কার্যদিবসে। সমস্যা হলে সহজ return
        policy ও instant customer support।
      </p>

      <h3>৩. সাশ্রয়ী বিলাসিতা</h3>
      <p>
        High-end lifestyle products এ সর্বোত্তম দাম — premium quality at affordable prices। চড়া
        দাম ছাড়াই luxury experience।
      </p>

      <h2>পরিবার ম্যাচিং — আমাদের বিশেষত্ব</h2>
      <p>
        ALMA Lifestyle এ আপনি পাবেন বাংলাদেশের সবচেয়ে বড় family matching collection। বাবা, মা,
        ছেলে, মেয়ে — সবার জন্য একই design এবং color এ পোশাক। ঈদ, পহেলা বৈশাখ, পারিবারিক
        অনুষ্ঠান বা photoshoot — সব occasion এর জন্য পরিপূর্ণ সমাধান।
      </p>

      <h2>আপনার বিশ্বাসই আমাদের শক্তি</h2>
      <p>
        ৮০,০০০+ সন্তুষ্ট গ্রাহক, ৪.৮★ rating, এবং ৬৪ জেলায় ডেলিভারির অভিজ্ঞতা — এই সবই
        সম্ভব হয়েছে আপনাদের বিশ্বাসের কারণে। আমরা প্রতিদিন চেষ্টা করি আরও ভাল সেবা দিতে।
      </p>

      <p>ALMA পরিবারের অংশ হওয়ার জন্য ধন্যবাদ।</p>
    </PageLayout>
  );
}
