import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogShell } from '@/components/blog/BlogShell';
import { bnDate, extractFaq, getCditPost, jsonLd, postUrl, renderPostMarkdown } from '@/lib/blog/cdit-posts';
import { getSiteUrl } from '@/lib/seo/site-url';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCditPost('post', slug).catch(() => null);
  if (!post) return { title: 'লেখা পাওয়া যায়নি', robots: { index: false } };
  return {
    title: { absolute: post.title },
    description: post.description,
    keywords: post.keyword ? [post.keyword] : undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: 'article', title: post.title, description: post.description, url: postUrl('post', post.slug), publishedTime: post.published_at, modifiedTime: post.updated_at, ...(post.cover_url ? { images: [post.cover_url] } : {}) },
    twitter: { title: post.title, description: post.description },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getCditPost('post', slug);
  if (!post) notFound();
  const words = post.body_md.split(/\s+/).filter(Boolean).length;
  const faq = extractFaq(post.body_md);
  const base = getSiteUrl();
  const schema = [
    {
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.h1 || post.title, description: post.description,
      datePublished: post.published_at, dateModified: post.updated_at, inLanguage: 'bn-BD', mainEntityOfPage: postUrl('post', post.slug),
      author: { '@type': 'Organization', name: 'ALMA Lifestyle', url: base },
      publisher: { '@type': 'Organization', name: 'ALMA Lifestyle', url: base },
      ...(post.cover_url ? { image: post.cover_url } : {}),
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'হোম', item: base },
        { '@type': 'ListItem', position: 2, name: 'ব্লগ', item: `${base}/blog` },
        { '@type': 'ListItem', position: 3, name: post.h1 || post.title, item: postUrl('post', post.slug) },
      ],
    },
    ...(faq.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : []),
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <BlogShell
        badge="ব্লগ"
        heroWord="JOURNAL"
        title={post.h1 || post.title}
        meta={`${bnDate(post.published_at)} · ${Math.max(1, Math.round(words / 180)).toLocaleString('bn-BD')} মিনিটে পড়া`}
        html={renderPostMarkdown(post.body_md)}
      />
    </>
  );
}
