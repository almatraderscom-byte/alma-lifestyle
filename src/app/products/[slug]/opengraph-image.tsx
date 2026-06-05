import { ImageResponse } from 'next/og';
import { loadProductBySlugServer } from '@/lib/storefront/server-data';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function ProductOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await loadProductBySlugServer(slug);
  const title = product?.title ?? 'ALMA Lifestyle';
  const price = product?.price ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#F5EBDD',
          padding: 56,
        }}
      >
        <div style={{ fontSize: 32, color: '#c97d5d', letterSpacing: '0.15em' }}>ALMA LIFESTYLE</div>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#2c2c2c', lineHeight: 1.2 }}>
          {title.slice(0, 80)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#6b2737' }}>
            ৳ {price.toLocaleString('en-US')}
          </div>
          <div style={{ fontSize: 20, color: '#2c2c2c' }}>almatraders.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
