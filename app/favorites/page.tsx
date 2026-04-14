'use client';

import { Header } from '../components/layout';
import { AlbumArt } from '../components/ui';
import { PlayIcon, HeartIcon, ShuffleIcon } from '../components/icons';
import { useFavorites } from '@/lib/hooks';
import { usePlayer } from '../components/player';
import type { Favorite } from '@/lib/database.types';

export default function FavoritesPage() {
  const { data: favorites = [], isLoading } = useFavorites();
  const { play, playAll, currentSong } = usePlayer();

  const handlePlaySong = (favorite: Favorite) => {
    play({
      id: favorite.song_id,
      title: favorite.song_title,
      artist: favorite.song_artist,
      audioUrl: favorite.song_url,
      path: favorite.song_path,
    });
  };

  const handlePlayAll = () => {
    const songs = favorites.map((f) => ({
      id: f.song_id,
      title: f.song_title,
      artist: f.song_artist,
      audioUrl: f.song_url,
      path: f.song_path,
    }));
    if (songs.length > 0) {
      playAll(songs, 0);
    }
  };

  const handleShuffle = () => {
    const songs = favorites.map((f) => ({
      id: f.song_id,
      title: f.song_title,
      artist: f.song_artist,
      audioUrl: f.song_url,
      path: f.song_path,
    }));
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playAll(shuffled, 0);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <Header title="Liked Songs" />
        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-surface mb-2" />
                <div className="h-4 bg-surface rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Header title="Liked Songs" />

      <div className="px-4 pt-4">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-4">
              <HeartIcon size={40} className="text-muted" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No liked songs yet</h3>
            <p className="text-sm text-muted text-center max-w-xs">
              Tap the heart icon on any song to add it to your liked songs
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-bg font-semibold rounded-full hover:bg-accent-hover transition-colors"
              >
                <PlayIcon size={20} />
                Play All
              </button>
              <button
                onClick={handleShuffle}
                className="flex items-center gap-2 px-6 py-3 glass rounded-full hover:bg-surface-hover transition-colors"
              >
                <ShuffleIcon size={20} />
                Shuffle
              </button>
              <span className="text-sm text-muted ml-auto">
                {favorites.length} {favorites.length === 1 ? 'song' : 'songs'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {favorites.map((favorite, i) => (
                <button
                  key={favorite.id}
                  onClick={() => handlePlaySong(favorite)}
                  className="group text-left animate-fade-up rounded-2xl overflow-hidden glass hover:scale-[1.03] transition-all"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="aspect-square relative">
                    <AlbumArt
                      title={favorite.song_title}
                      artist={favorite.song_artist}
                      size="lg"
                      className="w-full h-full rounded-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg">
                        <PlayIcon size={20} className="text-bg ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <HeartIcon size={16} className="text-love" />
                    </div>
                  </div>
                  <div className="p-3">
                    <p
                      className={`font-medium text-sm truncate ${
                        currentSong?.id === favorite.song_id
                          ? 'text-accent'
                          : ''
                      }`}
                    >
                      {favorite.song_title}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {favorite.song_artist}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
