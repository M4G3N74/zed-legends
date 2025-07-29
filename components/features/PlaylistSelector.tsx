'use client';

import React, { useState, useEffect } from 'react';

interface PlaylistSelectorProps {
  songId: string;
  userId: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function PlaylistSelector({ songId, userId, isVisible, onClose }: PlaylistSelectorProps) {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/playlists', {
        headers: { Authorization: `Bearer ${userId}` }
      });
      const data = await response.json();
      setPlaylists(data.playlists || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToPlaylist = async (playlistId: string) => {
    try {
      await fetch(`/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`
        },
        body: JSON.stringify({ song_id: songId })
      });
      onClose();
    } catch (error) {
      console.error('Error adding to playlist:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchPlaylists();
    }
  }, [isVisible, userId]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg w-80 max-h-[60vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-overlay">
          <h2 className="text-lg font-bold">Add to Playlist</h2>
          <button onClick={onClose} className="text-muted hover:text-text">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-muted"></i>
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-list text-2xl text-muted mb-2"></i>
              <p className="text-muted text-sm">No playlists found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => addToPlaylist(playlist.id)}
                  className="w-full text-left p-3 bg-background hover:bg-overlay/50 rounded-md transition-colors"
                >
                  <div className="font-medium text-sm">{playlist.name}</div>
                  <div className="text-xs text-muted">{playlist.song_count || 0} songs</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}