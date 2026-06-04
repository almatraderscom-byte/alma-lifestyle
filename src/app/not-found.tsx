import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-cream px-4 py-16 text-center">
      <p className="font-bn-heading text-6xl font-bold text-charcoal/15" aria-hidden>
        ৪০৪
      </p>
      <h1 className="font-bn-heading text-2xl md:text-3xl font-bold text-charcoal mt-4">
        এই পাতা খুঁজে পাওয়া যাচ্ছে না
      </h1>
      <p className="font-bn-body text-base text-neutral-600 mt-3 max-w-md">
        লিংকটি ভুল হতে পারে, অথবা পৃষ্ঠাটি সরানো হয়েছে। নিচের বোতাম থেকে হোমপেজে ফিরে যান।
      </p>
      <Link
        href="/"
        className="mt-8 min-h-12 inline-flex items-center justify-center px-8 rounded-lg bg-[#C97D5D] text-white font-bn-body text-base font-semibold hover:bg-[#b06d4f] transition-colors"
      >
        হোমপেজে ফিরে যান
      </Link>
      <Link
        href="/products"
        className="mt-4 font-bn-body text-sm text-charcoal underline underline-offset-4"
      >
        সব পণ্য দেখুন
      </Link>
    </div>
  );
}
