'use client';

import { useState, useEffect } from 'react';

export const useFavorites = (userId: string) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${userId}` }
      });
      const data = await response.json();
      setFavorites(data.favorites?.map((f: any) => f.song_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (songId: string) => {
    if (!userId) return;
    
    const isFavorite = favorites.includes(songId);
    const method = isFavorite ? 'DELETE' : 'POST';
    
    try {
      await fetch('/api/favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`
        },
        body: JSON.stringify({ song_id: songId })
      });
      
      if (isFavorite) {
        setFavorites(prev => prev.filter(id => id !== songId));
      } else {
        setFavorites(prev => [...prev, songId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    }
  }, [userId]);

  return { favorites, loading, toggleFavorite, isFavorite: (songId: string) => favorites.includes(songId) };
};