import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'ALMA Lifestyle — Premium Panjabi Bangladesh';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #2c2c2c 0%, #6b2737 50%, #c97d5d 100%)',
          color: '#F5EBDD',
          fontFamily: 'serif',
          padding: 48,
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: '0.2em' }}>ALMA</div>
        <div style={{ fontSize: 28, marginTop: 24, textAlign: 'center', maxWidth: 900 }}>
          পরিবারের ঐতিহ্যে বোনা প্রতিটি গল্প
        </div>
        <div style={{ fontSize: 18, marginTop: 16, opacity: 0.85 }}>EST. 1971 · DHAKA</div>
      </div>
    ),
    { ...size }
  );
}
