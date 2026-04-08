'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '../components/layout';
import { Card, AlbumArt } from '../components/ui';
import {
  HeartOutlineIcon,
  MusicIcon,
  ClockIcon,
  PlusIcon,
  PlayIcon,
  ListIcon,
} from '../components/icons';
import { usePlayer } from '../components/player';
import { fetchSongs, Song } from '../../lib/api';

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
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSongs, setTotalSongs] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const { play, currentSong, isPlaying } = usePlayer();

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

  const toggleLike = (id: string) => {
    setLikedSongs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  const handlePlayAll = () => {
    if (songs.length > 0) handlePlaySong(songs[0]);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: 'All Songs' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'playlists', label: 'Playlists' },
  ];

  const displayedSongs =
    activeTab === 'favorites'
      ? songs.filter((s) => likedSongs.has(s.id))
      : songs;

  const totalPages = Math.ceil(totalSongs / SONGS_PER_PAGE);

  return (
    <div className="min-h-screen">
      <Header title="Library" />

      <div className="px-4 pb-8 max-w-7xl mx-auto">
        {/* Tabs */}
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

        {/* Content */}
        {activeTab === 'playlists' ? (
          <PlaylistsTab />
        ) : loading && songs.length === 0 ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 glass rounded-xl animate-pulse"
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
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 py-2">
              <div>
                <span className="text-sm text-muted">{totalSongs} songs</span>
              </div>
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-bg rounded-full text-sm font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/25"
              >
                <PlayIcon size={16} />
                Play All
              </button>
            </div>

            {/* Songs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {displayedSongs.map((song, i) => (
                <div
                  key={song.id}
                  className="group relative bg-surface/50 backdrop-blur-sm rounded-xl p-3 hover:bg-surface transition-all duration-200 cursor-pointer"
                  onClick={() => handlePlaySong(song)}
                >
                  <div className="relative mb-3">
                    <AlbumArt
                      title={song.title}
                      artist={song.artist}
                      size="md"
                      rounded="lg"
                      className="w-full aspect-square shadow-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-accent text-bg flex items-center justify-center shadow-lg shadow-accent/40 transform scale-90 group-hover:scale-100 transition-transform">
                        <PlayIcon size={22} className="ml-1" />
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(song.id);
                      }}
                      className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all ${
                        likedSongs.has(song.id)
                          ? 'bg-love/80 text-white'
                          : 'bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60'
                      }`}
                    >
                      <HeartOutlineIcon size={16} />
                    </button>
                  </div>
                  <p className="font-medium text-sm truncate">{song.title}</p>
                  <p className="text-xs text-muted truncate">{song.artist}</p>
                </div>
              ))}
            </div>

            {/* Load More */}
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

function PlaylistsTab() {
  return (
    <div className="py-8">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-copper/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
          <MusicIcon size={40} className="text-accent" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No playlists yet</h3>
        <p className="text-sm text-muted mb-6">
          Create playlists to organize your music
        </p>
        <button className="flex items-center gap-2 px-6 py-3 bg-accent text-bg rounded-full font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/25 mx-auto">
          <PlusIcon size={18} />
          Create Playlist
        </button>
      </div>

      {/* Create Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="glass rounded-xl p-4 hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="aspect-square bg-gradient-to-br from-surface to-surface-hover rounded-lg mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
              <PlusIcon
                size={32}
                className="text-muted group-hover:text-accent transition-colors"
              />
            </div>
            <p className="text-sm font-medium">Create New</p>
            <p className="text-xs text-muted">Playlist</p>
          </div>
        ))}
      </div>
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
