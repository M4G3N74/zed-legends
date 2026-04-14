'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '../components/layout';
import { AlbumArt } from '../components/ui';
import { PlusIcon, MusicIcon, PlayIcon } from '../components/icons';
import {
  usePlaylists,
  useCreatePlaylist,
  useDeletePlaylist,
} from '@/lib/hooks';

export default function PlaylistsPage() {
  const { data: playlists = [], isLoading } = usePlaylists();
  const createPlaylist = useCreatePlaylist();
  const deletePlaylist = useDeletePlaylist();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    await createPlaylist.mutateAsync({ name: newPlaylistName.trim() });
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  const handleDeletePlaylist = async (id: string, name: string) => {
    if (confirm(`Delete playlist "${name}"?`)) {
      await deletePlaylist.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <Header title="My Playlists" />
        <div className="px-4 pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-2xl bg-surface mb-2" />
              <div className="h-4 bg-surface rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Header
        title="My Playlists"
        rightContent={
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-accent text-bg"
          >
            <PlusIcon size={20} />
          </button>
        }
      />

      <div className="px-4 pt-4">
        {playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-4">
              <MusicIcon size={40} className="text-muted" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No playlists yet</h3>
            <p className="text-sm text-muted text-center max-w-xs mb-4">
              Create your first playlist to organize your music
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-bg font-semibold rounded-full hover:bg-accent-hover transition-colors"
            >
              <PlusIcon size={20} />
              Create Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl glass border-dashed border-2 border-border hover:border-accent hover:bg-surface-hover transition-all"
            >
              <div className="w-16 h-16 rounded-xl bg-surface flex items-center justify-center mb-3">
                <PlusIcon size={28} className="text-muted" />
              </div>
              <span className="text-sm font-medium">New Playlist</span>
            </button>

            {playlists.map((playlist, i) => (
              <Link
                key={playlist.id}
                href={`/playlists/${playlist.id}`}
                className="group animate-fade-up rounded-2xl overflow-hidden glass hover:scale-[1.03] transition-all"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="aspect-square relative bg-gradient-to-br from-accent/30 to-copper/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MusicIcon size={48} className="text-accent/50" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                      <PlayIcon size={20} className="text-bg ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm truncate">
                    {playlist.name}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(playlist.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-sm glass rounded-2xl p-6 animate-scale-in">
            <h3 className="text-lg font-semibold mb-4">Create Playlist</h3>
            <form onSubmit={handleCreatePlaylist}>
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full h-12 px-4 glass rounded-xl text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 h-12 glass rounded-xl hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim() || createPlaylist.isPending}
                  className="flex-1 h-12 bg-accent text-bg font-semibold rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {createPlaylist.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
