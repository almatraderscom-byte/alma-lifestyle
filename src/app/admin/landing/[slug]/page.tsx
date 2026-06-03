import { notFound } from 'next/navigation';
import { LandingContentEditor } from '@/components/admin/landing/LandingContentEditor';
import { getDefaultMurdaMoshariContent } from '@/lib/murda-moshari-default-content';
import { MURDA_MOSHARI_SLUG } from '@/lib/landing-content-types';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { getLandingContent } from '@/server/db/queries/landing-content';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const TITLES: Record<string, string> = {
  [MURDA_MOSHARI_SLUG]: 'স্মার্ট মুর্দা মশারী',
};

export default async function AdminLandingEditPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug !== MURDA_MOSHARI_SLUG) {
    notFound();
  }

  const content =
    isSupabaseAdminConfigured()
      ? (await getLandingContent(slug)) ?? getDefaultMurdaMoshariContent()
      : getDefaultMurdaMoshariContent();

  return (
    <LandingContentEditor
      slug={slug}
      productTitle={TITLES[slug] ?? slug}
      initialContent={content}
    />
  );
}
