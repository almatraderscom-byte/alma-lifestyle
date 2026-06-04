import { Inter, Playfair_Display } from 'next/font/google';
import { AdminShell } from '@/components/admin/AdminShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-playfair',
});

export const metadata = {
  title: 'ALMA Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
    >
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
