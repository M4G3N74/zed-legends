'use client';

import { usePlayer } from './player-context';
import {
  PlayIcon,
  PauseIcon,
  ChevronDownIcon,
  TrashIcon,
  MoreIcon,
  ListMusicIcon,
  CloseIcon,
} from '../icons';
import { AlbumArt } from '../ui';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QueueDrawer({ isOpen, onClose }: QueueDrawerProps) {
  const {
    queue,
    queueIndex,
    currentSong,
    isPlaying,
    play,
    removeFromQueue,
    clearQueue,
    playNext,
    addToQueue,
  } = usePlayer();

  if (!isOpen) return null;

  const upcomingSongs = queue.slice(queueIndex + 1);
  const previousSongs = queue.slice(0, queueIndex);

  const handlePlaySong = (song: Song, index: number) => {
    const actualIndex = queue.findIndex((s) => s.id === song.id);
    if (actualIndex !== -1) {
      const newQueue = [...queue];
      const [removed] = newQueue.splice(actualIndex, 1);
      newQueue.splice(queueIndex + 1, 0, removed);
      play(removed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] bg-surface-secondary rounded-t-3xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <ListMusicIcon size={20} className="text-accent" />
            <h2 className="text-lg font-bold">Queue</h2>
            <span className="text-xs text-muted px-2 py-0.5 rounded-full bg-surface">
              {queue.length} songs
            </span>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-love transition-colors px-3 py-1.5 rounded-full hover:bg-love/10"
              >
                <TrashIcon size={14} />
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-hover transition-colors"
            >
              <ChevronDownIcon size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
                <ListMusicIcon size={32} className="text-muted" />
              </div>
              <p className="text-muted">Your queue is empty</p>
              <p className="text-xs text-muted mt-1">
                Add songs to start listening
              </p>
            </div>
          ) : (
            <>
              {previousSongs.length > 0 && (
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                    Previously Played
                  </h3>
                  <div className="space-y-1">
                    {previousSongs.map((song, i) => (
                      <div
                        key={`prev-${song.id}-${i}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-hover group opacity-50"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <AlbumArt
                            title={song.title}
                            artist={song.artist}
                            size="sm"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {song.title}
                          </p>
                          <p className="text-xs text-muted truncate">
                            {song.artist}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handlePlaySong(
                              song,
                              queueIndex - previousSongs.length + i
                            )
                          }
                          className="p-2 opacity-0 group-hover:opacity-100 text-muted hover:text-accent transition-all"
                        >
                          <PlayIcon size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentSong && (
                <div className="p-4 pt-2">
                  <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
                    Now Playing
                  </h3>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-accent/10 to-copper/5 border border-accent/20">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                      <AlbumArt
                        title={currentSong.title}
                        artist={currentSong.artist}
                        size="md"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        {isPlaying ? (
                          <PauseIcon size={24} className="text-white" />
                        ) : (
                          <PlayIcon size={24} className="text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-accent">
                        {currentSong.title}
                      </p>
                      <p className="text-sm text-muted truncate">
                        {currentSong.artist}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  </div>
                </div>
              )}

              {upcomingSongs.length > 0 && (
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                    Up Next
                  </h3>
                  <div className="space-y-1">
                    {upcomingSongs.map((song, i) => (
                      <div
                        key={`upcoming-${song.id}-${i}`}
                        className="group flex items-center gap-3 p-2 rounded-xl hover:bg-surface-hover transition-colors"
                      >
                        <span className="w-6 text-center text-xs text-muted">
                          {i + 1}
                        </span>
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <AlbumArt
                            title={song.title}
                            artist={song.artist}
                            size="sm"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">
                            {song.title}
                          </p>
                          <p className="text-xs text-muted truncate">
                            {song.artist}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              handlePlaySong(song, queueIndex + 1 + i)
                            }
                            className="p-2 text-muted hover:text-accent transition-colors"
                            title="Play now"
                          >
                            <PlayIcon size={16} />
                          </button>
                          <button
                            onClick={() => removeFromQueue(queueIndex + 1 + i)}
                            className="p-2 text-muted hover:text-love transition-colors"
                            title="Remove from queue"
                          >
                            <CloseIcon size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type Song = {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl: string;
  path?: string;
  duration?: number;
};
