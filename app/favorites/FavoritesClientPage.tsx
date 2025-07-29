'use client';

import React, { useState, useEffect } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import { useLibrary } from '../../components/context/LibraryContext';
import SongItem from '../../components/features/SongItem';

export default function FavoritesClientPage() {
  const { favorites, loading } = useFavorites('temp-user-id');
  const { songs } = useLibrary();
  const [favoriteSongs, setFavoriteSongs] = useState<any[]>([]);

  useEffect(() => {
    if (favorites && songs) {
      const filteredSongs = songs.filter(song => favorites.includes(song.id));
      setFavoriteSongs(filteredSongs);
    }
  }, [favorites, songs]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Favorites</h1>
        <p className="text-muted">Your favorite songs</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mauve"></div>
        </div>
      ) : !favoriteSongs || favoriteSongs.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-heart text-4xl text-muted mb-4"></i>
          <h3 className="text-xl font-medium mb-2">No favorites yet</h3>
          <p className="text-muted">Heart some songs to add them to your favorites.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 lg:gap-3">
          {favoriteSongs.map((song) => (
            <SongItem key={song.id} song={song} isActive={false} />
          ))}
        </div>
      )}
    </div>
  );
}