import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#1e1e2e" />
        <meta name="description" content="Your favorite Zambian legends streaming site" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Zambian Legends" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Zambian Legends" />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon and app icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/images/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/icon-192x192.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* External resources */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
