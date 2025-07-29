'use client';

import React from 'react';
import { useRecentlyPlayed } from '../../hooks/useRecentlyPlayed';
import { useLibrary } from '../../components/context/LibraryContext';
import SongItem from '../../components/features/SongItem';

export default function RecentClientPage() {
  const { recentlyPlayed, loading } = useRecentlyPlayed('temp-user-id');
  const { songs } = useLibrary();

  // Show last 10 songs from library as fallback if no recent data
  const displaySongs = recentlyPlayed?.length > 0 
    ? recentlyPlayed.map(item => item.songs || item)
    : songs?.slice(0, 10) || [];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Recently Played</h1>
        <p className="text-muted">
          {recentlyPlayed?.length > 0 ? 'Your recently played songs' : 'Start playing songs to build your recent history'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mauve"></div>
        </div>
      ) : displaySongs.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-clock text-4xl text-muted mb-4"></i>
          <h3 className="text-xl font-medium mb-2">No songs available</h3>
          <p className="text-muted">Check your music library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 lg:gap-3">
          {displaySongs.map((song) => (
            <SongItem key={song.id} song={song} isActive={false} />
          ))}
        </div>
      )}
    </div>
  );
}