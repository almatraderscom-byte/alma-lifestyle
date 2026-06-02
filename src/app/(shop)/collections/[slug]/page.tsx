import { redirect } from 'next/navigation';

/** Legacy mock collection URLs — use the real catalog. */
export default async function CollectionSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/products?category=${encodeURIComponent(slug)}`);
}
