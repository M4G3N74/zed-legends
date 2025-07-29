'use client';

import React, { useState, useEffect } from 'react';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
}

interface PlaylistManagerProps {
  userId: string;
}

export default function PlaylistManager({ userId }: PlaylistManagerProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPlaylists = async () => {
    if (!userId) return;
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

  const createPlaylist = async () => {
    if (!userId || !newPlaylistName.trim()) return;
    
    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId}`
        },
        body: JSON.stringify({ 
          name: newPlaylistName.trim(),
          is_public: false 
        })
      });
      const data = await response.json();
      setPlaylists(prev => [data.playlist, ...prev]);
      setNewPlaylistName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [userId]);

  if (loading) return <div className="text-center p-4">Loading playlists...</div>;

  return (
    <div className="playlist-manager">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Playlists</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-mauve text-background rounded-md hover:bg-lavender"
        >
          <i className="fas fa-plus mr-2"></i>
          Create Playlist
        </button>
      </div>

      <div className="grid gap-4">
        {playlists.map(playlist => (
          <div key={playlist.id} className="bg-surface p-4 rounded-md">
            <h3 className="font-medium">{playlist.name}</h3>
            {playlist.description && (
              <p className="text-sm text-muted mt-1">{playlist.description}</p>
            )}
            <div className="flex gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded ${
                playlist.is_public ? 'bg-green/20 text-green' : 'bg-overlay text-muted'
              }`}>
                {playlist.is_public ? 'Public' : 'Private'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Create New Playlist</h3>
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full p-2 bg-background border border-overlay rounded-md mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-muted hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={createPlaylist}
                disabled={!newPlaylistName.trim()}
                className="px-4 py-2 bg-mauve text-background rounded-md hover:bg-lavender disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}