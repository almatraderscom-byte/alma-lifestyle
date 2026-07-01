import type { Metadata } from 'next';
import { PageLayout } from '@/components/legal/PageLayout';

export const metadata: Metadata = {
  title: 'গোপনীয়তা নীতিমালা | ALMA Lifestyle',
  description: 'ALMA Lifestyle আপনার ব্যক্তিগত তথ্য কীভাবে সুরক্ষিত রাখে।',
};

export default function PrivacyPage() {
  return (
    <PageLayout
      badge="নীতিমালা"
      heroWord="PRIVACY"
      title="গোপনীয়তা নীতিমালা"
      subtitle="আপনার তথ্যের নিরাপত্তা আমাদের কাছে অগ্রাধিকার"
      lastUpdated="১ জুন, ২০২৬"
    >
      <h2>ভূমিকা</h2>
      <p>
        ALMA Lifestyle (almatraders.com) আপনার গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ। এই privacy
        policy ব্যাখ্যা করে কীভাবে আমরা আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি।
      </p>

      <h2>আমরা কী তথ্য সংগ্রহ করি</h2>

      <h3>১. ব্যক্তিগত তথ্য (Personal Information)</h3>
      <ul>
        <li>নাম</li>
        <li>মোবাইল নম্বর</li>
        <li>ইমেইল ঠিকানা (যদি দেন)</li>
        <li>ডেলিভারি ঠিকানা</li>
        <li>Payment তথ্য (bKash/Nagad transaction ID)</li>
      </ul>

      <h3>২. অর্ডার সংক্রান্ত তথ্য</h3>
      <ul>
        <li>অর্ডার history</li>
        <li>পছন্দের পণ্যসমূহ</li>
        <li>Browsing behavior</li>
      </ul>

      <h3>৩. Technical Information</h3>
      <ul>
        <li>IP address</li>
        <li>Browser type</li>
        <li>Device information</li>
        <li>Cookies</li>
      </ul>

      <h2>তথ্য কীভাবে ব্যবহার করি</h2>
      <p>আমরা আপনার তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করি:</p>
      <ul>
        <li>আপনার অর্ডার process এবং deliver করার জন্য</li>
        <li>Order status updates এবং communication</li>
        <li>Customer service এবং সাপোর্ট</li>
        <li>Promotional offers এবং new product notifications (আপনার সম্মতিতে)</li>
        <li>Website এর experience উন্নত করার জন্য</li>
        <li>Legal compliance এবং fraud prevention</li>
      </ul>

      <h2>তথ্য সুরক্ষা</h2>
      <p>আপনার তথ্য সুরক্ষিত রাখতে আমরা industry-standard security measures ব্যবহার করি:</p>
      <ul>
        <li>SSL encryption সব data transmission এ</li>
        <li>Secure database storage</li>
        <li>Limited employee access</li>
        <li>Regular security audits</li>
        <li>Payment information PCI-compliant systems এ</li>
      </ul>

      <h2>তথ্য শেয়ার করা</h2>
      <p>আমরা আপনার তথ্য কখনই বিক্রি করি না। তবে কিছু ক্ষেত্রে শেয়ার করতে পারি:</p>
      <ul>
        <li>
          <strong>Courier service:</strong> ডেলিভারির জন্য shipping partner দের সাথে
        </li>
        <li>
          <strong>Payment gateways:</strong> bKash, Nagad এর সাথে transaction processing এর জন্য
        </li>
        <li>
          <strong>Legal requirements:</strong> Law enforcement এর সাথে যদি require হয়
        </li>
        <li>
          <strong>Service providers:</strong> Email, SMS এর জন্য third-party services
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        আমাদের website cookies ব্যবহার করে আপনার experience উন্নত করতে। আপনি browser settings
        থেকে cookies disable করতে পারেন, তবে এতে কিছু feature কাজ নাও করতে পারে।
      </p>

      <h2>আপনার অধিকার</h2>
      <p>আপনার অধিকার আছে:</p>
      <ul>
        <li>আপনার তথ্য access করার</li>
        <li>ভুল তথ্য সংশোধন করার</li>
        <li>তথ্য delete করতে বলার</li>
        <li>Marketing communications থেকে opt-out করার</li>
        <li>আপনার data এর copy চাওয়ার</li>
      </ul>

      <h2>শিশু গোপনীয়তা</h2>
      <p>
        আমাদের service ১৮ বছরের কম বয়সী শিশুদের জন্য না। আমরা জেনেশুনে minors এর কাছ থেকে তথ্য
        সংগ্রহ করি না।
      </p>

      <h2>Third-Party Links</h2>
      <p>
        আমাদের website এ অন্য site এর link থাকতে পারে। ঐ সব site এর policy আমাদের responsibility
        না — তাদের privacy policy আলাদা ভাবে পড়ুন।
      </p>

      <h2>Policy পরিবর্তন</h2>
      <p>
        এই policy যেকোনো সময় update হতে পারে। গুরুত্বপূর্ণ পরিবর্তন হলে আমরা email বা website
        notification দিয়ে জানাব। সর্বদা এই page check করুন current version এর জন্য।
      </p>

      <h2>যোগাযোগ</h2>
      <p>Privacy সংক্রান্ত প্রশ্ন থাকলে যোগাযোগ করুন:</p>
      <ul>
        <li>01307-777733</li>
        <li>admin@almatraders.com</li>
      </ul>
    </PageLayout>
  );
}
