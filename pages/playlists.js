import SEO from '../components/ui/SEO';
import { useEffect, useState } from 'react';
import SongItem from '../components/features/SongItem';
import Layout from '../components/layout/Layout';
import Head from 'next/head';

export default function PlaylistsPage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopSongs() {
      setLoading(true);
      // Get top 10 most liked song IDs
      const mostLikedRes = await fetch('/api/songs/most-liked');
      const { mostLiked } = await mostLikedRes.json();
      // Get all songs
      const allSongsRes = await fetch('/api/songs');
      const { songs: allSongs } = await allSongsRes.json();
      // Filter to top 10
      const topSongs = mostLiked
        .map(id => allSongs.find(song => String(song.id) === String(id)))
        .filter(Boolean);
      setSongs(topSongs);
      setLoading(false);
    }
    fetchTopSongs();
  }, []);

  return (
    <>
      <Head>
        <title>Zed Legends | Top 10 Playlists</title>
        <meta name="description" content="Listen to the top 10 most liked Zambian songs on Zed Legends. Updated dynamically by user likes." />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zed-legends.vercel.app/playlists" />
        <meta property="og:title" content="Zed Legends | Top 10 Playlists" />
        <meta property="og:description" content="Listen to the top 10 most liked Zambian songs on Zed Legends. Updated dynamically by user likes." />
        <meta property="og:image" content="https://zed-legends.vercel.app/images/album-art.png" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://zed-legends.vercel.app/playlists" />
        <meta name="twitter:title" content="Zed Legends | Top 10 Playlists" />
        <meta name="twitter:description" content="Listen to the top 10 most liked Zambian songs on Zed Legends. Updated dynamically by user likes." />
        <meta name="twitter:image" content="https://zed-legends.vercel.app/images/album-art.png" />
      </Head>
      <Layout>
        <SEO
          title="Zed Legends | Top 10 Playlists"
          description="Listen to the top 10 most liked Zambian songs on Zed Legends. Updated dynamically by user likes."
        />
        <div className="max-w-2xl mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Top 10 Most Liked Songs</h1>
          {loading ? (
            <div className="text-center text-muted">Loading...</div>
          ) : (
            <ul className="space-y-2">
              {songs.map(song => (
                <SongItem key={song.id} song={song} isActive={false} />
              ))}
            </ul>
          )}
        </div>
      </Layout>
    </>
  );
} 