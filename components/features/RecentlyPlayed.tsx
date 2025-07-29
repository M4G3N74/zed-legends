'use client';

import React from 'react';
import { useRecentlyPlayed } from '../../hooks/useRecentlyPlayed';
import { usePlayer } from '../context/SimplePlayerContext';

interface RecentlyPlayedProps {
  userId: string;
}

export default function RecentlyPlayed({ userId }: RecentlyPlayedProps) {
  const { recentlyPlayed, loading } = useRecentlyPlayed(userId);
  const { playSong } = usePlayer();

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="recently-played">
      <h2 className="text-lg font-bold mb-4">Recently Played</h2>
      
      {recentlyPlayed.length === 0 ? (
        <p className="text-muted">No recently played songs</p>
      ) : (
        <div className="space-y-2">
          {recentlyPlayed.slice(0, 10).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-surface cursor-pointer"
              onClick={() => playSong(item.songs)}
            >
              <div className="w-8 h-8 bg-background rounded flex items-center justify-center">
                <i className="fas fa-music text-muted text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-sm">{item.songs.title}</div>
                <div className="text-xs text-muted truncate">{item.songs.artist}</div>
              </div>
              <div className="text-xs text-muted">
                {new Date(item.played_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}