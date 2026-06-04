import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-bn-heading text-6xl font-bold text-primary/20" aria-hidden>
        ৪০৪
      </p>
      <h1 className="font-bn-heading text-2xl md:text-3xl font-bold text-primary mt-4">
        পৃষ্ঠাটি পাওয়া যায়নি
      </h1>
      <p className="font-bn-body text-base text-text-light mt-3 max-w-md">
        লিংকটি ভুল হতে পারে, অথবা পণ্যটি সরানো হয়েছে। নিচের বোতাম থেকে দোকানে ফিরে যান।
      </p>
      <Link
        href="/"
        className="mt-8 min-h-12 inline-flex items-center justify-center px-8 rounded-lg bg-accent text-white font-bn-body text-base font-semibold hover:bg-[#b06d4f] transition-colors"
      >
        হোমপেজে ফিরে যান
      </Link>
      <Link
        href="/products"
        className="mt-4 font-bn-body text-sm text-primary underline underline-offset-4"
      >
        সব পণ্য দেখুন
      </Link>
    </div>
  );
}
