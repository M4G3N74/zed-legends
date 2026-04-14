'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '../components/layout';
import { Card, AlbumArt } from '../components/ui';
import {
  HeartOutlineIcon,
  HeartIcon,
  MusicIcon,
  PlusIcon,
  PlayIcon,
  ListIcon,
  MoreIcon,
} from '../components/icons';
import { usePlayer } from '../components/player';
import { fetchSongs, Song } from '../../lib/api';
import { useFavorites, useToggleFavorite, usePlaylists } from '../../lib/hooks';

type TabType = 'all' | 'favorites' | 'playlists' | 'recent';

const SONGS_PER_PAGE = 50;

function LibraryContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams
    ? (searchParams.get('tab') as TabType) || 'all'
    : 'all';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSongs, setTotalSongs] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showMenuFor, setShowMenuFor] = useState<string | null>(null);
  const { play, currentSong, playAll } = usePlayer();
  const { data: favorites = [] } = useFavorites();
  const { data: playlists = [] } = usePlaylists();
  const toggleFavorite = useToggleFavorite();

  const likedSongIds = new Set(favorites.map((f) => f.song_id));

  const loadSongs = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const data = await fetchSongs({ page, limit: SONGS_PER_PAGE });
      if (page === 1) {
        setSongs(data.songs);
      } else {
        setSongs((prev) => [...prev, ...data.songs]);
      }
      setTotalSongs(data.total);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to load songs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSongs(1);
  }, [loadSongs]);

  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadSongs(nextPage);
  };

  const handlePlaySong = (song: Song) => {
    play({
      id: song.id,
      title: song.title,
      artist: song.artist,
      audioUrl: song.url,
      path: song.path,
    });
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      const songList = songs.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        audioUrl: s.url,
        path: s.path,
      }));
      playAll(songList, 0);
    }
  };

  const handleToggleLike = (song: Song) => {
    toggleFavorite.mutate(song);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: 'All Songs' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'playlists', label: 'Playlists' },
  ];

  const displayedSongs =
    activeTab === 'favorites'
      ? songs.filter((s) => likedSongIds.has(s.id))
      : songs;

  const totalPages = Math.ceil(totalSongs / SONGS_PER_PAGE);

  return (
    <div className="min-h-screen">
      <Header title="Library" />

      <div className="px-4 pb-8 max-w-7xl mx-auto">
        <div className="flex gap-2 py-4 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-accent text-bg font-semibold shadow-lg shadow-accent/30'
                  : 'glass text-text-secondary hover:text-text hover:bg-white/10'
              }`}
            >
              {tab.id === 'all' && <MusicIcon size={16} />}
              {tab.id === 'favorites' && <HeartOutlineIcon size={16} />}
              {tab.id === 'playlists' && <ListIcon size={16} />}
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'playlists' ? (
          <PlaylistsTab playlists={playlists} />
        ) : activeTab === 'favorites' &&
          favorites.length > 0 &&
          songs.length === 0 ? (
          <LoadingAndFavorites loadSongs={loadSongs} />
        ) : loading && songs.length === 0 ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 glass rounded-xl animate-pulse"
              >
                <div className="w-12 h-12 bg-surface-hover rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-surface-hover rounded w-3/4 mb-2" />
                  <div className="h-3 bg-surface-hover rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedSongs.length === 0 ? (
          <EmptyState
            icon={activeTab === 'favorites' ? 'heart' : 'music'}
            title={activeTab === 'favorites' ? 'No favorites yet' : 'No songs'}
            description={
              activeTab === 'favorites'
                ? 'Like songs to save them here'
                : 'Songs will appear here'
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted">
                {activeTab === 'favorites' ? displayedSongs.length : totalSongs}{' '}
                songs
              </span>
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-bg rounded-full text-sm font-semibold hover:bg-accent-hover transition-all"
              >
                <PlayIcon size={16} />
                Play All
              </button>
            </div>

            <div className="space-y-2">
              {displayedSongs.map((song, i) => (
                <div
                  key={song.id}
                  className="flex items-center gap-4 p-3 glass rounded-xl hover:bg-surface-hover/80 transition-colors cursor-pointer animate-fade-up"
                  style={{ animationDelay: `${i * 10}ms` }}
                >
                  <span className="w-6 text-center text-xs text-muted">
                    {i + 1}
                  </span>
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                    <AlbumArt
                      title={song.title}
                      artist={song.artist}
                      size="md"
                      rounded="lg"
                      className="w-full h-full"
                    />
                    <div
                      className="absolute inset-0 z-10 flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySong(song);
                      }}
                    >
                      <div className="w-6 h-6 rounded-full bg-accent/90 text-bg flex items-center justify-center">
                        <PlayIcon size={10} className="ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-sm truncate ${
                        currentSong?.id === song.id ? 'text-accent' : ''
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="text-xs text-muted truncate">{song.artist}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLike(song);
                    }}
                    className="p-2 text-muted hover:text-love"
                  >
                    {likedSongIds.has(song.id) ? (
                      <HeartIcon size={20} />
                    ) : (
                      <HeartOutlineIcon size={20} />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {activeTab === 'all' && hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 glass rounded-full text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}

            {loading && songs.length > 0 && (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingAndFavorites({
  loadSongs,
}: {
  loadSongs: (page: number) => Promise<void>;
}) {
  useEffect(() => {
    loadSongs(1);
  }, [loadSongs]);

  return (
    <div className="space-y-2">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 glass rounded-xl animate-pulse"
        >
          <div className="w-12 h-12 bg-surface-hover rounded-lg flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-surface-hover rounded w-3/4 mb-2" />
            <div className="h-3 bg-surface-hover rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PlaylistsTab({
  playlists,
}: {
  playlists: { id: string; name: string }[];
}) {
  return (
    <div className="py-8">
      <div className="flex justify-end mb-4">
        <Link
          href="/playlists"
          className="flex items-center gap-2 px-4 py-2 glass rounded-full text-sm hover:bg-white/10 transition-colors"
        >
          <PlusIcon size={16} />
          Create Playlist
        </Link>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-copper/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <MusicIcon size={40} className="text-accent" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No playlists yet</h3>
          <p className="text-sm text-muted mb-6">
            Create playlists to organize your music
          </p>
          <Link
            href="/playlists"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg rounded-full font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/25"
          >
            <PlusIcon size={18} />
            Create Playlist
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlists/${playlist.id}`}
              className="glass rounded-xl p-4 hover:bg-white/5 transition-colors cursor-pointer group"
            >
              <div className="aspect-square bg-gradient-to-br from-accent/30 to-copper/20 rounded-lg mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MusicIcon size={32} className="text-accent/50" />
              </div>
              <p className="text-sm font-medium truncate">{playlist.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: 'heart' | 'music';
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-4">
        {icon === 'heart' ? (
          <HeartOutlineIcon size={40} className="text-love" />
        ) : (
          <MusicIcon size={40} className="text-muted" />
        )}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <Header title="Library" />
          <div className="px-4 pt-4 max-w-7xl mx-auto">
            <div className="h-12 bg-surface rounded-full mb-4 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="bg-surface/50 rounded-xl p-3 animate-pulse"
                >
                  <div className="aspect-square bg-surface-hover rounded-lg mb-3" />
                  <div className="h-4 bg-surface-hover rounded w-3/4 mb-2" />
                  <div className="h-3 bg-surface-hover rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <LibraryContent />
    </Suspense>
  );
}
