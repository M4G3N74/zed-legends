import '../styles/globals.css';
import '../styles/frosted-glass.css';
import { Providers } from './providers';
import BetaBanner from '../components/ui/BetaBanner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zed Legends',
  description: 'A music streaming application with auto-play functionality',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/images/logo.png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </head>
      <body>
        <BetaBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
