import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogShell } from '@/components/blog/BlogShell';
import { bnDate, listCditPosts, minutesToRead } from '@/lib/blog/cdit-posts';

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: 'ব্লগ — পাঞ্জাবি, পরিবারের ম্যাচিং সেট ও কেনাকাটার গাইড | ALMA Lifestyle' },
  description: 'পাঞ্জাবি বাছাই, বাবা-ছেলের ও পুরো পরিবারের ম্যাচিং সেট, সাইজ আর উপলক্ষ ধরে ALMA Lifestyle-এর গাইড ও পরামর্শ।',
  alternates: { canonical: '/blog' },
};

export default async function BlogIndexPage() {
  const posts = await listCditPosts('post');
  return (
    <BlogShell
      badge="ব্লগ"
      heroWord="JOURNAL"
      title="কেনাকাটার গাইড ও পরামর্শ"
      meta="পাঞ্জাবি, পরিবারের ম্যাচিং সেট আর উপলক্ষের সাজ নিয়ে আমাদের লেখা"
      after={
        <div className="blog-list" data-ob-reveal>
          {posts.length === 0 && <p className="bn blog-empty">শিগগিরই প্রথম লেখা আসছে।</p>}
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-card bn">
              <span className="blog-card-meta">{bnDate(p.published_at)} · {minutesToRead(p.words)} মিনিটে পড়া</span>
              <span className="blog-card-title bn-serif">{p.h1 || p.title}</span>
              <span className="blog-card-desc">{p.description}</span>
              <span className="blog-card-more">পুরো লেখা পড়ুন →</span>
            </Link>
          ))}
        </div>
      }
    />
  );
}
