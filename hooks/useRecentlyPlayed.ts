'use client';

import { useState, useEffect } from 'react';

export const useRecentlyPlayed = (userId: string) => {
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecentlyPlayed = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch('/api/recently-played', {
        headers: { Authorization: `Bearer ${userId}` }
      });
      const data = await response.json();
      setRecentlyPlayed(data.recently_played || []);
    } catch (error) {
      console.error('Error fetching recently played:', error);
      setRecentlyPlayed([]);
    } finally {
      setLoading(false);
    }
  };

  const addToRecentlyPlayed = async (songId: string) => {
    if (!userId) return;
    
    try {
      await fetch('/api/recently-played', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`
        },
        body: JSON.stringify({ song_id: songId })
      });
      fetchRecentlyPlayed();
    } catch (error) {
      console.error('Error adding to recently played:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRecentlyPlayed();
    }
  }, [userId]);

  return { recentlyPlayed, loading, addToRecentlyPlayed };
};