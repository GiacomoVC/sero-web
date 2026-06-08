import type { Metadata, Viewport } from 'next';
import { Sora, Caveat } from 'next/font/google';
import { NoZoom } from '@/components/ui/NoZoom';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
  weight: ['400', '600', '700'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Sero — Mismos gustos, mejores planes',
  description:
    'Todo lo que amas merece vivirse con amigos. Convirtámoslo en un plan.',
  openGraph: {
    title: 'Sero — Mismos gustos, mejores planes',
    description: 'Todo lo que amas merece vivirse con amigos.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${sora.variable} ${caveat.variable}`}>
      <body className="font-sans">
        <NoZoom />
        {children}
      </body>
    </html>
  );
}
