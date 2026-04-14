'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MoreIcon,
  PlayIcon,
  ListMusicIcon,
  HeartOutlineIcon,
  ChevronRightIcon,
  PlusIcon,
} from '../icons';
import { usePlayer } from './player-context';
import { usePlaylists, useAddToPlaylist } from '@/lib/hooks';
import Link from 'next/link';

interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl?: string;
  url?: string;
  path?: string;
}

interface SongActionsProps {
  song: Song;
  onToggleLike?: () => void;
  isLiked?: boolean;
  showLike?: boolean;
}

export function SongActions({
  song,
  onToggleLike,
  isLiked,
  showLike = true,
}: SongActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylistSubmenu, setShowPlaylistSubmenu] = useState(false);
  const { play, playNext, addToQueue } = usePlayer();
  const { data: playlists = [] } = usePlaylists();
  const addToPlaylist = useAddToPlaylist();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowPlaylistSubmenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const audioUrl = song.audioUrl || song.url;
  if (!audioUrl) return null;

  const songData = {
    id: song.id,
    title: song.title,
    artist: song.artist,
    audioUrl,
    path: song.path,
    url: audioUrl,
  };

  const handlePlayNext = () => {
    playNext(songData);
    setIsOpen(false);
  };

  const handleAddToQueue = () => {
    addToQueue(songData);
    setIsOpen(false);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    addToPlaylist.mutate(
      { playlistId, song: songData },
      {
        onSuccess: () => {
          setIsOpen(false);
          setShowPlaylistSubmenu(false);
        },
      }
    );
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-full text-muted hover:text-text hover:bg-surface-hover transition-all"
      >
        <MoreIcon size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-xl bg-surface-secondary border border-border shadow-xl overflow-hidden animate-fade-in">
          {!showPlaylistSubmenu ? (
            <div className="py-1">
              <button
                onClick={handlePlayNext}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors text-left"
              >
                <PlayIcon size={16} className="text-accent" />
                Play Next
              </button>
              <button
                onClick={handleAddToQueue}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors text-left"
              >
                <ListMusicIcon size={16} className="text-accent" />
                Add to Queue
              </button>
              <button
                onClick={() => setShowPlaylistSubmenu(true)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors text-left"
              >
                <span className="flex items-center gap-3">
                  <PlusIcon size={16} className="text-copper" />
                  Add to Playlist
                </span>
                <ChevronRightIcon size={16} className="text-muted" />
              </button>
              {showLike && onToggleLike && (
                <button
                  onClick={() => {
                    onToggleLike();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors text-left"
                >
                  <HeartOutlineIcon
                    size={16}
                    className={isLiked ? 'text-love' : 'text-muted'}
                  />
                  {isLiked ? 'Unlike' : 'Like'}
                </button>
              )}
            </div>
          ) : (
            <div className="py-1">
              <button
                onClick={() => setShowPlaylistSubmenu(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors text-left text-muted"
              >
                <ChevronRightIcon size={16} className="rotate-180" />
                Back
              </button>
              <div className="border-t border-border my-1" />
              {playlists.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted">
                  <Link
                    href="/playlists"
                    className="text-accent hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    Create a playlist
                  </Link>
                </div>
              ) : (
                playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors text-left"
                  >
                    <ListMusicIcon size={16} className="text-accent" />
                    {playlist.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
