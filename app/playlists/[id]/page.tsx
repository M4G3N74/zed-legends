'use client';

import { useParams, useRouter } from 'next/navigation';
import { Header } from '../../components/layout';
import { AlbumArt } from '../../components/ui';
import {
  PlayIcon,
  ShuffleIcon,
  ChevronLeftIcon,
  TrashIcon,
} from '../../components/icons';
import {
  usePlaylist,
  useRemoveFromPlaylist,
  useDeletePlaylist,
} from '@/lib/hooks';
import { usePlayer } from '../../components/player';
import { useEffect } from 'react';

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;

  const { data: playlist, isLoading } = usePlaylist(playlistId);
  const removeFromPlaylist = useRemoveFromPlaylist();
  const deletePlaylist = useDeletePlaylist();
  const { play, playAll, currentSong } = usePlayer();

  const handlePlaySong = (song: {
    song_id: string;
    song_title: string;
    song_artist: string;
    song_url: string;
    song_path: string;
  }) => {
    play({
      id: song.song_id,
      title: song.song_title,
      artist: song.song_artist,
      audioUrl: song.song_url,
      path: song.song_path,
    });
  };

  const handlePlayAll = () => {
    if (!playlist || !playlist.songs.length) return;
    const songs = playlist.songs.map((s) => ({
      id: s.song_id,
      title: s.song_title,
      artist: s.song_artist,
      audioUrl: s.song_url,
      path: s.song_path,
    }));
    playAll(songs, 0);
  };

  const handleShuffle = () => {
    if (!playlist || !playlist.songs.length) return;
    const songs = playlist.songs.map((s) => ({
      id: s.song_id,
      title: s.song_title,
      artist: s.song_artist,
      audioUrl: s.song_url,
      path: s.song_path,
    }));
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    playAll(shuffled, 0);
  };

  const handleRemoveSong = async (songId: string) => {
    await removeFromPlaylist.mutateAsync({ playlistId, songId });
  };

  const handleDeletePlaylist = async () => {
    if (confirm(`Delete playlist "${playlist?.name}"?`)) {
      await deletePlaylist.mutateAsync(playlistId);
      router.push('/playlists');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <Header title="Loading..." />
        <div className="px-4 pt-4">
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-lg bg-surface" />
                <div className="flex-1">
                  <div className="h-4 bg-surface rounded w-3/4 mb-1" />
                  <div className="h-3 bg-surface rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="animate-fade-in">
        <Header title="Playlist not found" />
        <div className="px-4 pt-4 text-center py-20">
          <p className="text-muted">This playlist could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Header
        title=""
        rightContent={
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeletePlaylist}
              className="p-2 rounded-full hover:bg-surface-hover transition-colors text-muted hover:text-love"
            >
              <TrashIcon size={20} />
            </button>
          </div>
        }
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted hover:text-text transition-colors"
        >
          <ChevronLeftIcon size={20} />
          <span className="text-sm">Back</span>
        </button>
      </Header>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-accent/30 to-copper/20 flex items-center justify-center flex-shrink-0">
            <MusicIcon size={64} className="text-accent/50" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">{playlist.name}</h1>
            <p className="text-sm text-muted">
              {playlist.song_count}{' '}
              {playlist.song_count === 1 ? 'song' : 'songs'}
            </p>
            {playlist.description && (
              <p className="text-sm text-muted mt-2">{playlist.description}</p>
            )}
          </div>
        </div>

        {playlist.songs.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-bg font-semibold rounded-full hover:bg-accent-hover transition-colors"
            >
              <PlayIcon size={20} />
              Play
            </button>
            <button
              onClick={handleShuffle}
              className="flex items-center gap-2 px-6 py-3 glass rounded-full hover:bg-surface-hover transition-colors"
            >
              <ShuffleIcon size={20} />
              Shuffle
            </button>
          </div>
        )}

        {playlist.songs.length === 0 ? (
          <div className="text-center py-12">
            <MusicIcon size={48} className="text-muted mx-auto mb-4" />
            <p className="text-muted">This playlist is empty</p>
          </div>
        ) : (
          <div className="space-y-1">
            {playlist.songs.map((song, i) => (
              <div
                key={song.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-all group animate-fade-up"
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <button
                  onClick={() => handlePlaySong(song)}
                  className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                >
                  <AlbumArt
                    title={song.song_title}
                    artist={song.song_artist}
                    size="sm"
                    className="w-full h-full"
                  />
                </button>
                <button
                  onClick={() => handlePlaySong(song)}
                  className="flex-1 text-left min-w-0"
                >
                  <p
                    className={`font-medium text-sm truncate ${
                      currentSong?.id === song.song_id ? 'text-accent' : ''
                    }`}
                  >
                    {song.song_title}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {song.song_artist}
                  </p>
                </button>
                <button
                  onClick={() => handleRemoveSong(song.song_id)}
                  className="p-2 text-muted hover:text-love opacity-0 group-hover:opacity-100 transition-all"
                >
                  <TrashIcon size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MusicIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}
