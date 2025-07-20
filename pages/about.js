import Head from 'next/head';
import Layout from '../components/layout/Layout';

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About | Zed Legends</title>
        <meta name="description" content="Zed Legends is a modern music streaming platform dedicated to celebrating and preserving the legacy of Zambian music." />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zed-legends.vercel.app/about" />
        <meta property="og:title" content="About | Zed Legends" />
        <meta property="og:description" content="Zed Legends is a modern music streaming platform dedicated to celebrating and preserving the legacy of Zambian music." />
        <meta property="og:image" content="https://zed-legends.vercel.app/images/album-art.png" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://zed-legends.vercel.app/about" />
        <meta name="twitter:title" content="About | Zed Legends" />
        <meta name="twitter:description" content="Zed Legends is a modern music streaming platform dedicated to celebrating and preserving the legacy of Zambian music." />
        <meta name="twitter:image" content="https://zed-legends.vercel.app/images/album-art.png" />
      </Head>
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background px-4 py-12">
        <div className="bg-surface rounded-xl shadow-lg p-8 max-w-lg w-full text-center">
          <h1 className="text-3xl font-bold mb-4 text-mauve">About Zed Legends</h1>
          <p className="text-lg text-muted mb-6">
            Zed Legends is a modern music streaming platform dedicated to celebrating and preserving the legacy of Zambian music. Enjoy curated playlists, smart shuffle, downloads, and more—all optimized for mobile and desktop users.
          </p>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Credits</h2>
            <p className="font-bold mb-2 text-color-red">
              All songs rights reserved to their respective owners. if you are the owner of a song and you want it removed, please contact us.
            </p>
            <p className="text-muted">Built with ❤️ from Zambia</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Contact</h2>
            <a href="https://t.me/m4g3n74" className="text-mauve hover:underline">Purple</a>
          </div>
        </div>
      </div>
    </Layout>
  );
} 