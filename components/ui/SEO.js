import Head from 'next/head';

export default function SEO({
  title = 'Zed Legends | Music Streaming',
  description = 'Discover and stream legendary Zambian music. Listen to playlists, like your favorites, and enjoy a beautiful, mobile-first music experience.',
  image = '/images/album-art.png',
  url = '',
  jsonLd = null,
  children
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      {url && <meta property="og:url" content={url} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </Head>
  );
} 