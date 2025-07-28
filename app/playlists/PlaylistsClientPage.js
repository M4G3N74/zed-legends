'use client';

import { useEffect, useState } from 'react';
import SongItem from '../../components/features/SongItem.tsx';

export default function PlaylistsClientPage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

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
        <div className="max-w-2xl mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Top 10 Most Liked Songs</h1>
          {loading ? (
            <div className="text-center text-muted">Loading...</div>
          ) : mounted ? (
            <ul className="space-y-2">
              {songs.map(song => (
                <SongItem key={song.id} song={song} isActive={false} />
              ))}
            </ul>
          ) : null /* Render nothing until mounted */}
        </div>
    </>
  );
} 
