import './styles/v2.css';
import type { Metadata } from 'next';
import { PlayerProvider, PlayerLayout } from './components/player';
import { BottomNav } from './components/layout';

export const metadata: Metadata = {
  title: 'Zed Legends | Music Streaming',
  description: 'Bold. Creative. Zambian. Experience music like never before.',
  icons: {
    icon: '/images/logo.png',
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
        <PlayerProvider>
          <div className="min-h-screen">
            <main className="pb-32">{children}</main>
            <PlayerLayout />
            <BottomNav />
          </div>
        </PlayerProvider>
      </body>
    </html>
  );
}
