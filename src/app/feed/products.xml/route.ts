import { loadCatalogProductsServer } from '@/lib/storefront/server-data';
import { absoluteUrl } from '@/lib/seo/site-url';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const { products } = await loadCatalogProductsServer({ limit: 500, page: 1 });
  const siteUrl = absoluteUrl('/');

  const items = products
    .map((p) => {
      const image =
        p.galleryImages?.[0]?.url ?? p.images?.[0]?.url ?? '';
      const imageLink = image.startsWith('http') ? image : absoluteUrl(image || '/og-image-default.jpg');
      const link = absoluteUrl(`/products/${p.slug}`);
      const availability = p.inStock !== false ? 'in stock' : 'out of stock';
      const description = escapeXml((p.description || p.title).slice(0, 5000));
      const title = escapeXml(p.title);

      return `
    <item>
      <g:id>${escapeXml(p.slug)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${p.price} BDT</g:price>
      <g:brand>ALMA Lifestyle</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>Apparel &amp; Accessories</g:google_product_category>
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>ALMA Lifestyle Products</title>
    <link>${siteUrl}</link>
    <description>ALMA Lifestyle product catalog</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
