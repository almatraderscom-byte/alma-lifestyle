import type { Metadata } from 'next';
import { loadPublicSettingsServer } from '@/lib/storefront/server-data';
import { buildContentPageMetadata } from '@/lib/seo/default-metadata';
import Link from 'next/link';
import { PageLayout } from '@/components/legal/PageLayout';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadPublicSettingsServer();
  return buildContentPageMetadata(settings, 'terms', {
    title: 'শর্তাবলী | ALMA Lifestyle',
    description:
      'ALMA Lifestyle এর service ব্যবহারের terms and conditions।',
  });
}

export default function TermsPage() {
  return (
    <PageLayout
      slug="terms"
      badge="নীতিমালা"
      heroWord="TERMS"
      title="শর্তাবলী"
      subtitle="ALMA Lifestyle ব্যবহারের নিয়ম ও শর্ত"
      lastUpdated="১ জুন, ২০২৬"
    >
      <h2>স্বীকৃতি</h2>
      <p>
        ALMA Lifestyle (almatraders.com) ব্যবহার করার মাধ্যমে আপনি এই terms এবং conditions মেনে
        নিতে সম্মত হচ্ছেন। যদি কোনো শর্ত আপনার মেনে না নেওয়ার থাকে, অনুগ্রহ করে আমাদের
        website ব্যবহার করা থেকে বিরত থাকুন।
      </p>

      <h2>সংজ্ঞা</h2>
      <ul>
        <li>
          <strong>&quot;আমরা&quot;/&quot;ALMA&quot;:</strong> ALMA Lifestyle এবং সংশ্লিষ্ট entities
        </li>
        <li>
          <strong>&quot;আপনি&quot;/&quot;User&quot;:</strong> Website এর visitor বা customer
        </li>
        <li>
          <strong>&quot;Service&quot;:</strong> Website এ available সব features এবং products
        </li>
        <li>
          <strong>&quot;Products&quot;:</strong> আমাদের sale করা সব items
        </li>
      </ul>

      <h2>অ্যাকাউন্ট তৈরি ও ব্যবহার</h2>
      <ul>
        <li>সঠিক এবং complete তথ্য দিতে হবে account তৈরির সময়</li>
        <li>Password নিরাপদ রাখার দায়িত্ব আপনার</li>
        <li>আপনার account এর সব activity আপনার responsibility</li>
        <li>সন্দেহজনক activity দেখলে আমাদের জানাতে হবে</li>
      </ul>

      <h2>পণ্য ক্রয়</h2>
      <ul>
        <li>সব order acceptance আমাদের approval সাপেক্ষ</li>
        <li>Stock এবং price পরিবর্তন হতে পারে notice ছাড়াই</li>
        <li>ছবি ও বর্ণনা যতটা সম্ভব accurate রাখা হয়, তবে slight variation থাকতে পারে</li>
        <li>রঙ device screen অনুযায়ী একটু আলাদা দেখাতে পারে</li>
      </ul>

      <h2>মূল্য ও পেমেন্ট</h2>
      <ul>
        <li>সব মূল্য বাংলাদেশী টাকায় (৳)</li>
        <li>VAT এবং অন্যান্য charge আলাদাভাবে যোগ হতে পারে</li>
        <li>Payment methods: bKash, Nagad, ক্যাশ অন ডেলিভারি</li>
        <li>Online payment এর ক্ষেত্রে valid transaction ID দিতে হবে</li>
      </ul>

      <h2>ডেলিভারি</h2>
      <p>
        ডেলিভারি সংক্রান্ত বিস্তারিত আমাদের <Link href="/delivery">Delivery Policy</Link> দেখুন।
      </p>

      <h2>ফেরত ও রিফান্ড</h2>
      <p>
        Return এবং refund সংক্রান্ত বিস্তারিত আমাদের <Link href="/refund">Refund Policy</Link>{' '}
        দেখুন।
      </p>

      <h2>ব্যবহার সীমা</h2>
      <p>আপনি ALMA website ব্যবহার করতে পারবেন না:</p>
      <ul>
        <li>Unlawful বা fraudulent উদ্দেশ্যে</li>
        <li>Website এর security ভাঙার চেষ্টায়</li>
        <li>অন্য user দের harass করতে</li>
        <li>Spam বা malicious content পাঠাতে</li>
        <li>Copyright লঙ্ঘন করতে</li>
      </ul>

      <h2>Intellectual Property</h2>
      <p>
        Website এর সব content (ছবি, text, design, logo) ALMA Lifestyle এর property বা licensed।
        আমাদের written permission ছাড়া এগুলো copy, modify, distribute করা যাবে না।
      </p>

      <h2>দায়বদ্ধতার সীমা</h2>
      <ul>
        <li>আমরা পণ্যের quality নিশ্চিত করি, কিন্তু end-use এর responsibility customer এর</li>
        <li>Allergy বা health-related concern এর ক্ষেত্রে আগে check করে নিন</li>
        <li>Third-party services (courier, payment) এর performance এ আমাদের সরাসরি control নেই</li>
        <li>Force majeure (প্রাকৃতিক দুর্যোগ, lockdown ইত্যাদি) এর জন্য আমরা liable না</li>
      </ul>

      <h2>Disclaimer</h2>
      <p>
        Website &quot;as is&quot; basis এ provide করা হয়। আমরা চেষ্টা করি accurate information
        দিতে, তবে error থাকতে পারে। যেকোনো information notice ছাড়াই পরিবর্তন হতে পারে।
      </p>

      <h2>Governing Law</h2>
      <p>
        এই terms বাংলাদেশের আইন অনুযায়ী governed। যেকোনো dispute Dhaka, Bangladesh এর courts এ
        resolve হবে।
      </p>

      <h2>পরিবর্তন</h2>
      <p>
        আমরা যেকোনো সময় এই terms পরিবর্তন করতে পারি। Major changes এর ক্ষেত্রে notification
        পাবেন। Continued use মানে নতুন terms accept করা।
      </p>

      <h2>যোগাযোগ</h2>
      <p>প্রশ্ন থাকলে যোগাযোগ করুন:</p>
      <ul>
        <li>01307-777733</li>
        <li>admin@almatraders.com</li>
      </ul>
    </PageLayout>
  );
}
