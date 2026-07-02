import type { Metadata } from 'next';
import { loadPublicSettingsServer } from '@/lib/storefront/server-data';
import { buildContentPageMetadata } from '@/lib/seo/default-metadata';
import { PageLayout } from '@/components/legal/PageLayout';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadPublicSettingsServer();
  return buildContentPageMetadata(settings, 'refund', {
    title: 'ফেরত নীতিমালা | ALMA Lifestyle',
    description:
      'ALMA Lifestyle এর return এবং refund policy। সহজ ফেরত প্রক্রিয়া।',
  });
}

export default function RefundPage() {
  return (
    <PageLayout
      slug="refund"
      badge="নীতিমালা"
      heroWord="REFUND"
      title="ফেরত ও রিফান্ড নীতিমালা"
      subtitle="আপনার সন্তুষ্টি আমাদের প্রথম অগ্রাধিকার"
      lastUpdated="১ জুন, ২০২৬"
    >
      <h2>আমাদের প্রতিশ্রুতি</h2>
      <p>
        ALMA Lifestyle এ আমরা চাই আপনি ১০০% সন্তুষ্ট হোন। যদি কোনো কারণে আপনার পণ্যটি পছন্দ না
        হয়, আমাদের সহজ return policy অনুসরণ করতে পারবেন।
      </p>

      <h2>রিটার্ন এর সময়সীমা</h2>
      <p>
        পণ্য receive করার <strong>৭ দিনের মধ্যে</strong> ফেরত দিতে পারবেন।
      </p>

      <h2>কখন ফেরত দেওয়া যাবে</h2>

      <h3>ফেরত গ্রহণযোগ্য</h3>
      <ul>
        <li>পণ্যে production defect বা manufacturing fault থাকলে</li>
        <li>সাইজ মিল না খাওয়া (পোশাকের ক্ষেত্রে)</li>
        <li>রঙ বা ডিজাইনে বড় পার্থক্য থাকলে</li>
        <li>ভুল পণ্য ডেলিভারি দেওয়া হলে</li>
        <li>ক্ষতিগ্রস্ত পণ্য পেলে</li>
        <li>ডুপ্লিকেট/নকল পণ্য সন্দেহ থাকলে</li>
      </ul>

      <h3>ফেরত গ্রহণযোগ্য নয়</h3>
      <ul>
        <li>ব্যবহার করা পণ্য (washed, worn, altered)</li>
        <li>মূল প্যাকেজিং নষ্ট/হারিয়ে গেলে</li>
        <li>Tag ছিড়ে গেলে বা সরিয়ে ফেললে</li>
        <li>৭ দিনের পর ফেরত request করলে</li>
        <li>Personal care items (underwear, perfume etc.)</li>
        <li>Customized/personalized products</li>
        <li>Sale বা clearance items (যদি অন্যথা উল্লেখ না থাকে)</li>
      </ul>

      <h2>ফেরত প্রক্রিয়া</h2>

      <h3>Step 1: যোগাযোগ করুন</h3>
      <p>
        পণ্য receive করার <strong>৭ দিনের মধ্যে</strong> আমাদের সাথে যোগাযোগ করুন:
      </p>
      <ul>
        <li>ফোন/WhatsApp: 01307-777733</li>
        <li>Email: admin@almatraders.com</li>
      </ul>
      <p>নিম্নলিখিত তথ্য প্রস্তুত রাখুন:</p>
      <ul>
        <li>অর্ডার নম্বর</li>
        <li>পণ্যের নাম</li>
        <li>ফেরতের কারণ</li>
        <li>সম্ভব হলে ছবি/ভিডিও</li>
      </ul>

      <h3>Step 2: Approval পান</h3>
      <p>
        আমরা ২৪-৪৮ ঘন্টার মধ্যে আপনার request review করে জানাব। Approval পেলে আমরা return
        shipping এর details দেব।
      </p>

      <h3>Step 3: পণ্য ফেরত পাঠান</h3>
      <p>
        আমাদের courier আপনার থেকে পণ্য collect করবে অথবা আপনি আমাদের ঠিকানায় পাঠাতে পারবেন।
        গুরুত্বপূর্ণ:
      </p>
      <ul>
        <li>মূল প্যাকেজিং সহ পাঠান</li>
        <li>Tag গুলো intact রাখুন</li>
        <li>সব accessories সহ পাঠান</li>
        <li>পণ্য পরিষ্কার রাখুন</li>
      </ul>

      <h3>Step 4: Quality Check</h3>
      <p>পণ্য আমাদের কাছে পৌঁছানোর পর ২-৩ কার্যদিবসে quality check করা হবে।</p>

      <h3>Step 5: Refund প্রদান</h3>
      <p>Quality check পাশ করার পর refund প্রক্রিয়া শুরু হবে।</p>

      <h2>রিফান্ড পদ্ধতি ও সময়</h2>
      <table>
        <thead>
          <tr>
            <th>Payment Method</th>
            <th>Refund Time</th>
            <th>Where</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>bKash</td>
            <td>১-৩ কার্যদিবস</td>
            <td>একই bKash account এ</td>
          </tr>
          <tr>
            <td>Nagad</td>
            <td>১-৩ কার্যদিবস</td>
            <td>একই Nagad account এ</td>
          </tr>
          <tr>
            <td>COD</td>
            <td>৩-৫ কার্যদিবস</td>
            <td>bKash/Nagad এ পাঠানো হবে</td>
          </tr>
        </tbody>
      </table>

      <h2>Exchange (পরিবর্তন)</h2>
      <p>Refund এর পরিবর্তে আপনি চাইলে অন্য পণ্য বা সাইজে exchange করতে পারবেন। Exchange এর ক্ষেত্রে:</p>
      <ul>
        <li>Original product fees এর বেশি দামের পণ্য হলে অতিরিক্ত টাকা দিতে হবে</li>
        <li>কম দামের পণ্য হলে বাকি টাকা refund পাবেন</li>
        <li>Exchange shipping charge আপনাকে বহন করতে হবে</li>
      </ul>

      <h2>Shipping Charge</h2>
      <ul>
        <li>
          <strong>আমাদের ভুলে return:</strong> Free (আমরা বহন করব)
        </li>
        <li>
          <strong>সাইজ পরিবর্তন / অন্য কারণ:</strong> Customer কে courier charge দিতে হবে
        </li>
      </ul>

      <h2>Cancellation Policy</h2>
      <p>
        অর্ডার <strong>shipping এর আগে</strong> cancel করা যাবে। Shipping শুরু হয়ে গেলে
        cancellation আর সম্ভব না — সেক্ষেত্রে return policy follow করতে হবে।
      </p>
      <p>Cancel করতে: 01307-777733 এ call/WhatsApp করুন।</p>

      <h2>গুরুত্বপূর্ণ নোট</h2>
      <ul>
        <li>সব return request lawful এবং reasonable হতে হবে</li>
        <li>আমরা যেকোনো return refuse করার অধিকার রাখি যদি abuse মনে হয়</li>
        <li>Fraudulent return এর ক্ষেত্রে account block হতে পারে</li>
        <li>
          এই policy যেকোনো সময় পরিবর্তন হতে পারে — current version সবসময় website এ থাকবে
        </li>
      </ul>
    </PageLayout>
  );
}
