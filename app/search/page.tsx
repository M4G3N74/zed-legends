'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from '../components/layout';
import { AlbumArt } from '../components/ui';
import {
  SearchIcon,
  MusicIcon,
  CloseIcon,
  PlayIcon,
  MicrophoneIcon,
  FireIcon,
  SparklesIcon,
  ListMusicIcon,
} from '../components/icons';
import { usePlayer } from '../components/player';
import { searchSongs, Song } from '../../lib/api';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { play, currentSong } = usePlayer();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const songs = await searchSongs(searchQuery);
      setResults(songs);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
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

  const suggestions = [
    'Zambia',
    'Hip Hop',
    'Jazz',
    'Afrobeat',
    'Gospel',
    'Urban',
  ];

  const categories = [
    {
      name: 'Local Artists',
      gradient: 'from-copper/40 to-love/20',
      icon: <MicrophoneIcon size={24} />,
    },
    {
      name: 'Trending',
      gradient: 'from-accent/40 to-copper/20',
      icon: <FireIcon size={24} />,
    },
    {
      name: 'New Releases',
      gradient: 'from-success/40 to-accent/20',
      icon: <SparklesIcon size={24} />,
    },
    {
      name: 'Playlists',
      gradient: 'from-love/40 to-success/20',
      icon: <ListMusicIcon size={24} />,
    },
  ];

  return (
    <div className="animate-fade-in">
      <Header title="Search" />

      <div className="px-4 pt-4">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-copper/20 to-love/20 blur-xl opacity-50" />
          <div className="relative">
            <SearchIcon
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search songs, artists..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-12 glass rounded-2xl text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
              >
                <CloseIcon size={18} />
              </button>
            )}
          </div>
        </div>

        {!query ? (
          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider">
                Popular searches
              </h3>
              <div className="flex flex-wrap gap-3">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="px-5 py-2.5 glass rounded-full text-sm text-text-secondary hover:text-text hover:scale-105 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider">
                Browse categories
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className="group relative overflow-hidden rounded-2xl p-5 glass hover:scale-[1.02] transition-transform"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-60 group-hover:opacity-80 transition-opacity`}
                    />
                    <div className="relative flex flex-col items-start gap-3">
                      <div className="text-accent">{category.icon}</div>
                      <span className="font-semibold text-sm">
                        {category.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : isSearching ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
              <MusicIcon size={40} className="text-muted" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-sm text-muted">Try different keywords</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted mb-4">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((song, i) => (
                <button
                  key={song.id}
                  onClick={() => handlePlaySong(song)}
                  className="group text-left animate-fade-up rounded-2xl overflow-hidden glass hover:scale-[1.03] transition-all"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="aspect-square relative">
                    <AlbumArt
                      title={song.title}
                      artist={song.artist}
                      size="lg"
                      className="w-full h-full rounded-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg">
                        <PlayIcon size={20} className="text-bg ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p
                      className={`font-medium text-sm truncate ${
                        currentSong?.id === song.id ? 'text-accent' : ''
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="text-xs text-muted truncate">{song.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
