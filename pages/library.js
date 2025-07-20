import SEO from '../components/ui/SEO';
import Layout from '../components/layout/Layout';
import SongList from '../components/features/SongList';
import Head from 'next/head';

export default function LibraryPage() {
  return (
    <>
      <Head>
        <title>Zed Legends | Library</title>
        <meta name="description" content="Browse the full library of legendary Zambian music. Infinite scroll, search, and more." />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zed-legends.vercel.app/library" />
        <meta property="og:title" content="Zed Legends | Library" />
        <meta property="og:description" content="Browse the full library of legendary Zambian music. Infinite scroll, search, and more." />
        <meta property="og:image" content="https://zed-legends.vercel.app/images/album-art.png" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://zed-legends.vercel.app/library" />
        <meta name="twitter:title" content="Zed Legends | Library" />
        <meta name="twitter:description" content="Browse the full library of legendary Zambian music. Infinite scroll, search, and more." />
        <meta name="twitter:image" content="https://zed-legends.vercel.app/images/album-art.png" />
      </Head>
      <Layout>
        <SEO
          title="Zed Legends | Library"
          description="Browse the full library of legendary Zambian music. Infinite scroll, search, and more."
        />
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6 text-center">All Songs</h1>
          <SongList />
        </div>
      </Layout>
    </>
  );
} 