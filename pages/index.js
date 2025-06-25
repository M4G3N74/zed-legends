import Head from 'next/head';
import Layout from '../components/layout/Layout';
import SongList from '../components/features/SongList';
import Visualizer from '../components/ui/Visualizer';
import { useLibrary } from '../components/context/LibraryContext';
import SEO from '../components/ui/SEO';

export default function Home() {
  const { isLoading, error } = useLibrary();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicStore",
    "name": "Zed Legends",
    "url": "https://yourdomain.com/",
    "description": "Discover and stream legendary Zambian music.",
    "image": "https://yourdomain.com/images/album-art.png"
  };

  return (
    <>
      <SEO
        title="Zed Legends | Home"
        description="Discover and stream legendary Zambian music. Listen to playlists, like your favorites, and enjoy a beautiful, mobile-first music experience."
        image="/images/album-art.png"
        url="https://zed-legends.vercel.app/"
        jsonLd={jsonLd}
      />
      <Layout>
        <div className="content-area">
          <h2 className="text-2xl font-bold mb-4">Our Music</h2>
          
          {/* Visualizer */}
          <Visualizer />
          
          {/* Song List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mauve"></div>
            </div>
          ) : error ? (
            <div className="bg-love/20 text-love p-4 rounded-lg">
              <p>{error}</p>
            </div>
          ) : (
            <SongList />
          )}
        </div>
      </Layout>
    </>
  );
}
