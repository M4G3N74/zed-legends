import './styles/v2.css';
import type { Metadata } from 'next';
import { PlayerProvider, PlayerLayout } from './components/player';
import { BottomNav } from './components/layout';
import { QueryProvider } from './providers/query-provider';
import { AuthProvider } from '@/lib/hooks/use-auth';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://zed-legends.vercel.app';

export const metadata: Metadata = {
  title: 'Zed Legends | Stream Local Music',
  description: 'Bold. Creative. Zambian. Experience music like never before.',
  icons: {
    icon: '/images/logo.png',
  },
  openGraph: {
    title: 'Zed Legends',
    description: 'Bold. Creative. Zambian. Experience music like never before.',
    url: SITE_URL,
    siteName: 'Zed Legends',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Zed Legends - Zambian Music Streaming',
      },
    ],
    locale: 'en_ZM',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zed Legends',
    description: 'Bold. Creative. Zambian. Experience music like never before.',
    images: ['/images/logoa.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="dark bg-bg text-text antialiased">
        <QueryProvider>
          <AuthProvider>
            <PlayerProvider>
              <div className="min-h-screen">
                <main className="pb-32">{children}</main>
                <PlayerLayout />
                <BottomNav />
              </div>
            </PlayerProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
