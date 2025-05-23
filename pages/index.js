import Head from 'next/head';
import Layout from '../components/layout/Layout';
import SongList from '../components/features/SongList';
import Visualizer from '../components/ui/Visualizer';
import { useLibrary } from '../components/context/LibraryContext';
import { useEffect } from 'react';

export default function Home() {
  const { fetchSongs, isLoading, error } = useLibrary();

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  return (
    <>
      <Head>
        <title>Zambian Legends | Music Streaming</title>
      </Head>
      <Layout>
        <div className="content-area">
          <h2 className="text-2xl font-bold mb-4">Your Music</h2>
          
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
