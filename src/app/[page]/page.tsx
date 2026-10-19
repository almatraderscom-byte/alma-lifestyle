import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogShell } from '@/components/blog/BlogShell';
import { getCditPost, jsonLd, postUrl, renderPostMarkdown } from '@/lib/blog/cdit-posts';

/**
 * A landing page the CDIT desk wrote and the owner approved (e.g. /family-matching). Only paths no other route of
 * this site serves reach here (Next.js matches every fixed route first); anything the ERP does not know is a 404.
 */
export const revalidate = 60;

type Props = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const p = await getCditPost('page', page).catch(() => null);
  if (!p) return { title: 'পাতা পাওয়া যায়নি', robots: { index: false } };
  return {
    title: { absolute: p.title },
    description: p.description,
    keywords: p.keyword ? [p.keyword] : undefined,
    alternates: { canonical: `/${p.slug}` },
    openGraph: { title: p.title, description: p.description, url: postUrl('page', p.slug), ...(p.cover_url ? { images: [p.cover_url] } : {}) },
    twitter: { title: p.title, description: p.description },
  };
}

export default async function CditLandingPage({ params }: Props) {
  const { page } = await params;
  const p = await getCditPost('page', page);
  if (!p) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@type': 'WebPage', name: p.h1 || p.title, description: p.description, url: postUrl('page', p.slug), inLanguage: 'bn-BD' }) }} />
      <BlogShell badge="LIFESTYLE" heroWord="FAMILY" title={p.h1 || p.title} html={renderPostMarkdown(p.body_md)} />
    </>
  );
}
