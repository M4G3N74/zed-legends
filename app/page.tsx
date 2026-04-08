'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from './components/layout';
import { Card, CardContent, AlbumArt } from './components/ui';
import {
  PlayIcon,
  HeartOutlineIcon,
  MusicIcon,
  ClockIcon,
  ShuffleIcon,
} from './components/icons';
import { usePlayer } from './components/player';
import { fetchSongs, Song } from '../lib/api';

export default function HomePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const { play, currentSong, isPlaying, toggle } = usePlayer();

  useEffect(() => {
    async function loadSongs() {
      try {
        const data = await fetchSongs({ limit: 16 });
        setSongs(data.songs);
      } catch (error) {
        console.error('Failed to load songs:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSongs();
  }, []);

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

  const featuredSongs = songs.slice(0, 8);
  const recentSongs = songs.slice(0, 10);

  return (
    <div className="min-h-screen">
      <Header title="Zed Legends" />

      <div className="px-4 pb-8 space-y-8 max-w-7xl mx-auto">
        {/* Hero Section - Glass Effect */}
        <section className="relative overflow-hidden rounded-2xl glass">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-transparent to-copper/20" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Good evening
                </h2>
                <p className="text-muted text-sm">
                  {songs.length} songs ready to play
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePlayAll}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent text-bg font-semibold rounded-full hover:bg-accent-hover transition-all shadow-lg shadow-accent/25"
                >
                  <PlayIcon size={18} />
                  <span className="hidden sm:inline">Play All</span>
                </button>
                <button
                  onClick={handlePlayAll}
                  className="flex items-center gap-2 px-5 py-2.5 glass border border-white/10 text-text font-medium rounded-full hover:bg-white/10 transition-colors"
                >
                  <ShuffleIcon size={18} />
                  <span className="hidden sm:inline">Shuffle</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Songs - Responsive Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Featured</h3>
            <Link
              href="/library"
              className="text-sm text-accent hover:text-accent-hover"
            >
              See all
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-surface/50 rounded-xl p-3 animate-pulse"
                >
                  <div className="aspect-square bg-surface-hover rounded-lg mb-3" />
                  <div className="h-3 bg-surface-hover rounded w-3/4 mb-2" />
                  <div className="h-2 bg-surface-hover rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {featuredSongs.map((song, i) => (
                <div
                  key={song.id}
                  className="group relative bg-surface/50 backdrop-blur-sm rounded-xl p-3 hover:bg-surface transition-all duration-300 cursor-pointer"
                  onClick={() => handlePlaySong(song)}
                >
                  <div className="relative mb-3">
                    <AlbumArt
                      title={song.title}
                      artist={song.artist}
                      size="lg"
                      rounded="lg"
                      className="w-full aspect-square shadow-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-accent text-bg flex items-center justify-center shadow-lg shadow-accent/40 transform scale-90 group-hover:scale-100 transition-transform">
                        {currentSong?.id === song.id && isPlaying ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggle();
                            }}
                          >
                            <PauseIcon size={22} />
                          </button>
                        ) : (
                          <PlayIcon size={22} className="ml-1" />
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="font-medium text-sm truncate">{song.title}</p>
                  <p className="text-xs text-muted truncate">{song.artist}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Picks - Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ClockIcon size={18} className="text-accent" />
              Quick Picks
            </h3>
          </div>

          {loading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-64 bg-surface/50 rounded-xl p-3 animate-pulse"
                >
                  <div className="flex gap-3">
                    <div className="w-14 h-14 bg-surface-hover rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-surface-hover rounded w-3/4 mb-2" />
                      <div className="h-3 bg-surface-hover rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {recentSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex-shrink-0 w-64 glass rounded-xl p-3 hover:bg-surface-hover/80 transition-colors cursor-pointer group"
                  onClick={() => handlePlaySong(song)}
                >
                  <div className="flex gap-3 items-center">
                    <AlbumArt
                      title={song.title}
                      artist={song.artist}
                      size="md"
                      rounded="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm truncate ${currentSong?.id === song.id ? 'text-accent' : ''}`}
                      >
                        {song.title}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {song.artist}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(song.id);
                      }}
                      className={`p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${likedSongs.has(song.id) ? 'text-love' : 'text-muted hover:text-love'}`}
                    >
                      <HeartOutlineIcon size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/library?tab=favorites"
              className="flex items-center gap-3 p-4 glass rounded-xl hover:bg-surface-hover/80 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-love/20 backdrop-blur-sm flex items-center justify-center">
                <HeartOutlineIcon size={24} className="text-love" />
              </div>
              <div>
                <p className="font-medium text-sm">Favorites</p>
                <p className="text-xs text-muted">{likedSongs.size} songs</p>
              </div>
            </Link>
            <Link
              href="/library"
              className="flex items-center gap-3 p-4 glass rounded-xl hover:bg-surface-hover/80 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/20 backdrop-blur-sm flex items-center justify-center">
                <MusicIcon size={24} className="text-accent" />
              </div>
              <div>
                <p className="font-medium text-sm">Library</p>
                <p className="text-xs text-muted">{songs.length} songs</p>
              </div>
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-3 p-4 glass rounded-xl hover:bg-surface-hover/80 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-info/20 backdrop-blur-sm flex items-center justify-center">
                <SearchIcon size={24} className="text-info" />
              </div>
              <div>
                <p className="font-medium text-sm">Search</p>
                <p className="text-xs text-muted">Find songs</p>
              </div>
            </Link>
            <Link
              href="/library?tab=playlists"
              className="flex items-center gap-3 p-4 glass rounded-xl hover:bg-surface-hover/80 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-success/20 backdrop-blur-sm flex items-center justify-center">
                <ListIcon size={24} className="text-success" />
              </div>
              <div>
                <p className="font-medium text-sm">Playlists</p>
                <p className="text-xs text-muted">0 created</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function PauseIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function SearchIcon({
  size = 24,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function ListIcon({
  size = 24,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
    </svg>
  );
}
